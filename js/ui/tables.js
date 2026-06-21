export function renderTables({ basal, cr, isf }) {

    renderBasal(basal);
    renderCR(cr);
    renderISF(isf);
}

// ---------------- BASAL ----------------

function renderBasal(data) {

    const el = document.getElementById("basalTable");

    let html = `
        <tr>
            <th>Час</th>
            <th>SR</th>
            <th>Базал</th>
            <th>Реком.</th>
        </tr>
    `;

    for (const r of data || []) {

        html += `
            <tr ${r.clean ? 'style="background:#1a3d1f"' : ""}>
                <td>${r.hour}:00</td>
                <td>${r.sr.toFixed(2)}</td>
                <td>${r.currentBasal.toFixed(2)}</td>
                <td>${r.suggestedBasal.toFixed(2)}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}

// ---------------- CR ----------------

function renderCR(data) {

    const el = document.getElementById("crTable");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>CR</th>
            <th>Реком.</th>
        </tr>
    `;

    for (const r of data || []) {

        html += `
            <tr>
                <td>${r.start.toFixed(1)} - ${r.end.toFixed(1)}</td>
                <td>${r.srAvg.toFixed(2)}</td>
                <td>${r.currentCR.toFixed(2)}</td>
                <td>${r.suggestedCR.toFixed(2)}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}

// ---------------- ISF ----------------

function renderISF(data) {

    const el = document.getElementById("isfTable");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>ISF</th>
            <th>Реком.</th>
        </tr>
    `;

    for (const r of data || []) {

        html += `
            <tr>
                <td>${r.start.toFixed(1)} - ${r.end.toFixed(1)}</td>
                <td>${r.srAvg.toFixed(2)}</td>
                <td>${r.currentISF.toFixed(2)}</td>
                <td>${r.suggestedISF.toFixed(2)}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}
