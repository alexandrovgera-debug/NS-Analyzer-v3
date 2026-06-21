export default class CRAnalyzer {

    constructor() {}

    analyze(srData, profile) {

        const crProfile = profile?.cr || [];

        const intervals = this.buildIntervals(crProfile);

        const result = [];

        for (const i of intervals) {

            const srAvg = this.calcAvgSR(srData, i.start, i.end, "bolusSR");

            const currentCR = i.value;

            const suggestedCR =
                currentCR * this.adjustFactor(srAvg);

            result.push({
                start: i.start,
                end: i.end,
                srAvg,
                currentCR,
                suggestedCR
            });
        }

        return result;
    }

    buildIntervals(profileArray) {

        const out = [];

        for (let i = 0; i < profileArray.length; i++) {

            const cur = profileArray[i];
            const next = profileArray[i + 1];

            out.push({
                start: this.toHour(cur.time),
                end: next ? this.toHour(next.time) : 24,
                value: cur.value
            });
        }

        return out;
    }

    calcAvgSR(srData, start, end, field) {

        let sum = 0;
        let count = 0;

        for (const r of srData || []) {

            const h = r.time.getHours();

            if (h >= start && h < end) {

                sum += r[field] || 0;
                count++;
            }
        }

        return count ? sum / count : 0;
    }

    adjustFactor(srAvg) {

        if (!srAvg) return 1;

        // чем выше bolusSR → тем сильнее корректируем CR
        const v = srAvg;

        return 1 + Math.max(-0.3, Math.min(0.3, v / 2));
    }

    toHour(t) {

        const [h, m] = t.split(":").map(Number);

        return h + m / 60;
    }
}
