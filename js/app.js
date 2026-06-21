import NightscoutAPI from "./api/nightscoutAPI.js";

import DayService from "./core/dayService.js";
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

        const api = new NightscoutAPI(getUrl());

        const raw = await api.load();

        cache = raw;

        const days = DayService.getLast7Days(raw);

        DayService.fillSelector(daySelect, days);

        runFromCache();

    } finally {

        button.disabled = false;
    }
}

function runFromCache() {

    if (!cache) return;

    const day = daySelect.value || DayService.getToday();

    const data = DayService.filterDay(cache, day);

    const sr = SRService.build(data);

    const basal = new BasalAnalyzer().analyze(sr);
    const cr = new CRAnalyzer().analyze(sr);
    const isf = new ISFAnalyzer().analyze(sr);

    renderTables({ basal, cr, isf });
    drawCharts(data, sr);
}

function getUrl() {
    return document.getElementById("url").value.trim();
}

window.onload = run;
