export function drawCharts(data, srData) {

    drawGlucose(data?.entries || []);
    drawSR(srData?.raw || []);
}

// ---------------- GLUCOSE ----------------

function drawGlucose(entries) {

    const el = document.getElementById("glucoseChart");
    if (!el) return;

    el.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 220;

    el.appendChild(document.createTextNode("Glucose (mmol/L)"));
    el.appendChild(document.createElement("br"));
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const values = entries.map(e => mgdlToMmol(e.sgv || 0));

    draw(ctx, values);
}

// ---------------- SR ----------------

function drawSR(sr) {

    const el = document.getElementById("srChart");
    if (!el) return;

    el.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 220;

    el.appendChild(document.createTextNode("SR"));
    el.appendChild(document.createElement("br"));
    el.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const values = sr.map(e => e.sr || 0);

    draw(ctx, values);
}

// ---------------- CORE ----------------

function draw(ctx, data) {

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (!data.length) {
        ctx.fillText("no data", 10, 20);
        return;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);

    // GRID
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {

        const y = (h / 5) * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // значения слева
        const value = (max - ((max - min) / 5) * i).toFixed(1);

        ctx.fillStyle = "#aaa";
        ctx.fillText(value, 5, y - 2);
    }

    // LINE
    ctx.strokeStyle = "#4fc3f7";
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

// ---------------- mmol ----------------

function mgdlToMmol(v) {
    return (v / 18).toFixed(1);
}
