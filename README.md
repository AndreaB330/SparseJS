# SparseJS

A small JavaScript library that allows you to work efficiently with sparse matrices.

[Click to see demo](https://andrewb330.github.io/SparseJS/)
# Usage

```js
// create
let m1 = new SparseMatrix(5, 6);
let m2 = new SparseMatrix(5, 5).identity();
let m3 = new SparseMatrix().fromArray([[0, 1], [-1, 0.5]]);

// change
m1.set(0, 0, -3);
m1.transpose();
m1.reshape(3, 3);

// copy
m2 = m1.copy();

// get
console.log(m1.get(0, 0)); // -3

// examples
console.log(new SparseMatrix(3, 3).identity().toArray());
// [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

let a = 0.33; // angle
let r = new SparseMatrix().fromArray([ // rotation matrix
    [Math.cos(a), -Math.sin(a)], 
    [Math.sin(a), Math.cos(a)], 
]);
r.reshape(3, 3).set(2, 2, 1); // expand matrix and set new value
let res = r.mul(r.copy().transpose()); // multiply
console.log(res.toArray());
// [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
```

# Page Rank example

```js
let n = 13; // number of pages
let damping_factor = 0.8;
// links: (from, to, number of links)
let links = [[0, 11, 2],
    [12, 11, 3],
    // ... more links ...
    [3, 10, 1]];

let mat = new SparseMatrix(n, n);

links.forEach(function (link) {
    mat.set(link[1], link[0], link[2]);
}); // set links

// normalize matrix
for (let i = 0; i < n; i++) {
    let column_sum = mat.computeByColumn(i, (a, b) => a + b, 0);
    if (column_sum > 0) mat.mapByColumn(i, x => x / column_sum);
}

let page_rank = new Array(n).fill(1 / n); // initialize page_rank with 1/n values

for (let iteration = 0; iteration < 16; iteration++) {
    let next_page_rank = mat.mul(page_rank); // multiply vector by matrix (M*v)
    for (let i = 0; i < n; i++) {
        page_rank[i] = next_page_rank[i] * damping_factor + (1 - damping_factor) / n; // recompute page rank
    }
}

console.log(page_rank);
// [0.0153, 0.0289, 0.0853, 0.0811, 0.0660, 0.1721, 0.0235, 0.0153, 0.0211, 0.0563, 0.1525, 0.2213, 0.0606]
```
