export default class NightscoutAPI {

    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }

    // ---------------- MAIN LOAD ----------------

    async load() {

        const [entries, treatments, deviceStatus, profile] =
            await Promise.all([
                this.getEntries(),
                this.getTreatments(),
                this.getDeviceStatus(),
                this.getProfile()
            ]);

        return {
            entries,
            treatments,
            deviceStatus,
            profile
        };
    }

    // ---------------- ENTRIES (glucose) ----------------

    async getEntries() {

        const url = `${this.baseUrl}/api/v1/entries.json?count=3000`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Ошибка получения entries");
        }

        return await res.json();
    }

    // ---------------- TREATMENTS (bolus, carbs) ----------------

    async getTreatments() {

        const url = `${this.baseUrl}/api/v1/treatments.json?count=3000`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Ошибка получения treatments");
        }

        return await res.json();
    }

    // ---------------- DEVICESTATUS (SR source) ----------------

    async getDeviceStatus() {

        const url = `${this.baseUrl}/api/v1/devicestatus.json?count=3000`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Ошибка получения devicestatus");
        }

        return await res.json();
    }

    // ---------------- PROFILE ----------------

    async getProfile() {

        const url = `${this.baseUrl}/api/v1/profile.json`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Ошибка получения profile");
        }

        const profiles = await res.json();

        if (!profiles?.length) {
            throw new Error("Profile не найден");
        }

        const root = profiles[0];
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
}
