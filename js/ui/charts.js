export function drawCharts(data, srData) {

    drawGlucose(data.entries || []);
    drawSR(srData.raw || []);
}

// ---------------- GLUCOSE (mmol/L + grid) ----------------

function drawGlucose(entries) {

    const el = document.getElementById("glucoseChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Glucose (mmol/L)");
    const ctx = canvas.getContext("2d");

    const values = entries.slice(-200).map(e => mgdlToMmol(e.sgv));

    drawChart(ctx, values, {
        color: "#4fc3f7",
        yLabel: "mmol/L"
    });
}

// ---------------- SR ----------------

function drawSR(sr) {

    const el = document.getElementById("srChart");
    el.innerHTML = "";

    const canvas = createCanvas(el, "Sensitivity Ratio");
    const ctx = canvas.getContext("2d");

    const values = sr.slice(-200).map(e => e.sr);

    drawChart(ctx, values, {
        color: "#ffb74d",
        yLabel: "SR"
    });
}

// ---------------- CORE DRAW ----------------

function drawChart(ctx, data, opts) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);

    drawGrid(ctx, w, h);

    ctx.strokeStyle = opts.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / data.length) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

// ---------------- GRID ----------------

function drawGrid(ctx, w, h) {

    ctx.strokeStyle = "#2a2f3a";
    ctx.lineWidth = 1;

    const steps = 5;

    for (let i = 0; i <= steps; i++) {

        const y = (h / steps) * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    for (let i = 0; i <= steps; i++) {

        const x = (w / steps) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
}

// ---------------- mmol conversion ----------------

function mgdlToMmol(mgdl) {
    return +(mgdl / 18.0).toFixed(1);
}

// ---------------- canvas ----------------

function createCanvas(el, title) {

    const titleEl = document.createElement("div");
    titleEl.textContent = title;
    titleEl.style.marginBottom = "6px";

    const canvas = document.createElement("canvas");
    canvas.width = el.clientWidth || 800;
    canvas.height = 220;

    el.appendChild(titleEl);
    el.appendChild(canvas);

    return canvas;
}
