export default class SRService {

    /**
     * Основная сборка SR
     * - берём devicestatus
     * - применяем сдвиг 60 минут (FiAsp логика)
     * - строим hourly SR
     * - делим на basal / bolus
     */
    static build(data) {

        const shiftMinutes = 60;

        const rows = this.extractSR(data.deviceStatus, shiftMinutes);

        const hourly = this.toHourly(rows);

        const split = this.splitByTherapy(rows, data.treatments);

        return {
            raw: rows,
            hourly,
            split
        };
    }

    /**
     * Из devicestatus достаём SR
     * + применяем временной сдвиг
     */
    static extractSR(deviceStatus, shiftMinutes) {

        const result = [];

        for (const d of deviceStatus || []) {

            const sr =
                d?.openaps?.suggested?.sensitivityRatio;

            if (sr === undefined) continue;

            const time = new Date(d.created_at);

            // Сдвиг 60 минут (FiAsp / задержка действия)
            time.setMinutes(time.getMinutes() + shiftMinutes);

            result.push({
                time,
                sr
            });
        }

        return result;
    }

    /**
     * Упрощение до 24h массива
     */
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
            sr: h.count ? h.sum / h.count : 0
        }));
    }

    /**
     * Разделение SR:
     *
     * - если 4 часа без еды и инсулина → 100% basal
     * - иначе → часть уходит в bolus
     */
    static splitByTherapy(rows, treatments) {

        const result = [];

        for (const r of rows) {

            const hour = r.time.getHours();

            const context = this.getContext(hour, treatments);

            const split = this.splitSR(r.sr, context);

            result.push({
                time: r.time,
                sr: r.sr,
                basalSR: split.basalSR,
                bolusSR: split.bolusSR
            });
        }

        return result;
    }

    /**
     * Контекст 4 часа назад
     */
    static getContext(hour, treatments) {

        let carbs = 0;
        let insulin = 0;

        for (let i = 0; i < 4; i++) {

            const h = hour - i;
            if (h < 0) continue;

            for (const t of treatments || []) {

                const th = new Date(t.created_at).getHours();

                if (th === h) {

                    carbs += t.carbs || 0;
                    insulin += t.insulin || 0;
                }
            }
        }

        return {
            carbs,
            insulin,
            clean: carbs === 0 && insulin === 0
        };
    }

    /**
     * Основное правило распределения SR
     */
    static splitSR(sr, context) {

        if (context.clean) {

            return {
                basalSR: sr,
                bolusSR: 0
            };
        }

        const activity =
            context.carbs + (context.insulin * 10);

        const factor =
            Math.min(activity / 50, 0.8);

        const bolusSR = sr * factor;
        const basalSR = sr - bolusSR;

        return {
            basalSR,
            bolusSR
        };
    }
}
