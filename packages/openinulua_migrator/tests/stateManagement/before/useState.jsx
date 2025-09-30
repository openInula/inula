// 有问题
import React from "react";

function A() {
  let count = 0;
  return <p>{count}</p>;
}

function B() {
  let n = 0;
  n = n + 1;
  return <p>{n}</p>;
}
