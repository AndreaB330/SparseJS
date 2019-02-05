/**
 * Build html representation of matrix on the given table.
 * @param table_id - id of table.
 * @param matrix - given matrix.
 * @param click_handler - function that calls whenever user clicks on a cell.
 */

function BuildMatrix(table_id, matrix, click_handler) {
    let table = $('#' + table_id);
    for (let i = -1; i < matrix.height; i++) {
        let row = $('<tr></tr>');
        for (let j = -1; j < matrix.width; j++) {
            let entry = $('<td></td>');
            let cell = $('<div class="cell empty">&#8203;</div>');
            if (i >= 0 && j >= 0 && matrix.present(i, j)) {
                // non-zero cell
                cell = $('<div class="cell">' + matrix.get(i, j) + '</div>');
            } else if (i < 0 && j >= 0) {
                // top boundary cell
                cell = $('<div class="cell border">' + j + '</div>');
            } else if (i >= 0 && j < 0) {
                // left boundary cell
                cell = $('<div class="cell border">' + i + '</div>');
            } else if (i < 0 && j < 0) {
                // root cell
                cell = $('<div class="cell root">+</div>');
            }
            cell.click(function(){click_handler(i,j);}); // set handler
            entry.append(cell);
            // draw links
            if (i === -1 ||  matrix.rows[i].findNode(j - 1).next != null) {
                // horizontal link
                let tmp = $('<div class="horizontal"></div>');
                if (i !== -1 && matrix.rows[i].findNode(j).next == null) tmp.addClass('tail');
                if (j + 1 === mat.width) tmp.addClass('tail');
                if (j === -1) tmp.addClass('head');
                entry.append(tmp);
            }
            if (j === -1 || matrix.columns[j].findNode(i - 1).next != null) {
                // vertical link
                let tmp = $('<div class="vertical"></div>');
                if (j !== -1 && matrix.columns[j].findNode(i).next == null) tmp.addClass('tail');
                if (i + 1 === mat.height) tmp.addClass('tail');
                if (i === -1) tmp.addClass('head');
                entry.append(tmp);
            }
            row.append(entry);
        }
        table.append(row);
    }
}