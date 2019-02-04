/**
 * SparseMatrix - compressed sparse matrix representation, stores only nonzero values.
 * Implemented as multi-linked-list that stores only non-zero cells and each cell has
 * link to first non-zero cell below and at right.
 * @class
 */
function SparseMatrix() {
    this.root = new SparseCell(-1, -1);
    this.num_rows = 0;
    this.num_cols = 0;
    this.default_value = 0; // not supported yet, 0 by default todo: add support
    this.full_boundary = false; // not supported yet todo: add support
}

/**
 * SparseCell - node of multi-linked-list, represents one cell in matrix.
 * @param index_row - index of row, -1 for boundary cell.
 * @param index_col - index of column, -1 for boundary cell.
 * @param value - value stored in this cell.
 * @param cell_down - link to first non-zero cell below.
 * @param cell_right - link to first non-zero cell at right.
 * @class
 */
function SparseCell(index_row, index_col, value = null, cell_down = null, cell_right = null) {
    this.index_row = index_row;
    this.index_col = index_col;
    this.value = value;
    this.cell_down = cell_down;
    this.cell_right = cell_right;
}

/**
 * Insert cell to the right from this
 * @param {SparseCell} other - cell to insert
 */
SparseCell.prototype.InsertRight = function (other) {
    other.cell_right = this.cell_right;
    this.cell_right = other;
};

/**
 * Insert cell below this
 * @param {SparseCell} other - cell to insert
 */
SparseCell.prototype.InsertDown = function (other) {
    other.cell_down = this.cell_down;
    this.cell_down = other;
};

/**
 * Find the first cell below, where index_row is less than or equal to the given.
 */
function FindCellToDown(cell, index_row) {
    while (cell != null && cell.cell_down != null && cell.cell_down.index_row <= index_row) {
        cell = cell.cell_down;
    }
    return cell;
}

/**
 * Find the first cell at right, where index_col is less than or equal to the given.
 */
function FindCellToRight(cell, index_col) {
    while (cell != null && cell.cell_right != null && cell.cell_right.index_col <= index_col) {
        cell = cell.cell_right;
    }
    return cell;
}

/**
 * Set value at position (index_row, index_col)
 * @param index_row - index of row
 * @param index_col - index of column
 * @param value - value to set
 */
SparseMatrix.prototype.set = function (index_row, index_col, value) {
    // todo: refactoring, optimization, error for boundary cells
    this.num_rows = Math.max(this.num_rows, index_row + 1);
    this.num_cols = Math.max(this.num_cols, index_col + 1);
    let boundary_cell_row = FindCellToDown(this.root, index_row);
    let boundary_cell_col = FindCellToRight(this.root, index_col);
    if (boundary_cell_row.index_row !== index_row) {
        boundary_cell_row.InsertDown(new SparseCell(index_row, -1));
        boundary_cell_row = boundary_cell_row.cell_down;
    }
    if (boundary_cell_col.index_col !== index_col) {
        boundary_cell_col.InsertRight(new SparseCell(-1, index_col));
        boundary_cell_col = boundary_cell_col.cell_right;
    }
    let cell_col = FindCellToRight(boundary_cell_row, index_col);
    let cell_row = FindCellToDown(boundary_cell_col, index_row);
    if (cell_col !== cell_row && value !== this.default_value) {
        let cell = new SparseCell(index_row, index_col, value, cell_row.cell_down, cell_col.cell_right);
        cell_col.cell_right = cell;
        cell_row.cell_down = cell;
    } else if (value !== this.default_value) {
        cell_col.value = value;
    } else {
        FindCellToRight(boundary_cell_row, index_col - 1).cell_right = cell_col.cell_right;
        FindCellToDown(boundary_cell_col, index_row - 1).cell_down = cell_row.cell_down;
    }
};


/**
 * Get value at position (index_row, index_col), return default_value if no such cell found
 * @param index_row - index of row
 * @param index_col - index of column
 */
SparseMatrix.prototype.get = function (index_row, index_col) {
    let boundary_cell_row = FindCellToDown(this.root, index_row);
    let boundary_cell_col = FindCellToRight(this.root, index_col);
    if (boundary_cell_row.index_row !== index_row) {
        return this.default_value;
    }
    if (boundary_cell_col.index_col !== index_col) {
        return this.default_value;
    }
    let cell_col = FindCellToRight(boundary_cell_row, index_col);
    let cell_row = FindCellToDown(boundary_cell_col, index_row);
    if (cell_col !== cell_row) {
        return this.default_value;
    }
    return cell_col.value;
};

/**
 * Multiplication of two given sparse matrices.
 * @param {SparseMatrix} a - first matrix
 * @param {SparseMatrix} b - second matrix
 * @returns {SparseMatrix} result of multiplication
 */
function MatDotMat(a, b) {
    // todo: refactoring
    let res = new SparseMatrix();
    for (let boundary_a_row = a.root; boundary_a_row != null; boundary_a_row = boundary_a_row.cell_down) {
        for (let boundary_b_col = b.root; boundary_b_col != null; boundary_b_col = boundary_b_col.cell_right) {
            let cell_a = boundary_a_row.cell_right;
            let cell_b = boundary_b_col.cell_down;
            let dot_product = 0;
            while (cell_a != null && cell_b != null) {
                while (cell_a != null && cell_a.index_col < cell_b.index_row) cell_a = cell_a.cell_right;
                if (cell_a == null) break;
                while (cell_b != null && cell_a.index_col > cell_b.index_row) cell_b = cell_b.cell_down;
                if (cell_b == null) break;
                if (cell_a.index_col === cell_b.index_row) {
                    dot_product += cell_a.value * cell_b.value;
                    cell_a = cell_a.cell_right;
                    cell_b = cell_b.cell_down;
                }
            }
            res.set(boundary_a_row.index_row, boundary_b_col.index_col, dot_product);
        }
    }
    return res;
}

/**
 * Multiplication of matrix and vector.
 * Transforms vector of numbers into matrix with dimensions (n, 1) and then call MatDotMat.
 * @param {SparseMatrix} mat - given matrix.
 * @param {Array} vec - given vector.
 * @returns {Array} result of multiplication.
 */
function MatDotVec(mat, vec) {
    let m_vec = new SparseMatrix();
    for (let i = vec.length - 1; i >= 0; i--) {
        m_vec.set(i, 0, vec[i]);
    }
    let m_res = MatDotMat(mat, m_vec);
    let res = [];
    for (let i = 0; i < vec.length; i++) {
        res.push(m_res.get(i, 0));
    }
    return res;
}

/**
 * Construct SparseMatrix from the set of values with given row and column indices.
 * Works in O(NlogN) where N = number of values.
 * @param values - set of objects with fields index_row, index_col, value
 * @returns {SparseMatrix} constructed matrix
 */
function SparseMatrixFromValues(values) {
    // todo: refactoring
    let mat = new SparseMatrix();
    values.sort(function (a, b) {
        return b.index_row - a.index_row;
    });
    values.forEach(function (value) {
        mat.set(value.index_row, -1, null);
    });
    values.sort(function (a, b) {
        return (a.index_col === b.index_col ? a.index_row - b.index_row : a.index_col - b.index_col);
    });
    let cell_row = {};
    let ptr = mat.root;
    while (ptr != null) {
        cell_row[ptr.index_row] = ptr;
        ptr = ptr.cell_down;
    }
    let vertical_ptr = new SparseCell(-1, values[0].index_col);
    let boundary_ptr = vertical_ptr;
    mat.root.cell_right = vertical_ptr;
    for (let i = 0; i < values.length; i++) {
        if (i && values[i - 1].index_col !== values[i].index_col) {
            let tmp = new SparseCell(-1, values[i].index_col);
            boundary_ptr.cell_right = tmp;
            boundary_ptr = vertical_ptr = tmp;
        }
        vertical_ptr.InsertDown(new SparseCell(values[i].index_row, values[i].index_col, values[i].value));
        vertical_ptr = vertical_ptr.cell_down;
        cell_row[values[i].index_row].cell_right = vertical_ptr;
        cell_row[values[i].index_row] = vertical_ptr;
    }
    return mat;
}

// todo: SparseMatrix from two dimensional array

// todo: other matrix operations