# SparseJS

A small JavaScript library that allows you to work efficiently with sparse matrices.

[Click to see demo](https://andreab330.github.io/SparseJS/)
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

TODO: a lot....