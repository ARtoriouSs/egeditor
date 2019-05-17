'use strict'

const NO_FILE_TEXT = 'No file'
const PLACEHOLDER_VALUE = 'placeholder'
const COLORS = ['#ffb300', '#c6583e', '#668f3c', '#617db4', '#bconst956af']
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

  if (checkCompleteness()) {
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
