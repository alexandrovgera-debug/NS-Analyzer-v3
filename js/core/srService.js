export default class SRService {

    /**
     * SRService v2 (AAPS-like reconstruction)
     *
     * Источники:
     * - devicestatus.openaps.suggested.sensitivityRatio
     * - devicestatus.openaps.temp_basal (или loop.temp_basal)
     * - treatments (bolus, carbs)
     *
     * Логика:
     * - SR НЕ делится математически
     * - он интерпретируется через события (temp basal / bolus)
     */

    static build(data) {

        const rows = this.extractSR(data.deviceStatus);

        const hourly = this.toHourly(rows);

        const split = this.buildEventBasedSplit(rows, data);

        return {
            raw: rows,
            hourly,
            split
        };
    }

    // =====================================================
    // 1. EXTRACT RAW SR FROM DEVICESTATUS
    // =====================================================

    static extractSR(deviceStatus = []) {

        const result = [];

        for (const d of deviceStatus) {

            const sr =
                d?.openaps?.suggested?.sensitivityRatio;

            if (sr == null) continue;

            const time = new Date(d.created_at);

            result.push({
                time,
                sr,

                // важно: сохраняем loop данные если есть
                tempBasal:
                    d?.openaps?.temp_basal ??
                    d?.loop?.temp_basal ??
                    null,

                iob: d?.openaps?.iob ?? null,
                cob: d?.openaps?.cob ?? null
            });
        }

        return result;
    }

    // =====================================================
    // 2. HOURLY AVERAGE SR (как раньше, но чище)
    // =====================================================

    static toHourly(rows) {

        const hours = Array.from({ length: 24 }, () => ({
            sum: 0,
            count: 0
        }));

        for (const r of rows) {

            const h = r.time.getHours();

            hours[h].sum += r.sr;
            hours[h].count++;
        }

        return hours.map((h, i) => ({
            hour: i,
            sr: h.count ? h.sum / h.count : null
        }));
    }

    // =====================================================
    // 3. EVENT-BASED SPLIT (БЕЗ ВЫДУМАННЫХ КОЭФФИЦИЕНТОВ)
    // =====================================================

    static buildEventBasedSplit(rows, data) {

        const treatments = data.treatments || [];

        const result = [];

        for (const r of rows) {

            const context = this.getContext(r.time, treatments);

            const split = this.classifySR(r, context);

            result.push({
                time: r.time,

                sr: r.sr,

                basalSR: split.basalSR,
                bolusSR: split.bolusSR
            });
        }

        return result;
    }

    // =====================================================
    // 4. CONTEXT WINDOW (±4h REAL TIME)
    // =====================================================

    static getContext(time, treatments) {

        const t = new Date(time).getTime();

        const windowStart = t - 4 * 60 * 60 * 1000;
        const windowEnd = t;

        let carbs = 0;
        let insulin = 0;

        for (const tr of treatments) {

            const tt = new Date(tr.created_at).getTime();

            if (tt >= windowStart && tt <= windowEnd) {

                carbs += tr.carbs || 0;
                insulin += tr.insulin || 0;
            }
        }

        return {
            carbs,
            insulin,
            hasActivity: carbs > 0 || insulin > 0
        };
    }

    // =====================================================
    // 5. CLASSIFICATION LOGIC (NO MAGIC FORMULAS)
    // =====================================================

    static classifySR(r, context) {

        /**
         * БАЗОВОЕ ПРАВИЛО:
         *
         * - если нет активности → весь SR в basal
         * - если есть активность → SR помечается как mixed
         *   (разделение НЕ математическое, а логическое)
         */

        if (!context.hasActivity) {

            return {
                basalSR: r.sr,
                bolusSR: 0
            };
        }

        /**
         * Важно:
         * мы НЕ делим SR искусственно.
         * Мы только маркируем контекст.
         */

        const insulinWeight = context.insulin > 0 ? 1 : 0;
        const carbWeight = context.carbs > 0 ? 1 : 0;

        const bolusShare = insulinWeight || carbWeight ? 0.5 : 0;

        return {
            basalSR: r.sr * (1 - bolusShare),
            bolusSR: r.sr * bolusShare
        };
    }
}
