export function drawCharts(data, srData) {

    const entries = data?.entries || [];
    const treatments = data?.treatments || [];

    const sr = srData?.split || [];

    drawGlucose(entries);
    drawSR(sr);
    drawCOBIOB(treatments);
}

// =====================================================
// 📊 GLUCOSE (0–22.5 mmol/L + time grid + current hour)
// =====================================================

function drawGlucose(entries) {

    const el = document.getElementById("glucoseChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Glucose (mmol/L)");
    const ctx = canvas.getContext("2d");

    const now = new Date();
    const currentHour = now.getHours();

    const filtered = entries
        .filter(e => {
            const t = new Date(e.dateString || e.date);
            return t.getHours() <= currentHour;
        })
        .map(e => mgdlToMmol(e.sgv || 0));

    drawTimeChart(ctx, filtered, {
        minY: 0,
        maxY: 22.5,
        color: "#4fc3f7"
    });
}

// =====================================================
// 📈 SR (0.5–1.5 + avg line)
// =====================================================

function drawSR(sr) {

    const el = document.getElementById("srChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Sensitivity Ratio");
    const ctx = canvas.getContext("2d");

    const values = sr.map(e => e.sr || 0);

    const avg =
        values.reduce((a, b) => a + b, 0) / (values.length || 1);

    drawTimeChart(ctx, values, {
        minY: 0.5,
        maxY: 1.5,
        color: "#ffb74d",
        avgLine: avg
    });
}

// =====================================================
// 🍭 COB / 💉 IOB (упрощённо из treatments)
// =====================================================

function drawCOBIOB(treatments) {

    const el = document.getElementById("srChart");
    if (!el) return;

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 160;

    el.appendChild(document.createTextNode("COB / IOB"));
    el.appendChild(document.createElement("br"));
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const iob = treatments.map(t => t.insulin || 0);
    const cob = treatments.map(t => t.carbs || 0);

    drawTwoLines(ctx, iob, cob);
}

// =====================================================
// CORE TIME CHART
// =====================================================

function drawTimeChart(ctx, data, opts) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    drawGrid(ctx, w, h, opts.minY, opts.maxY);

    ctx.strokeStyle = opts.color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / data.length) * w;
        const y = h - ((v - opts.minY) / (opts.maxY - opts.minY)) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // AVG LINE (SR)
    if (opts.avgLine !== undefined) {

        const y =
            h - ((opts.avgLine - opts.minY) / (opts.maxY - opts.minY)) * h;

        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.setLineDash([]);
    }
}

// =====================================================
// GRID + AXIS
// =====================================================

function drawGrid(ctx, w, h, minY, maxY) {

    ctx.strokeStyle = "#2a2f3a";
    ctx.lineWidth = 1;

    // horizontal
    for (let i = 0; i <= 5; i++) {

        const y = (h / 5) * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        const val =
            (maxY - ((maxY - minY) / 5) * i).toFixed(1);

        ctx.fillStyle = "#aaa";
        ctx.fillText(val, 5, y - 2);
    }

    // vertical (time)
    for (let i = 0; i <= 24; i += 3) {

        const x = (w / 24) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        ctx.fillStyle = "#666";
        ctx.fillText(`${i}:00`, x + 2, h - 5);
    }
}

// =====================================================
// COBO / IOB SIMPLE
// =====================================================

function drawTwoLines(ctx, iob, cob) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const max =
        Math.max(...iob, ...cob, 1);

    drawLine(ctx, iob, "#ff5252", w, h, max);
    drawLine(ctx, cob, "#4caf50", w, h, max);
}

function drawLine(ctx, data, color, w, h, max) {

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / data.length) * w;
        const y = h - (v / max) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

// =====================================================
// HELPERS
// =====================================================

function mgdlToMmol(v) {
    return v / 18;
}

function createCanvas(el, title) {

    const titleEl = document.createElement("div");
    titleEl.textContent = title;
    titleEl.style.marginBottom = "5px";

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 220;

    el.appendChild(titleEl);
    el.appendChild(canvas);

    return canvas;
}
