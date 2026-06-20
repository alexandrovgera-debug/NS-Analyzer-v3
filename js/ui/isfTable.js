export function renderISFTable(data) {

    const el = document.getElementById("isfTable");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>ISF</th>
            <th>Рекоменд.</th>
        </tr>
    `;

    for (const r of data) {

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
