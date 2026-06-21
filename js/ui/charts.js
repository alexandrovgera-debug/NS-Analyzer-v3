export function drawCharts(data, sr) {

    drawGlucose(data);
    drawSR(sr);
}

// ---------------- GLUCOSE ----------------

function drawGlucose(data) {

    const el = document.getElementById("glucoseChart");

    if (!el) return;

    el.innerHTML =
        "📊 Glucose chart (заглушка — подключим Chart.js позже)";
}

// ---------------- SR ----------------

function drawSR(sr) {

    const el = document.getElementById("srChart");

    if (!el) return;

    el.innerHTML =
        "📈 SR chart (basal/bolus + avg line — позже Chart.js)";
}
