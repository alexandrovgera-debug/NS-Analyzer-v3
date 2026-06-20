export default class NightscoutAPI {

    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }

    async getProfiles() {

        const res = await fetch(`${this.baseUrl}/api/v1/profile.json`);

        if (!res.ok) {
            throw new Error("Ошибка загрузки профиля");
        }

        const data = await res.json();

        if (!data?.length) {
            throw new Error("Профили не найдены");
        }

        const root = data[0];
        const activeName = root.defaultProfile;
        const active = root.store?.[activeName];

        if (!active) {
            throw new Error("Активный профиль не найден");
        }

        return {
            basal: active.basal || [],
            isf: active.sens || [],
            cr: active.carbratio || [],
            dia: active.dia,
            units: active.units,
            timezone: active.timezone
        };
    }

    async getEntries(days = 1) {

        const count = days * 288;

        const res = await fetch(
            `${this.baseUrl}/api/v1/entries.json?count=${count}`
        );

        if (!res.ok) {
            throw new Error("Ошибка загрузки entries");
        }

        return await res.json();
    }

    async getTreatments(days = 1) {

        const count = days * 100;

        const res = await fetch(
            `${this.baseUrl}/api/v1/treatments.json?count=${count}`
        );

        if (!res.ok) {
            throw new Error("Ошибка загрузки treatments");
        }

        return await res.json();
    }

    async getDeviceStatus(days = 1) {

        const count = days * 288;

        const res = await fetch(
            `${this.baseUrl}/api/v1/devicestatus.json?count=${count}`
        );

        if (!res.ok) {
            throw new Error("Ошибка загрузки devicestatus");
        }

        return await res.json();
    }

    async loadAll(days = 1) {

        const [profile, entries, treatments, deviceStatus] = await Promise.all([
            this.getProfiles(),
            this.getEntries(days),
            this.getTreatments(days),
            this.getDeviceStatus(days)
        ]);

        return {
            profile,
            entries,
            treatments,
            deviceStatus
        };
    }
}
