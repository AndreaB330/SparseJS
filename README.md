# SparseJS

A small JavaScript library that allows you to work efficiently with sparse matrices.

[Click to see demo](https://andreab330.github.io/SparseJS/)
# Usage

```js
let m = new SparseMatrix(10, 10);
m.set(0, 0, 10);
m.set(2, 3, 7);
m.transpose();
m = m.multiply(m);
console.log(m.get(0, 0));
```

TODO: a lot....