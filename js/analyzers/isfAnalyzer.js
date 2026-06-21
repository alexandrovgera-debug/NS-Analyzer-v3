export default class ISFAnalyzer {

    /**
     * ISF v2 (glucose response based)
     *
     * Идея:
     * ISF = delta glucose / insulin
     *
     * Берём:
     * - entries (glucose curve)
     * - treatments (insulin)
     */

    analyze(srRows, profile) {

        const insulinEvents = this.extractInsulin(srRows);

        const responses = this.calculateResponses(srRows, insulinEvents);

        const isf = this.estimateISF(responses);

        return {
            current: profile?.isf || null,
            recommended: isf,
            samples: responses.length
        };
    }

    // ---------------- INSULIN EVENTS ----------------

    extractInsulin(rows) {

        return rows
            .filter(r => (r.insulin || 0) > 0)
            .map(r => ({
                time: r.time,
                insulin: r.insulin
            }));
    }

    // ---------------- GLUCOSE RESPONSE ----------------

    calculateResponses(rows, insulinEvents) {

        const responses = [];

        for (const i of insulinEvents) {

            const start = new Date(i.time).getTime();
            const end = start + 4 * 60 * 60 * 1000;

            const before = this.getGlucoseAt(rows, start);
            const after = this.getGlucoseAt(rows, end);

            if (before == null || after == null) continue;

            const delta = before - after;

            if (i.insulin > 0 && delta !== 0) {

                responses.push({
                    insulin: i.insulin,
                    delta
                });
            }
        }

        return responses;
    }

    // ---------------- GET GLUCOSE ----------------

    getGlucoseAt(rows, time) {

        let closest = null;
        let minDiff = Infinity;

        for (const r of rows) {

            const t = new Date(r.time).getTime();

            const diff = Math.abs(t - time);

            if (diff < minDiff && r.glucose != null) {
                minDiff = diff;
                closest = r.glucose;
            }
        }

        return closest;
    }

    // ---------------- ESTIMATION ----------------

    estimateISF(responses) {

        if (!responses.length) return null;

        let totalDelta = 0;
        let totalInsulin = 0;

        for (const r of responses) {
            totalDelta += r.delta;
            totalInsulin += r.insulin;
        }

        if (totalInsulin === 0) return null;

        return totalDelta / totalInsulin;
    }
}
