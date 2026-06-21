export function renderTables(data) {

    renderBasalTable(data.basal);
    renderCRTable(data.cr);
    renderISFTable(data.isf);
}

// =====================================================
// BASAL TABLE (NO HIGHLIGHT, NO OLD MATH)
// =====================================================

function renderBasalTable(basal) {

    const el = document.getElementById("basalTable");

    if (!el) return;

    el.innerHTML = "";

    const rows = basal?.hourly || [];

    for (const r of rows) {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.hour}:00</td>
            <td>${format(r.basal)}</td>
        `;

        el.appendChild(tr);
    }
}

// =====================================================
// CR TABLE (pure display)
// =====================================================

function renderCRTable(cr) {

    const el = document.getElementById("crTable");

    if (!el) return;

    el.innerHTML = `
        <tr>
            <td>Current</td>
            <td>${format(cr?.current)}</td>
        </tr>
        <tr>
            <td>Recommended</td>
            <td>${format(cr?.recommended)}</td>
        </tr>
        <tr>
            <td>Samples</td>
            <td>${cr?.samples ?? 0}</td>
        </tr>
    `;
}

// =====================================================
// ISF TABLE (pure display)
// =====================================================

function renderISFTable(isf) {

    const el = document.getElementById("isfTable");

    if (!el) return;

    el.innerHTML = `
        <tr>
            <td>Current</td>
            <td>${format(isf?.current)}</td>
        </tr>
        <tr>
            <td>Recommended</td>
            <td>${format(isf?.recommended)}</td>
        </tr>
        <tr>
            <td>Samples</td>
            <td>${isf?.samples ?? 0}</td>
        </tr>
    `;
}

// =====================================================
// FORMATTER (safe, no NaN)
// =====================================================

function format(v) {

    if (v == null || isNaN(v)) return "-";

    return Number(v).toFixed(2);
}
