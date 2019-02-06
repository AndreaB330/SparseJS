let active_btn = '';
let mat = null;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DemoRandomMatrix() {
    $(active_btn).removeClass('active');
    active_btn = '#btn-rand';
    $(active_btn).addClass('active');

    mat = new SparseMatrix(14, 14);
    for (let i = 0; i < 20; i++) {
        mat.set(getRandomInt(0, mat.height - 1), getRandomInt(0, mat.width - 1), getRandomInt(-9, 99));
    }

    $('#content').html('<table id="demo" class="matrix demo"></table>');
    BuildMatrix('demo', mat, ClickHandler);
}

function DemoPageRank() {
    $(active_btn).removeClass('active');
    active_btn = '#btn-page-rank';
    $(active_btn).addClass('active');
    let matrix = new SparseMatrix();
    $('#content').html('');
}

function ClickHandler(i, j) {
    if (i >= 0 && j >= 0) {
        if (mat.get(i, j) === 0)
            mat.set(i, j, getRandomInt(-9,99));
        else
            mat.set(i, j, 0);
    }
    $('#content').html('<table id="demo" class="matrix demo"></table>');
    BuildMatrix('demo', mat, ClickHandler);
}

window.onload = function () {
    DemoRandomMatrix();
};