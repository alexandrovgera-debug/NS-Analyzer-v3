export function renderCRTable(data) {

    const el = document.getElementById("crTable");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>CR</th>
            <th>Рекоменд.</th>
        </tr>
    `;

    for (const r of data) {

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
