export function renderBasalTable(data) {

    const el = document.getElementById("basalTable");

    let html = `
        <tr>
            <th>Час</th>
            <th>SR</th>
            <th>Базал</th>
            <th>Рекоменд.</th>
            <th>OK</th>
        </tr>
    `;

    for (const r of data) {

        html += `
            <tr ${r.clean ? 'style="background:#143a1f"' : ""}>
                <td>${r.hour}:00</td>
                <td>${r.sr.toFixed(2)}</td>
                <td>${r.currentBasal.toFixed(2)}</td>
                <td>${r.suggestedBasal.toFixed(2)}</td>
                <td>${r.clean ? "✔" : ""}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}
