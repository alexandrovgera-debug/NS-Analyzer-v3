export default class BasalAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    analyze(hourSR, basalSRByHour, treatmentsByHour, shiftMinutes = 60) {

        const result = [];

        for (let h = 0; h < 24; h++) {

            const sr = hourSR[h]?.avg ?? 1;
            const profileBasal = this.getBasalByHour(h);

            const noTherapy4h = this.checkNoTherapy4h(h, treatmentsByHour);

            let basalSR = sr;
            let bolusSR = 0;

            // если были вмешательства → SR делится
            if (!noTherapy4h) {

                basalSR = sr * 0.5;
                bolusSR = sr - basalSR;
            }

            const factor = basalSR;

            const suggestedBasal = profileBasal * factor;

            result.push({
                hour: h,
                sr,
                basalSR,
                bolusSR,
                currentBasal: profileBasal,
                suggestedBasal,
                clean: noTherapy4h
            });
        }

        return result;
    }

    checkNoTherapy4h(hour, treatmentsByHour) {

        const WINDOW = 4;

        for (let i = 1; i <= WINDOW; i++) {

            const idx = hour - i;

            if (idx < 0) continue;

            const t = treatmentsByHour?.[idx] || [];

            if (t.some(x => (x.carbs > 0 || x.insulin > 0))) {
                return false;
            }
        }

        return true;
    }

    getBasalByHour(hour) {

        const basal = this.profile?.basal || [];

        for (let i = 0; i < basal.length; i++) {

            const current = basal[i];
            const next = basal[i + 1];

            const start = this.toHour(current.time);
            const end = next ? this.toHour(next.time) : 24;

            if (hour >= start && hour < end) {
                return current.value;
            }
        }

        return basal.length ? basal[0].value : 0;
    }

    toHour(t) {

        const [h, m] = t.split(":").map(Number);

        return h + m / 60;
    }
}
