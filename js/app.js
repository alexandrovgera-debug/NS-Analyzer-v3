import NightscoutAPI from "./api/nightscoutAPI.js";

import SRService from "./core/srService.js";

import BasalAnalyzer from "./analyzers/basalAnalyzer.js";
import CRAnalyzer from "./analyzers/crAnalyzer.js";
import ISFAnalyzer from "./analyzers/isfAnalyzer.js";

import { renderTables } from "./ui/tables.js";
import { drawCharts } from "./ui/charts.js";

const button = document.getElementById("analyze");
const daySelect = document.getElementById("daySelect");

let cache = null;

button.addEventListener("click", run);
daySelect.addEventListener("change", runFromCache);

async function run() {

    button.disabled = true;

    try {

        const url = document.getElementById("url").value.trim();

        if (!url) {
            alert("Введите Nightscout URL");
            return;
        }

        const api = new NightscoutAPI(url);

        cache = await api.load();

        const days = getLast7Days(cache.entries || []);

        fillDays(days);

        runFromCache();

    } catch (e) {

        console.error(e);
        alert(e.message);

    } finally {

        button.disabled = false;
    }
}

// ---------------- RUN ----------------

function runFromCache() {

    if (!cache) return;

    const day = daySelect.value || getToday();

    const filtered = filterByDay(cache, day);

    const sr = SRService.build(filtered);

    const basal = new BasalAnalyzer().analyze(sr.split);
    const cr = new CRAnalyzer().analyze(sr.raw, cache.profile);
    const isf = new ISFAnalyzer().analyze(sr.raw, cache.profile);

    renderTables({ basal, cr, isf });
    drawCharts(filtered, sr);
}

// ---------------- DAYS ----------------

function getLast7Days(entries) {

    const set = new Set();

    for (const e of entries) {

        const d = new Date(e.dateString || e.date);

        set.add(d.toISOString().slice(0, 10));
    }

    return [...set].sort().slice(-7);
}

function fillDays(days) {

    daySelect.innerHTML = "";

    for (const d of days) {

        const opt = document.createElement("option");

        opt.value = d;
        opt.textContent = d;

        daySelect.appendChild(opt);
    }
}

function getToday() {

    return new Date().toISOString().slice(0, 10);
}

function filterByDay(data, day) {

    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    return {
        entries: (data.entries || []).filter(e => {
            const t = new Date(e.dateString || e.date);
            return t >= start && t < end;
        }),
        treatments: (data.treatments || []).filter(t => {
            const tt = new Date(t.created_at);
            return tt >= start && tt < end;
        }),
        deviceStatus: (data.deviceStatus || []).filter(d => {
            const dt = new Date(d.created_at);
            return dt >= start && dt < end;
        }),
        profile: data.profile
    };
}

window.onload = run;
