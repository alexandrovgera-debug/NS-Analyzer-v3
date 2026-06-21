export function drawCharts(data, grid) {

    drawGlucose(grid);
    drawSR(grid);
    drawCOBIOB(grid);
}

// =====================================================
// 📊 GLUCOSE (0–22.5 mmol/L, hourly grid)
// =====================================================

function drawGlucose(grid) {

    const el = document.getElementById("glucoseChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Glucose (mmol/L)");
    const ctx = canvas.getContext("2d");

    const values = grid.map(h => h.glucose);

    drawTimeGridChart(ctx, values, {
        minY: 0,
        maxY: 22.5,
        color: "#4fc3f7",
        stepY: 1
    });
}

// =====================================================
// 📈 SR (0.5–1.5 + hourly avg + dashed mean)
// =====================================================

function drawSR(grid) {

    const el = document.getElementById("srChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Sensitivity Ratio");
    const ctx = canvas.getContext("2d");

    const values = grid.map(h => h.sr);

    const avg =
        values.reduce((a, b) => a + b, 0) / (values.filter(v => v !== null).length || 1);

    drawTimeGridChart(ctx, values, {
        minY: 0.5,
        maxY: 1.5,
        color: "#ffb74d",
        stepY: 0.1,
        avgLine: avg
    });
}

// =====================================================
// 💉🍭 COB / IOB (hourly)
// =====================================================

function drawCOBIOB(grid) {

    const el = document.getElementById("srChart");

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 160;

    el.appendChild(document.createTextNode("COB / IOB"));
    el.appendChild(document.createElement("br"));
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const iob = grid.map(h => h.iob);
    const cob = grid.map(h => h.cob);

    drawTwoLines(ctx, iob, cob);
}

// =====================================================
// 🧠 CORE 24H GRID CHART
// =====================================================

function drawTimeGridChart(ctx, data, opts) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    drawGrid(ctx, w, h, opts.minY, opts.maxY, opts.stepY);

    // LINE
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / 23) * w;
        const y = h - ((v - opts.minY) / (opts.maxY - opts.minY)) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // AVG LINE (SR mean)
    if (opts.avgLine !== undefined) {

        const y =
            h - ((opts.avgLine - opts.minY) / (opts.maxY - opts.minY)) * h;

        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.setLineDash([]);
    }
}

// =====================================================
// 📐 GRID (24h + values)
// =====================================================

function drawGrid(ctx, w, h, minY, maxY, stepY) {

    ctx.strokeStyle = "#2a2f3a";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#aaa";

    // horizontal (values)
    const steps = Math.round((maxY - minY) / stepY);

    for (let i = 0; i <= steps; i++) {

        const y = (h / steps) * i;

        const value = (maxY - i * stepY).toFixed(1);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillText(value, 5, y - 2);
    }

    // vertical (hours)
    for (let i = 0; i <= 24; i++) {

        const x = (w / 24) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        if (i % 3 === 0) {
            ctx.fillText(`${i}:00`, x + 2, h - 5);
        }
    }
}

// =====================================================
// 💉🍭 LINES (COB/IOB)
// =====================================================

function drawTwoLines(ctx, a, b) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const max = Math.max(...a, ...b, 1);

    drawLine(ctx, a, "#ff5252", w, h, max);
    drawLine(ctx, b, "#4caf50", w, h, max);
}

function drawLine(ctx, data, color, w, h, max) {

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / 23) * w;
        const y = h - (v / max) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

// =====================================================
// 🧩 HELPERS
// =====================================================

function createCanvas(el, title) {

    const t = document.createElement("div");
    t.textContent = title;
    t.style.marginBottom = "6px";

    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 220;

    el.appendChild(t);
    el.appendChild(c);

    return c;
}
