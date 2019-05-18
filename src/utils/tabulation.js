'use strict'

const UNTITLED_TEXT = 'Untitled'

function updateGraphFromSelectedTab() {
  var graphData = JSON.parse($('.selected-tab > .tab-content').attr('data-graph'))
  sigmaInst.graph.clear()
  sigmaInst.graph.read(graphData)
  sigmaInst.refresh()
  clearEdgeInfo()
  clearNodeInfo()
  updateGraphInfo()
}

function saveGraphToTab() {
  $('.selected-tab > .tab-content').attr('data-graph', graphData())
}

function addAndSelectEmptyTab() {
  var newTabButton = $('#new-tab')
  newTabButton.remove()
  $('.selected-tab').removeClass('selected-tab')
  $('#tabulator').append(
    '<div class="tab selected-tab fadeInLeft animated">' +
      '<div class="tab-content" data-graph="' + emptyGraphData() + '">Untitled</div>' +
      '<img src="../assets/images/cross.png" class="close-tab">' +
    '</div>'
  ).append(newTabButton)
}

function addAndSelectTab(name) {
  var newTabButton = $('#new-tab')
  var tabName = name || UNTITLED_TEXT
  newTabButton.remove()
  $('.selected-tab').removeClass('selected-tab')
  $('#tabulator').append(
    '<div class="tab selected-tab">' +
      '<div class="tab-content" data-graph="' + graphData() + '">' + tabName + '</div>' +
      '<img src="../assets/images/cross.png" class="close-tab">' +
    '</div>'
  ).append(newTabButton)
}

function selectLastTab() {
  $($('.tab')[0]).addClass('selected-tab')
  updateGraphFromSelectedTab()
}

function renameSelectedTab(name) {
  var newName = name || UNTITLED_TEXT
  $('.selected-tab').find('.tab-content').text(newName)
}
