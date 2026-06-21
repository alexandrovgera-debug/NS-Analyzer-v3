export default class TimeGridAggregator {

    /**
     * Главная функция:
     * превращает сырой Nightscout data → 24h grid
     */
    static build(data) {

        const hours = this.initHours();

        this.fillGlucose(hours, data.entries);
        this.fillSR(hours, data.sr?.split || []);
        this.fillTreatments(hours, data.treatments);

        return hours;
    }

    // ---------------- INIT ----------------

    static initHours() {

        return Array.from({ length: 24 }, (_, h) => ({
            hour: h,

            glucose: [],
            sr: [],

            bolus: 0,
            carbs: 0,
            insulin: 0,

            iob: 0,
            cob: 0
        }));
    }

    // ---------------- GLUCOSE ----------------

    static fillGlucose(hours, entries = []) {

        for (const e of entries) {

            const h = new Date(e.dateString || e.date).getHours();

            hours[h].glucose.push(e.sgv || 0);
        }

        for (const h of hours) {

            h.glucose =
                h.glucose.length
                    ? h.glucose.reduce((a, b) => a + b, 0) / h.glucose.length
                    : null;
        }
    }

    // ---------------- SR ----------------

    static fillSR(hours, srRows = []) {

        for (const r of srRows) {

            const h = new Date(r.time).getHours();

            hours[h].sr.push(r.basalSR ?? r.sr ?? 0);
        }

        for (const h of hours) {

            h.sr =
                h.sr.length
                    ? h.sr.reduce((a, b) => a + b, 0) / h.sr.length
                    : null;
        }
    }

    // ---------------- TREATMENTS ----------------

    static fillTreatments(hours, treatments = []) {

        for (const t of treatments) {

            const h = new Date(t.created_at).getHours();

            hours[h].carbs += t.carbs || 0;
            hours[h].insulin += t.insulin || 0;
        }

        // ---------------- IOB / COB (UPROSHCHENO) ----------------

        let iob = 0;
        let cob = 0;

        for (const h of hours) {

            // очень упрощённая модель:
            iob = Math.max(0, iob + h.insulin - 1);
            cob = Math.max(0, cob + h.carbs - 5);

            h.iob = iob;
            h.cob = cob;
        }
    }
}
