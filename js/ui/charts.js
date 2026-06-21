export function drawCharts(data, srData) {

    drawGlucose(data);
    drawSR(srData);
}

// ---------------- GLUCOSE ----------------

function drawGlucose(data) {

    const el = document.getElementById("glucoseChart");
    if (!el) return;

    const canvas = createCanvas(el, "Glucose");

    const ctx = canvas.getContext("2d");

    const values = (data.entries || [])
        .slice(-200)
        .map(e => e.sgv);

    drawLine(ctx, values, "#4fc3f7");
}

// ---------------- SR ----------------

function drawSR(srData) {

    const el = document.getElementById("srChart");
    if (!el) return;

    const canvas = createCanvas(el, "SR");

    const ctx = canvas.getContext("2d");

    const values = (srData.raw || [])
        .slice(-200)
        .map(e => e.sr);

    drawLine(ctx, values, "#ffb74d");
}

// ---------------- HELPERS ----------------

function createCanvas(el, title) {

    el.innerHTML = "";

    const titleEl = document.createElement("div");
    titleEl.textContent = title;

    const canvas = document.createElement("canvas");
    canvas.width = el.clientWidth || 800;
    canvas.height = 200;

    el.appendChild(titleEl);
    el.appendChild(canvas);

    return canvas;
}

function drawLine(ctx, data, color) {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!data.length) return;

    const max = Math.max(...data);
    const min = Math.min(...data);

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    data.forEach((v, i) => {

        const x = (i / data.length) * w;

        const y =
            h - ((v - min) / (max - min || 1)) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}
