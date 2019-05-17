'use strict'

const NO_FILE_TEXT = 'No file'
const PLACEHOLDER_VALUE = 'placeholder'
const COLORS = ['#ffb300', '#c6583e', '#668f3c', '#617db4', '#b956af']
const EDGE_TYPES = ['line', 'arrow']

function getNodeById(id) {
  var foundNode
  sigmaInst.graph.nodes().forEach((node) => {
    if (node.id === id) foundNode = node
  })
  return foundNode
}

function getEdgeById(id) {
  var foundEdge
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.id === id) foundEdge = edge
  })
  return foundEdge
}

function updateGraphInfo() {
  $('#nodes-number').text(sigmaInst.graph.nodes().length)
  $('#edges-number').text(sigmaInst.graph.edges().length)
  $('#nodes-powers').empty()

  sigmaInst.graph.nodes().forEach((node) => {
    $('#nodes-powers').append('<div>' + node.id + ': ' + getPower(node) + '</div>')
  })

  if (isComplete()) {
    $('#completeness').text('Graph is complete')
  } else {
    $('#completeness').text('Graph is incomplete')
  }

  $('#graph-name').text($('.selected-tab > .tab-content').text())
}

function clearNodeInfo() {
  var colorInput = $('#node-color-input')
  colorInput.val(PLACEHOLDER_VALUE)
  colorInput.removeClass().addClass('color-input-white')
  $('#node-info').removeAttr('data-id')
  $('#node-label-input').val('')
  $('#node-id-label').empty()
  $('#node-data-input').val('')
  $('#file-name').text(NO_FILE_TEXT)
  $('#node-power').empty()
  $('#node-shape-input').val(PLACEHOLDER_VALUE)
}

function clearEdgeInfo() {
  var edgeColorInput = $('#edge-color-input')
  edgeColorInput.val(PLACEHOLDER_VALUE)
  edgeColorInput.removeClass().addClass('color-input-white')
  $('#edge-info').removeAttr('data-id')
  $('#edge-id-label').empty()
}

function getGraphName(path) {
  return path.split('/').pop().split('.')[0]
}

function clearGraph() {
  sigmaInst.graph.clear()
  sigmaInst.refresh()
  clearEdgeInfo()
  clearNodeInfo()
  updateGraphInfo()
}

function graphData() {
  return '{ "nodes": ' + JSON.stringify(sigmaInst.graph.nodes()) + ',\n' +
           '"edges": ' + JSON.stringify(sigmaInst.graph.edges()) + ' }'
}

function emptyGraphData() {
  return "{ &quot;nodes&quot;: [], &quot;edges&quot;: [] }"
}

function adjacentNodeIds(node) {
  var ids = []
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.source === node.id) {
      ids.push(edge.target)
    } else if (edge.target === node.id && edge.type === 'line') ids.push(edge.source)
  })
  return ids
}

function getPower(node) {
  var power = 0
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.source === node.id) power++
  })
  return power
}

function isComplete() {
  var isComplete = true
  var nodes = sigmaInst.graph.nodes()
  var edges = sigmaInst.graph.edges()
  var nodeIds = []
  var targets = []

  nodes.forEach((node) => nodeIds.push(node.id))

  nodes.forEach((node) => {
    targets = []
    adjacentNodeIds(node).forEach((nodeId) => targets.push(nodeId))
    isComplete = isComplete && isSetsEqual(targets, arrayRemove(nodeIds, node.id))
  })

  edges.forEach((edge) => {
    if (edge.type === 'arrow') isComplete = false
  })

  return isComplete
}

function toComplete() {
  var nodes = sigmaInst.graph.nodes()
  var nodeIds = []
  var targets = []
  var targetsToAdd = []

  removeMultipleEdges()
  removeDirectedEdges()
  removeLoops()

  nodes.forEach((node) => nodeIds.push(node.id))

  nodes.forEach((node) => {
    targets = []
    adjacentNodeIds(node).forEach((nodeId) => targets.push(nodeId))

    targetsToAdd = difference(arrayRemove(nodeIds, node.id), targets)
    targetsToAdd.forEach((id) => {
      sigmaInst.graph.addEdge({
        id: (sigmaInst.graph.edges().length + 1123).toString(),
        source: node.id,
        target: id,
        type: 'line',
        size: 3,
        color: '#668f3c'
      })
    })
  })

  sigmaInst.refresh()
  updateGraphInfo()
}

function removeLoops() {
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.source === edge.target) sigmaInst.graph.dropEdge(edge.id)
  })
}

function removeDirectedEdges() {
  sigmaInst.graph.edges().forEach((edge) => {
    if (edge.type === 'arrow') sigmaInst.graph.dropEdge(edge.id)
  })
}

function removeMultipleEdges() {
  sigmaInst.graph.edges().forEach((firstEdge) => {
    sigmaInst.graph.edges().forEach((secondEdge) => {
      if (firstEdge.source === secondEdge.source && firstEdge.target === secondEdge.target && firstEdge.id !== secondEdge.id) sigmaInst.graph.dropEdge(secondEdge.id)
    })
  })
}
