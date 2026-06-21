export default class CRAnalyzer {

    /**
     * CR v2 (event-based estimation)
     *
     * Идея:
     * CR = carbs / insulin needed for stabilization window
     *
     * Берём:
     * - treatments (carbs + insulin)
     * - entries (glucose response)
     */

    analyze(srRows, profile) {

        const carbs = this.extractCarbEvents(srRows);
        const insulin = this.extractInsulinEvents(srRows);

        const pairs = this.matchEvents(carbs, insulin);

        const cr = this.estimateCR(pairs);

        return {
            current: profile?.cr || null,
            recommended: cr,
            samples: pairs.length
        };
    }

    // ---------------- CARBS ----------------

    extractCarbEvents(rows) {

        return rows
            .filter(r => (r.carbs || 0) > 0)
            .map(r => ({
                time: r.time,
                carbs: r.carbs
            }));
    }

    // ---------------- INSULIN ----------------

    extractInsulinEvents(rows) {

        return rows
            .filter(r => (r.insulin || 0) > 0)
            .map(r => ({
                time: r.time,
                insulin: r.insulin
            }));
    }

    // ---------------- MATCHING ----------------

    matchEvents(carbs, insulin) {

        const pairs = [];

        for (const c of carbs) {

            const windowStart = new Date(c.time).getTime();
            const windowEnd = windowStart + 4 * 60 * 60 * 1000;

            let matchedInsulin = 0;

            for (const i of insulin) {

                const t = new Date(i.time).getTime();

                if (t >= windowStart && t <= windowEnd) {
                    matchedInsulin += i.insulin;
                }
            }

            if (matchedInsulin > 0) {

                pairs.push({
                    carbs: c.carbs,
                    insulin: matchedInsulin
                });
            }
        }

        return pairs;
    }

    // ---------------- ESTIMATION ----------------

    estimateCR(pairs) {

        if (!pairs.length) return null;

        let totalCarbs = 0;
        let totalInsulin = 0;

        for (const p of pairs) {
            totalCarbs += p.carbs;
            totalInsulin += p.insulin;
        }

        if (totalInsulin === 0) return null;

        return totalCarbs / totalInsulin;
    }
}
