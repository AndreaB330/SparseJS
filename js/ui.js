/**
 * Build html representation of matrix on the given table.
 * @param table_id - id of table.
 * @param matrix - given matrix.
 * @param click_handler - function that calls whenever user clicks on a cell.
 */

function BuildMatrix(table_id, matrix, click_handler) {
    let table = $('#' + table_id);
    for (let i = -1; i < matrix.num_rows; i++) {
        let row = $('<tr></tr>');
        let cell_row = FindCellToDown(matrix.root, i);
        for (let j = -1; j < matrix.num_cols; j++) {
            let cell_col = FindCellToRight(matrix.root, j);
            let val = matrix.get(i, j);
            let entry = $('<td></td>');
            let handler = 'onclick="ClickHandler('+i+','+j+')"';
            let cell = $('<div class="cell empty" ' + handler + '>&#8203;</div>');
            if (i >= 0 && j >= 0 && val !== 0 && val != null) {
                // non-zero cell
                cell = $('<div class="cell">' + matrix.get(i, j) + '</div>');
            } else if (i < 0 && j >= 0 && FindCellToRight(matrix.root, j).index_col === j) {
                // top boundary cell
                cell = $('<div class="cell border">' + j + '</div>');
            } else if (i >= 0 && j < 0 && FindCellToDown(matrix.root, i).index_row === i) {
                // left boundary cell
                cell = $('<div class="cell border">' + i + '</div>');
            } else if (i < 0 && j < 0) {
                // root cell
                cell = $('<div class="cell root">+</div>');
            } else if (i < 0 || j < 0) {
                // empty boundary cells
                cell = $('<div class="cell border empty">&#8203;</div>');
            }
            cell.click(function(){click_handler(i,j);}); // set handler
            entry.append(cell);

            // draw links
            if (cell_row.index_row === i && FindCellToRight(cell_row, j - 1).cell_right != null) {
                // horizontal link
                let tmp = $('<div class="horizontal"></div>');
                if (FindCellToRight(cell_row, j).cell_right == null) tmp.addClass('tail');
                if (j === -1) tmp.addClass('head');
                entry.append(tmp);
            }
            if (cell_col.index_col === j && FindCellToDown(cell_col, i - 1).cell_down != null) {
                // vertical link
                let tmp = $('<div class="vertical"></div>');
                if (FindCellToDown(cell_col, i).cell_down == null) tmp.addClass('tail');
                if (i === -1) tmp.addClass('head');
                entry.append(tmp);
            }

            row.append(entry);
        }
        table.append(row);
    }
}