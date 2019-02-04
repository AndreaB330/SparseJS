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

    mat = new SparseMatrix();
    mat.set(13, getRandomInt(0, 13), getRandomInt(-9, 99));
    mat.set(getRandomInt(0, 13), 13, getRandomInt(-9, 99));
    for (let i = 0; i < 10; i++) {
        mat.set(getRandomInt(0, 13), getRandomInt(0, 13), getRandomInt(-9, 99));
    }

    $('#content').html('<table id="demo" class="matrix demo"></table>');
    BuildMatrix('demo', mat, ClickHandler);
}

function DemoPageRank() {
    $(active_btn).removeClass('active');
    active_btn = '#btn-page-rank';
    $(active_btn).addClass('active');
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