function assert_eq(first, second) {
    if (first !== second) {
        throw "Assertion failed " + first + " != " + second + ".";
    }
}

function test_create_set_get() {
    let m = new SparseMatrix(2, 3);
    assert_eq(2, m.height);
    assert_eq(3, m.width);
    assert_eq(0, m.get(0, 1));
    assert_eq(0, m.get(1, 2));
    m.set(1,1, -1);
    assert_eq(-1, m.get(1, 1));
    m.set(1,2, 2);
    assert_eq(2, m.get(1, 2));
    m.set(0,2, 3);
    assert_eq(3, m.get(0, 2));

    let id = new SparseMatrix(5, 5).identity();
    assert_eq(1, id.get(0,0));
    assert_eq(1, id.get(1,1));
    assert_eq(1, id.get(2,2));
    assert_eq(1, id.get(3,3));
    assert_eq(1, id.get(4,4));
    assert_eq(0, id.get(0,1));
    assert_eq(0, id.get(2,3));
    assert_eq(0, id.get(4,2));

    let arr = [[0, 1, 2], [-1, 0, 5], [0.5, 3, -1]];
    let m_arr = new SparseMatrix().fromArray(arr);
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            assert_eq(arr[i][j], m_arr.get(i, j));
    console.log('test_create_set_get passed');
}

function test_transpose() {
    let arr = [[0, 1, 2], [-1, 0, 5]];
    let m_arr = new SparseMatrix().fromArray(arr);
    m_arr.transpose();
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 2; j++)
            assert_eq(arr[j][i], m_arr.get(i, j));
    console.log('test_transpose passed');
}

function test_compute() {
    let arr = [[0, 1, 2], [-1, 0, 5]];
    let m_arr = new SparseMatrix().fromArray(arr);
    assert_eq(3, m_arr.computeByRow(0, function(a, b){return a+b;}, 0));
    assert_eq(4, m_arr.computeByRow(1, function(a, b){return a+b;}, 0));
    assert_eq(-1, m_arr.computeByColumn(0, function(a, b){return a+b;}, 0));
    assert_eq(1, m_arr.computeByColumn(1, function(a, b){return a+b;}, 0));
    assert_eq(7, m_arr.computeByColumn(2, function(a, b){return a+b;}, 0));
    assert_eq(7, m_arr.compute(function(a, b){return a+b;}, 0));
    assert_eq(5, m_arr.compute(function(a, b){return (a > b ? a : b);}, 0));
    console.log('test_compute passed');
}

function test_map() {
    let arr = [[0, 1, 2], [-1, 0, 5], [0.5, 3, -1], [0, 0, 2]];
    let m_arr = new SparseMatrix().fromArray(arr);
    m_arr.map(function (x) {
        return -1 * x;
    });
    assert_eq(arr[0][1], -m_arr.get(0, 1));
    assert_eq(arr[0][2], -m_arr.get(0, 2));
    assert_eq(arr[2][2], -m_arr.get(2, 2));
    assert_eq(arr[2][1], -m_arr.get(2, 1));
    assert_eq(arr[3][2], -m_arr.get(3, 2));
    m_arr.map(function(x) {
        return x * 2;
    });
    assert_eq(-2 * arr[0][1], m_arr.get(0, 1));
    assert_eq(-2 * arr[0][2], m_arr.get(0, 2));
    assert_eq(-2 * arr[2][2], m_arr.get(2, 2));
    assert_eq(-2 * arr[2][1], m_arr.get(2, 1));
    assert_eq(-2 * arr[3][2], m_arr.get(3, 2));
    console.log('test_map passed');
}

console.log('Running tests...');
test_create_set_get();
test_transpose();
test_compute();
test_map();