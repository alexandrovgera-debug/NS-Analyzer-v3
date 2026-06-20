export default class SRAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    analyze(deviceStatus, treatments, shiftMinutes = 60) {

        const rows = [];

        for (const ds of deviceStatus || []) {

            const sr = ds?.openaps?.suggested?.sensitivityRatio;
            if (sr == null) continue;

            const time = new Date(ds.created_at || ds.date);

            // Fiasp shift
            const shifted = new Date(time.getTime() - shiftMinutes * 60000);

            rows.push({
                time: shifted,
                sr
            });
        }

        return rows;
    }

    buildHourly(rows) {

        const hours = Array.from({ length: 24 }, () => ({
            sum: 0,
            count: 0,
            avg: 1
        }));

        for (const r of rows) {

            const h = r.time.getHours();

            hours[h].sum += r.sr;
            hours[h].count += 1;
        }

        for (const h of hours) {

            if (h.count > 0) {
                h.avg = h.sum / h.count;
            }
        }

        return hours;
    }

    splitSRByTherapy(rows, treatments) {

        const result = [];

        for (const r of rows) {

            const t = this.findNearbyTreatment(r.time, treatments);

            let basalSR = r.sr;
            let bolusSR = 0;

            if (t) {

                const carbs = t.carbs || 0;
                const insulin = t.insulin || 0;

                if (carbs > 0 || insulin > 0) {

                    // делим SR: часть на базал, часть на болюс
                    const bolusFactor = 0.5;
                    bolusSR = r.sr * bolusFactor;
                    basalSR = r.sr - bolusSR;
                }
            }

            result.push({
                time: r.time,
                basalSR,
                bolusSR
            });
        }

        return result;
    }

    findNearbyTreatment(time, treatments) {

        const WINDOW = 3 * 60 * 60 * 1000; // 3 часа

        return (treatments || []).find(t => {

            const tt = new Date(t.created_at || t.date);

            return Math.abs(tt - time) < WINDOW;

        });
    }
}
