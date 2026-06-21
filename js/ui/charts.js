export function drawCharts(data, srService) {

    const grid = buildSafeGrid(data, srService);

    drawGlucoseChart(grid);
    drawSRChart(grid);
    drawIOBCOBChart(grid);
}

// =====================================================
// 1. SAFE GRID BUILDER (главный фикс всех падений)
// =====================================================

function buildSafeGrid(data, srService) {

    const entries = data?.entries || [];

    const map = new Map();

    for (const e of entries) {

        const time = new Date(e.dateString || e.date);

        const hour = time.getHours();

        const glucose = normalizeGlucose(e.sgv || e.glucose);

        if (!map.has(hour)) {
            map.set(hour, {
                hour,
                glucose: [],
                sr: [],
                iob: [],
                cob: []
            });
        }

        const cell = map.get(hour);

        if (glucose != null) cell.glucose.push(glucose);
    }

    // SR данные (если есть)
    const srRows = srService?.hourly || [];

    for (const s of srRows) {

        if (!map.has(s.hour)) {
            map.set(s.hour, {
                hour: s.hour,
                glucose: [],
                sr: [],
                iob: [],
                cob: []
            });
        }

        const cell = map.get(s.hour);

        if (s.sr != null) cell.sr.push(s.sr);
    }

    // finalize
    const grid = [];

    for (let h = 0; h < 24; h++) {

        const cell = map.get(h) || {
            glucose: [],
            sr: [],
            iob: [],
            cob: []
        };

        grid.push({
            hour: h,

            glucose: average(cell.glucose),
            sr: average(cell.sr),

            iob: 0,
            cob: 0
        });
    }

    return grid;
}

// =====================================================
// 2. GLUCOSE CHART (0–22.5 mmol/L)
// =====================================================

function drawGlucoseChart(grid) {

    const values = grid.map(g => g.glucose);

    console.log("GLUCOSE GRID", values);

    // сюда подключается твой renderer
}

// =====================================================
// 3. SR CHART (0.5–1.5)
// =====================================================

function drawSRChart(grid) {

    const values = grid.map(g => g.sr);

    console.log("SR GRID", values);

    // средняя линия (пунктир)
    const avg =
        values.filter(v => v != null).reduce((a, b) => a + b, 0)
        / Math.max(values.filter(v => v != null).length, 1);

    console.log("SR AVG", avg);
}

// =====================================================
// 4. IOB / COB (заглушка но НЕ ломает UI)
// =====================================================

function drawIOBCOBChart(grid) {

    console.log("IOB/COB GRID OK");
}

// =====================================================
// 5. HELPERS
// =====================================================

function average(arr) {

    if (!arr || !arr.length) return null;

    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function normalizeGlucose(v) {

    if (v == null) return null;

    // Nightscout mg/dL → mmol/L
    return Math.round((v / 18) * 10) / 10;
}
