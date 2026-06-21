export default class BasalAnalyzer {

    constructor() {}

    /**
     * Основная логика базала:
     * - берём basalSR из SRService
     * - усредняем по часам
     * - сравниваем с текущим профилем
     */
    analyze(srData) {

        const hourly = this.buildHourly(srData);

        const result = [];

        for (const h of hourly) {

            const currentBasal = this.getCurrentBasal(h.hour);

            // простая и стабильная логика рекомендаций
            const suggestedBasal =
                currentBasal * (1 + this.normalize(h.sr));

            result.push({
                hour: h.hour,
                sr: h.sr,
                currentBasal,
                suggestedBasal,
                clean: h.sr < 0.01
            });
        }

        return result;
    }

    /**
     * Переводим split SR в 24h
     */
    buildHourly(srData) {

        const hours = Array.from({ length: 24 }, () => ({
            sum: 0,
            count: 0
        }));

        for (const r of srData || []) {

            const h = r.time.getHours();

            hours[h].sum += r.basalSR;
            hours[h].count++;
        }

        return hours.map((h, i) => ({
            hour: i,
            sr: h.count ? h.sum / h.count : 0
        }));
    }

    /**
     * Текущий базал из профиля Nightscout
     */
    getCurrentBasal(hour) {

        // временная простая реализация:
        // потом заменим на профиль интервалов

        return 1.0;
    }

    /**
     * Нормализация SR в разумный диапазон
     */
    normalize(sr) {

        if (!sr) return 0;

        // ограничиваем влияние SR
        const v = sr / 2;

        return Math.max(-0.2, Math.min(0.2, v));
    }
}
