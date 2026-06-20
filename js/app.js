import NightscoutAPI from "./api.js";

import SRAnalyzer from "./analyzer/srAnalyzer.js";
import BasalAnalyzer from "./analyzer/basalAnalyzer.js";
import ISFAnalyzer from "./analyzer/isfAnalyzer.js";
import CRAnalyzer from "./analyzer/crAnalyzer.js";

const button = document.getElementById("analyze");
const daySelect = document.getElementById("daySelect");

button.addEventListener("click", run);

let cache = null;

async function run() {

    button.disabled = true;
    button.textContent = "Загрузка...";

    try {

        const url = document.getElementById("url").value.trim();
        const api = new NightscoutAPI(url);

        // 7 дней данных
        const data = await api.loadAll(7);

        cache = data;

        const days = buildDays(data.entries);

        fillDaySelector(days);

        const selectedDay = daySelect.value || days[0];

        const filtered = filterByDay(data, selectedDay);

        const srAnalyzer = new SRAnalyzer(data.profile);
        const basalAnalyzer = new BasalAnalyzer(data.profile);
        const isfAnalyzer = new ISFAnalyzer(data.profile);
        const crAnalyzer = new CRAnalyzer(data.profile);

        const srRows = srAnalyzer.analyze(filtered.deviceStatus, filtered.treatments, 60);

        const hourlySR = srAnalyzer.buildHourly(srRows);
        const splitSR = srAnalyzer.splitSRByTherapy(srRows, filtered.treatments);

        const basal = basalAnalyzer.analyze(
            hourlySR,
            splitSR,
            groupTreatmentsByHour(filtered.treatments)
        );

        const isf = isfAnalyzer.analyze(data.profile, splitSR);
        const cr = crAnalyzer.analyze(data.profile, splitSR);

        renderTables(basal, isf, cr);

        drawCharts(filtered, srRows);

    } catch (e) {

        console.error(e);
        alert(e.message);

    } finally {

        button.disabled = false;
        button.textContent = "Анализ";
    }
}

// -------------------- DAYS --------------------

function buildDays(entries) {

    const days = new Set();

    for (const e of entries || []) {

        const d = new Date(e.dateString || e.date || e.mills);

        const key = d.toISOString().split("T")[0];

        days.add(key);
    }

    return Array.from(days).sort().slice(-7);
}

function fillDaySelector(days) {

    daySelect.innerHTML = "";

    for (const d of days) {

        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;

        daySelect.appendChild(opt);
    }
}

function filterByDay(data, day) {

    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    const entries = (data.entries || []).filter(e => {
        const t = new Date(e.dateString || e.date || e.mills);
        return t >= start && t < end;
    });

    const treatments = (data.treatments || []).filter(t => {
        const tt = new Date(t.created_at || t.date);
        return tt >= start && tt < end;
    });

    const deviceStatus = (data.deviceStatus || []).filter(d => {
        const dt = new Date(d.created_at || d.date);
        return dt >= start && dt < end;
    });

    return { entries, treatments, deviceStatus };
}

// -------------------- GROUPING --------------------

function groupTreatmentsByHour(treatments) {

    const hours = Array.from({ length: 24 }, () => []);

    for (const t of treatments || []) {

        const h = new Date(t.created_at).getHours();

        hours[h].push(t);
    }

    return hours;
}

// -------------------- RENDER --------------------

function renderTables(basal, isf, cr) {

    console.log("BASAL", basal);
    console.log("ISF", isf);
    console.log("CR", cr);
}

// -------------------- CHARTS --------------------

function drawCharts(data, srRows) {

    console.log("GLUCOSE DATA", data);
    console.log("SR", srRows);
}

window.onload = run;
