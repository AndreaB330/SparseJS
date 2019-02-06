/**
 * SparseMatrix - compressed sparse matrix representation, stores only nonzero values.
 * Implemented as multi-linked-list that stores only non-zero cells and each cell has
 * link to first non-zero cell below and at right.
 * @param {number} height - number of rows
 * @param {number} width - number of columns
 * @class
 */
function SparseMatrix(height = 0, width = 0) {
    this.height = height;
    this.width = width;
    this.rows = new Array(height).fill(null);
    this.columns = new Array(width).fill(null);
    for (let i = 0; i < this.height; i++) this.rows[i] = new LinkedNode(0, -1);
    for (let i = 0; i < this.width; i++) this.columns[i] = new LinkedNode(0, -1);
    this.default_value = 0; // not supported yet, 0 by default
}

/**
 * LinkedNode - node of linked list
 * @param {number} value
 * @param {number} index
 * @param {LinkedNode} next - pointer to next node
 * @param {LinkedNode} twin - pointer to twin node (row node has twin column node)
 * @class
 */
function LinkedNode(value, index, next = null, twin = null) {
    this.value = value;
    this.index = index;
    this.next = next;
    this.twin = twin;
}

/**
 * Find the last node (starting from this) whose index is less or equal to the given one.
 * @param {number} index
 */
LinkedNode.prototype.findNode = function (index) {
    let node = this;
    while (node.next != null && node.next.index <= index) {
        node = node.next;
    }
    return node;
};

/**
 * Make a copy of linked list
 * @returns {LinkedNode}
 */
LinkedNode.prototype.copy = function () {
    return new LinkedNode(this.value, this.index, (this.next != null ? this.next.copy() : null), this.twin);
};

/**
 * Compute associative function on linked list
 * @param {function} func
 * @param {number} default_value
 * @return {number} result
 */
LinkedNode.prototype.compute = function (func, default_value) {
    let ptr = this;
    let result = default_value;
    while (ptr != null) {
        result = func(result, ptr.value);
        ptr = ptr.next;
    }
    return result;
};

/**
 * Apply function to all values in list
 * @param {function} func
 */
LinkedNode.prototype.map = function (func) {
    let ptr = this;
    while (ptr != null) {
        ptr.twin.value = ptr.value = func(ptr.value);
        ptr = ptr.next;
    }
};

/**
 * Make a copy of sparse matrix
 * @returns {SparseMatrix}
 */
SparseMatrix.prototype.copy = function () {
    let copy = new SparseMatrix(this.height, this.width);
    for (let i = 0; i < this.height; i++) copy.rows[i] = this.rows[i].copy();
    for (let i = 0; i < this.width; i++) copy.columns[i] = this.columns[i].copy();
    return copy;
};

SparseMatrix.prototype._checkMapFunction = function(func) {
    if (func(this.default_value) !== this.default_value) throw "Cannot apply function that change default value.";
};

SparseMatrix.prototype._checkIndices = function (index_row, index_col) {
    if (index_row < 0 || index_row >= this.height) throw "Row index is out of range, row: " + index_row;
    if (index_col < 0 || index_col >= this.width) throw "Column index is out of range, column: " + index_row;
};

SparseMatrix.prototype._checkSquare = function () {
    if (this.width !== this.height) throw "This operation cannot be applied to a non-square matrix";
};

/**
 * Set value at position (index_row, index_col)
 * @param {number} index_row - index of row
 * @param {number} index_col - index of column
 * @param {number | *} value - value to set
 */
SparseMatrix.prototype.set = function (index_row, index_col, value) {
    this._checkIndices(index_row, index_col);
    let node_left = this.rows[index_row].findNode(index_col);
    let node_above = this.columns[index_col].findNode(index_row);
    if (node_left.index !== index_col && value !== this.default_value) {
        // insert two nodes (vertical and horizontal)
        node_left.next = new LinkedNode(value, index_col, node_left.next);
        node_above.next = new LinkedNode(value, index_row, node_above.next);
        node_left.next.twin = node_above.next;
        node_above.next.twin = node_left.next;
    } else if (value !== this.default_value) {
        // update values in existing nodes
        node_left.value = value;
        node_above.value = value;
    } else if (value === this.default_value) {
        // remove nodes
        this.rows[index_row].findNode(index_col - 1).next = node_left.next;
        this.columns[index_col].findNode(index_row - 1).next = node_above.next;
    }
    return this;
};


/**
 * Get value at position (index_row, index_col), return default_value if no such cell found
 * @param {number} index_row - index of row
 * @param {number} index_col - index of column
 */
SparseMatrix.prototype.get = function (index_row, index_col) {
    this._checkIndices(index_row, index_col);
    let node = this.rows[index_row].findNode(index_col);
    if (node.index !== index_col) {
        return this.default_value;
    }
    return node.value;
};

/**
 * Reset current square matrix to identity matrix i.e. ones on main diagonal
 */
SparseMatrix.prototype.identity = function () {
    this._checkSquare();
    for (let i = 0; i < this.height; i++) this.rows[i] = new LinkedNode(0, -1);
    for (let i = 0; i < this.width; i++) this.columns[i] = new LinkedNode(0, -1);
    for (let i = 0; i < this.height; i++) {
        this.set(i, i, 1);
    }
    return this;
};

/**
 * Checks if cell with given index of row and column has non-zero value
 * @param {number} index_row - index of row
 * @param {number} index_col - index of column
 * @return {boolean}
 */
SparseMatrix.prototype.present = function (index_row, index_col) {
    this._checkIndices(index_row, index_col);
    return this.rows[index_row].findNode(index_col).index === index_col;
};

/**
 * Transpose current matrix
 */
SparseMatrix.prototype.transpose = function () {
    let tmp = this.columns;
    this.columns = this.rows;
    this.rows = tmp;
    let tmp_2 = this.width;
    this.width = this.height;
    this.height = tmp_2;
    return this;
};

/**
 * Transforms sparse matrix into two dimensional array.
 * @returns {Array}
 */
SparseMatrix.prototype.toArray = function () {
    let array = [];
    for (let i = 0; i < this.height; i++) {
        let row = [];
        for (let j = 0; j < this.width; j++) {
            row.push(this.get(i, j));
        }
        array.push(row);
    }
    return array;
};

SparseMatrix.prototype.toJSON = function () {
    return this.toArray();
};

/**
 * Multiply this matrix by given matrix.
 * @param {SparseMatrix} other
 * @returns {SparseMatrix} result of multiplication
 */
SparseMatrix.prototype._multiplyMatMat = function (other) {
    let res = new SparseMatrix(this.height, other.width);
    for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < other.width; j++) {
            let first_pointer = this.rows[i].next;
            let second_pointer = other.columns[j].next;
            let dot_product = 0;
            while (first_pointer != null && second_pointer != null) {
                while (first_pointer != null && first_pointer.index < second_pointer.index)
                    first_pointer = first_pointer.next;
                if (first_pointer == null) break;
                while (second_pointer != null && first_pointer.index > second_pointer.index)
                    second_pointer = second_pointer.next;
                if (second_pointer == null) break;
                if (first_pointer.index === second_pointer.index) {
                    dot_product += first_pointer.value * second_pointer.value;
                    first_pointer = first_pointer.next;
                    second_pointer = second_pointer.next;
                }
            }
            res.set(i, j, dot_product);
        }
    }
    return res;
};

/**
 * Multiply vector on matrix M*v.
 * Transforms vector of numbers into matrix with dimensions (n, 1) and then call matrix-matrix multiplication.
 * @param {Array} vec - given vector.
 * @returns {Array} result of multiplication.
 */
SparseMatrix.prototype._multiplyMatVec = function (vec) {
    let m_vec = new SparseMatrix(this.height, 1);
    for (let i = vec.length - 1; i >= 0; i--) {
        m_vec.set(i, 0, vec[i]);
    }
    let m_res = this.mul(m_vec);
    let res = new Array(vec.length).fill(0);
    let pointer = m_res.columns[0].next;
    for (let i = 0; i < vec.length; i++) {
        while (pointer != null && pointer.index < i) pointer = pointer.next;
        if (pointer == null) break;
        if (pointer.index === i) res[i] = pointer.value;
    }
    return res;
};


/**
 * Multiply matrix by number
 * @param {number} other
 * @return {SparseMatrix}
 */
SparseMatrix.prototype._mulMatNum = function (other) {
    let res = this.copy();
    res.rows.forEach(function (ptr) {
        while (ptr != null) {
            ptr.value *= other;
            ptr = ptr.next;
        }
    });
    res.columns.forEach(function (ptr) {
        while (ptr != null) {
            ptr.value *= other;
            ptr = ptr.next;
        }
    });
    return res;
};

/**
 * Multiply matrix by number, sparse matrix or vector
 * @param {number | SparseMatrix | Array} other
 * @return {SparseMatrix | Array}
 */
SparseMatrix.prototype.mul = function (other) {
    if (typeof other == 'number') {
        return this._mulMatNum(other);
    }
    if (other instanceof SparseMatrix) {
        return this._multiplyMatMat(other);
    }
    if (other instanceof Array) {
        return this._multiplyMatVec(other);
    }
};

/**
 * Change shape of matrix
 * @param {number} new_height
 * @param {number} new_width
 */
SparseMatrix.prototype.reshape = function (new_height, new_width) {
    this.height = new_height;
    this.width = new_width;
    while (this.rows.length < this.height) this.rows.push(new LinkedNode(0, -1));
    while (this.columns.length < this.width) this.columns.push(new LinkedNode(0, -1));
    while (this.rows.length > this.height) this.rows.pop();
    while (this.columns.length > this.width) this.columns.pop();
    return this;
};

/**
 * Construct sparse matrix from two dimensional array
 * @param {Array} array
 * @return {SparseMatrix}
 */
SparseMatrix.prototype.fromArray = function (array) {
    // todo: validate param
    this.reshape(array.length, array[0].length);
    for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
            this.set(i, j, array[i][j]);
        }
    }
    return this;
};

/**
 * Compute associative function on row
 * @param {number} index_row
 * @param {function} func
 * @param {number} default_value
 * @returns {number} result
 */
SparseMatrix.prototype.computeByRow = function (index_row, func, default_value) {
    this._checkIndices(index_row, 0);
    let ptr = this.rows[index_row].next;
    if (ptr == null) return default_value;
    return ptr.compute(func, default_value);
};

/**
 * Compute associative function on column
 * @param {number} index_col
 * @param {function} func
 * @param {number} default_value
 * @returns {number} result
 */
SparseMatrix.prototype.computeByColumn = function (index_col, func, default_value) {
    this._checkIndices(0, index_col);
    let ptr = this.columns[index_col].next;
    if (ptr == null) return default_value;
    return ptr.compute(func, default_value);
};

/**
 * Compute associative function on matrix
 * @param {function} func
 * @param {number} default_value
 * @returns {number} result
 */
SparseMatrix.prototype.compute = function (func, default_value) {
    let result = default_value;
    for (let i = 0; i < this.height; i++) {
        let ptr = this.rows[i].next;
        if (ptr != null) result = func(result, ptr.compute(func, default_value));
    }
    return result;
};

/**
 * Apply function to all values in column
 * @param {number} index_col
 * @param {function} func
 * @returns {number} result
 */
SparseMatrix.prototype.mapByColumn = function (index_col, func) {
    this._checkIndices(0, index_col);
    this._checkMapFunction(func);
    let ptr = this.columns[index_col].next;
    if (ptr != null) ptr.map(func);
};

/**
 * Apply function to all values in row
 * @param {number} index_row
 * @param {function} func
 * @returns {number} result
 */
SparseMatrix.prototype.mapByRow = function (index_row, func) {
    this._checkIndices(index_row, 0);
    this._checkMapFunction(func);
    let ptr = this.rows[index_row].next;
    if (ptr != null) ptr.map(func);
};

/**
 * Apply function to all values in matrix
 * @param {function} func
 * @returns {number} result
 */
SparseMatrix.prototype.map = function (func) {
    this._checkMapFunction(func);
    for (let i = 0; i < this.height; i++) {
        let ptr = this.rows[i].next;
        if (ptr != null) ptr.map(func);
    }
};

/**
 * Construct SparseMatrix from the set of values with given row and column indices.
 * Works in O(NlogN) where N = number of values.
 * @param values - set of objects with fields index_row, index_col, value
 * @returns {SparseMatrix} constructed matrix
 */
function SparseMatrixFromValues(values) {
    // todo: refactoring
    /*let mat = new SparseMatrix();
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
    return mat;*/
}

// todo: SparseMatrix from two dimensional array

// todo: other matrix operations