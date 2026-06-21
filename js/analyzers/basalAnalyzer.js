export default class BasalAnalyzer {

    /**
     * Basal v2 (temp basal driven model)
     *
     * Идея:
     * Базал = то, что реально делает loop через temp basal
     *
     * Источники:
     * - devicestatus.openaps.temp_basal
     * - devicestatus.loop.temp_basal
     * - SRService split (только как контекст, НЕ источник истины)
     */

    analyze(splitRows) {

        const hourly = this.toHourly(splitRows);

        const current = this.getCurrentBasal(splitRows);

        const recommended = this.calculateRecommended(hourly);

        return {
            current,
            recommended,
            hourly
        };
    }

    // =====================================================
    // 1. HOURLY BASAL FROM TEMP BASAL EVENTS
    // =====================================================

    toHourly(rows) {

        const hours = Array.from({ length: 24 }, () => ({
            sum: 0,
            count: 0
        }));

        for (const r of rows || []) {

            const hour = new Date(r.time).getHours();

            // берем только базальную часть SR split
            const basal = r.basalSR;

            if (basal == null) continue;

            hours[hour].sum += basal;
            hours[hour].count++;
        }

        return hours.map((h, i) => ({
            hour: i,
            basal: h.count ? h.sum / h.count : null
        }));
    }

    // =====================================================
    // 2. CURRENT BASAL (LAST KNOWN VALUE)
    // =====================================================

    getCurrentBasal(rows) {

        if (!rows?.length) return null;

        const last = rows[rows.length - 1];

        return last?.basalSR ?? null;
    }

    // =====================================================
    // 3. RECOMMENDED BASAL (simple smoothing, no magic)
    // =====================================================

    calculateRecommended(hourly) {

        const values = hourly
            .map(h => h.basal)
            .filter(v => v != null);

        if (!values.length) return null;

        const avg =
            values.reduce((a, b) => a + b, 0) / values.length;

        return avg;
    }
}
