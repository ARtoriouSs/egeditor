'use strict'

function arrayRemove(array, value) {
  return array.filter((element) => {
    return element != value
  })
}

function isSetsEqual(first, second) {
  let unionSize = new Set([...first, ...second]).size
  return unionSize === first.length && unionSize === second.length
}

function difference(_first, _second) {
  let first = new Set(_first);
  let second = new Set(_second);
  return new Set([...first].filter((value) => !second.has(value)));
}
