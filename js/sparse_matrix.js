/**
 * SparseMatrix - compressed sparse matrix representation, stores only nonzero values.
 * Implemented as multi-linked-list that stores only non-zero cells and each cell has
 * link to first non-zero cell below and at right.
 * @class
 */
function SparseMatrix(height, width) {
    this.height = height;
    this.width = width;
    this.rows = new Array(height).fill(null);
    this.columns = new Array(width).fill(null);
    for (let i = 0; i < this.height; i++) this.rows[i] = new LinkedNode(null);
    for (let i = 0; i < this.width; i++) this.columns[i] = new LinkedNode(null);
    this.default_value = 0; // not supported yet, 0 by default todo: add support
}

/**
 * SparseCell - represents one cell in matrix.
 * @param index_row - index of row, -1 for boundary cell.
 * @param index_col - index of column, -1 for boundary cell.
 * @param value - value stored in this cell.
 * @class
 */
function SparseCell(index_row, index_col, value = null) {
    this.index_row = index_row;
    this.index_col = index_col;
    this.value = value;
}

function LinkedNode(cell, next = null) {
    this.cell = cell;
    this.next = next;
}

/**
 * Find the first node below, where index_row is less than or equal to the given.
 */
function FindNodeDown(node, index_row) {
    while (node != null && node.next != null && node.next.cell.index_row <= index_row) {
        node = node.next;
    }
    return node;
}

/**
 * Find the first node at right, where index_col is less than or equal to the given.
 */
function FindNodeRight(node, index_col) {
    while (node != null && node.next != null && node.next.cell.index_col <= index_col) {
        node = node.next;
    }
    return node;
}

/**
 * Set value at position (index_row, index_col)
 * @param index_row - index of row
 * @param index_col - index of column
 * @param value - value to set
 */
SparseMatrix.prototype.set = function (index_row, index_col, value) {
    if (index_row < 0 || index_row >= this.height) return;
    if (index_col < 0 || index_col >= this.width) return;
    let node_left = FindNodeRight(this.rows[index_row], index_col);
    let node_above = FindNodeDown(this.columns[index_col], index_row);
    if ((node_left.cell !== node_above.cell || node_left.cell == null || node_above.cell == null) && value !== this.default_value) {
        // create cell
        let cell = new SparseCell(index_row, index_col, value);
        node_left.next = new LinkedNode(cell, node_left.next);
        node_above.next = new LinkedNode(cell, node_above.next);
    } else if (value !== this.default_value) {
        // set value in existing cell
        node_left.cell.value = value;
    } else if (node_left.cell === node_above.cell) {
        // remove cell
        FindNodeRight(this.rows[index_row], index_col - 1).next = node_left.next;
        FindNodeDown(this.columns[index_col], index_row - 1).next = node_above.next;
    }
};


/**
 * Get value at position (index_row, index_col), return default_value if no such cell found
 * @param index_row - index of row
 * @param index_col - index of column
 */
SparseMatrix.prototype.get = function (index_row, index_col) {
    let node_col = FindNodeRight(this.rows[index_row], index_col);
    let node_row = FindNodeDown(this.columns[index_col], index_row);
    if (node_col.cell == null || node_row.cell == null || node_col.cell !== node_row.cell) {
        return this.default_value;
    }
    return node_row.cell.value;
};


/**
 * Checks if cell with given index of row and column has non-zero value
 * @param index_row - index of row
 * @param index_col - index of column
 */
SparseMatrix.prototype.present = function (index_row, index_col) {
    let node_col = FindNodeRight(this.rows[index_row], index_col);
    let node_row = FindNodeDown(this.columns[index_col], index_row);
    return node_col.cell != null && node_row.cell != null && node_col.cell === node_row.cell;
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
    for (let i = 0; i < a.height; i++) {
        for (let j = 0; j < b.width; j++) {
            let node_a = a.rows[i].next;
            let node_b = b.columns[j].next;
            let dot_product = 0;
            while (node_a != null && node_b != null) {
                while (node_a != null && node_a.cell.index_col < node_b.cell.index_row) node_a = node_a.next;
                if (node_a == null) break;
                while (node_b != null && node_a.cell.index_col > node_b.cell.index_row) node_b = node_b.next;
                if (node_b == null) break;
                if (node_a.cell.index_col === node_b.cell.index_row) {
                    dot_product += node_a.cell.value * node_b.cell.value;
                    node_a = node_a.next;
                    node_b = node_b.next;
                }
            }
            res.set(i, j, dot_product);
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
        vertical_ptr.cell_down = new SparseCell(values[i].index_row, values[i].index_col, values[i].value);
        vertical_ptr = vertical_ptr.cell_down;
        cell_row[values[i].index_row].cell_right = vertical_ptr;
        cell_row[values[i].index_row] = vertical_ptr;
    }
    return mat;
}

// todo: SparseMatrix from two dimensional array

// todo: other matrix operations