'use strict'

function checkCompleteness() {
  var isComplete = true
  var nodes = sigmaInst.graph.nodes()
  var edges = sigmaInst.graph.edges()
  var nodeIds = []
  var targets

  nodes.forEach((node) => {
    nodeIds.push(node.id)
  })

  nodes.forEach((node) => {
    targets = []
    adjacentNodeIds(node).forEach((nodeId) => {
      targets.push(nodeId)
    })
    isComplete = isComplete && isSetsEqual(targets, arrayRemove(nodeIds, node.id))
  })

  edges.forEach((edge) => {
    if (edge.type === 'arrow') isComplete = false
  })

  return isComplete
}

function arrayRemove(array, value) {
  return array.filter((element) => {
    return element != value
  })
}

function isSetsEqual(first, second) {
  var unionSize = new Set([...first, ...second]).size
  return unionSize === first.length && unionSize === second.length
}

function adjacentNodeIds(node) {
  var edges = []
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.source === node.id) {
      edges.push(edge.target)
    } else if (edge.target === node.id && edge.type === 'line') edges.push(edge.source)
  })
  return edges
}

function getPower(node) {
  var power = 0
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.source === node.id) power++
  })
  return power
}
