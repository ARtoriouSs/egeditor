$(document).ready(() => {
  const { dialog } = require('electron').remote
  const fs = require('fs')

  sigma.plugins.dragNodes(sigmaInst, sigmaInst.renderers[0])
  CustomShapes.init(sigmaInst)
  sigmaInst.refresh()
  updateGraphInfo()

  $('#load').on('click', () => {
    var options = {
      properties: ['openFile', 'showHiddenFiles'],
      title: 'Open graph',
      filters: [
        { name: 'Graphs', extensions: ['ege'] },
      ]
    }
    var callback = (paths) => {
      if (!paths) return

      var path = paths[0]
      var name = graphName(path)
      fs.readFile(path, 'utf-8', (error, data) => {
        if (error) {
          alert("An error ocurred reading the file: " + error.message)
          return
        }
        var graphData = JSON.parse(data)
        graphData = { edges: graphData.edges, nodes: graphData.nodes }

        sigmaInst.graph.clear()
        sigmaInst.graph.read(graphData)
        sigmaInst.refresh()
        if (!$('.selected-tab').is('div')) {
          addAndSelectTab(name)
        } else {
          renameSelectedTab(name)
        }
        updateGraphInfo()
      })
      $('#graph-name').text(name)
    }
    dialog.showOpenDialog(null, options, callback)
  })

  $('#save').on('click', () => {
    var options = {
      title: 'Save graph',
      filters: [
        { name: 'Graphs', extensions: ['ege'] },
      ]
    }
    var callback = (path) => {
      if (!path) return
      var name = graphName(path)
      fs.writeFile(path, graphData(), (error) => {
        if (error) {
          alert("An error ocurred creating the file: " + error.message)
          return
        }
      })
      $('#graph-name').text(name)
      renameSelectedTab(name)
    }
    dialog.showSaveDialog(null, options, callback)
  })

  $('#clear').on('click', () => {
    clearGraph()
  })

  $('#make-complete').on('click', () => {
    toComplete()
  })

  $('#node-file-input').on('click', (event) => {
    var options = {
      properties: ['openFile', 'showHiddenFiles'],
      title: 'Open node file',
    }
    var callback = (paths) => {
      if (!paths) return
      var id = $('#node-info').attr('data-id')
      var path = paths[0]
      $('#file-name').text(path.split('/').pop())
      getNodeById(id).file = path
      sigmaInst.refresh()
    }
    dialog.showOpenDialog(null, options, callback)
  })

  $('#randomize').on('click', () => {
    var randomGraph = { nodes: [], edges: [] }
    var nodesCount = 10
    var edgesCount = 15

    for (var i = 1; i <= nodesCount; i++) {
      randomGraph.nodes.push({
        id: i.toString(),
        label: 'Node ' + i,
        x: Math.random(),
        y: Math.random(),
        size: 30,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        data: '',
        file: '',
        type: ShapeLibrary.enumerate().map(function (shape) { return shape.name })[Math.round(Math.random() * 5)]
      })
    }

    for (var i = 1; i <= edgesCount; i++) {
      randomGraph.edges.push({
        id: i.toString(),
        source: (Math.random() * nodesCount | 1).toString(),
        target: (Math.random() * nodesCount | 1).toString(),
        type: EDGE_TYPES[Math.floor(Math.random() * EDGE_TYPES.length)],
        size: 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        count: (multipleEdgesCount(this.source, this.target) + 1) * 10
      })
    }

    sigmaInst.graph.clear()
    sigmaInst.graph.read(randomGraph)
    sigmaInst.refresh()
    clearNodeInfo()
    clearEdgeInfo()
    if (!$('.selected-tab').is('div')) addAndSelectTab()
    updateGraphInfo()
  })

  sigmaInst.bind('clickStage', () => {
    clearNodeInfo()
    clearEdgeInfo()
  })

  sigmaInst.bind('clickNode', (event) => {
    var node = event.data.node
    var colorInput = $('#node-color-input')

    $('#node-info').attr('data-id', node.id)
    $('#node-label-input').val(node.label)
    $('#node-data-input').val(node.data)
    $('#file-name').text(node.file.split('/').pop() || NO_FILE_TEXT)
    $('#node-id-label').text(node.id)
    $('#node-power').text(nodePower(node))
    $('#node-shape-input').val(node.type || PLACEHOLDER_VALUE)
    colorInput.val(node.color || PLACEHOLDER_VALUE)

    var selectedColor = colorInput.children("option:selected").text().toLowerCase()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  sigmaInst.bind('clickEdge', (event) => {
    var edge = event.data.edge
    var colorInput = $('#edge-color-input')

    $('#edge-info').attr('data-id', edge.id)
    $('#edge-id-label').text(edge.id)
    colorInput.val(edge.color)

    var selectedColor = colorInput.children("option:selected").text().toLowerCase()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  $('#node-color-input').on('change', function () {
    var id = $('#node-info').attr('data-id')
    var input = $(this)
    var selected = input.children("option:selected")
    var color = selected.text().toLowerCase()
    var value = selected.val()

    if (value === PLACEHOLDER_VALUE) {
      input.removeClass().addClass('color-input-white')
      return
    }

    getNodeById(id).color = value
    sigmaInst.refresh()
    input.removeClass().addClass('color-input-' + color)
  })

    $('#node-shape-input').on('change', function () {
    var id = $('#node-info').attr('data-id')
    var input = $(this)
    var selected = input.children("option:selected")
    var shape = selected.val()

    if (shape === PLACEHOLDER_VALUE) {
      input.removeClass().addClass('shape-input')
      return
    }

    getNodeById(id).type = shape
    sigmaInst.refresh()
  })

  $('#edge-color-input').on('change', function () {
    var id = $('#edge-info').attr('data-id')
    var input = $(this)
    var selected = input.children("option:selected")
    var color = selected.text().toLowerCase()
    var value = selected.val()

    if (value === PLACEHOLDER_VALUE) {
      input.removeClass().addClass('color-input-white')
      return
    }

    getEdgeById(id).color = value
    sigmaInst.refresh()
    input.removeClass().addClass('color-input-' + color)
  })

  $('#node-label-input').on('input', function () {
    var id = $('#node-info').attr('data-id')
    getNodeById(id).label = $(this).val()
    sigmaInst.refresh()
  })

  $('#drop-node').on('click', () => {
    var id = $('#node-info').attr('data-id')
    sigmaInst.graph.dropNode(id)
    sigmaInst.refresh()
    updateGraphInfo()
    clearNodeInfo()
  })

  $('#drop-edge').on('click', () => {
    var id = $('#edge-info').attr('data-id')
    sigmaInst.graph.dropEdge(id)
    sigmaInst.refresh()
    updateGraphInfo()
    clearEdgeInfo()
  })

  $('#add-node').on('click', () => {
    var id = sigmaInst.graph.nodes().length + 1
    var x = parseFloat($('#node-x').val()) || 0 + (id / 10)
    var y = parseFloat($('#node-y').val()) || 0

    sigmaInst.graph.addNode({
      id: newNodeId(),
      label: "New node",
      size: 30,
      x: x,
      y: y,
      color: '#ffb300',
      file: '',
      data: ''
    })
    sigmaInst.refresh()
    if (!$('.selected-tab').is('div')) addAndSelectEmptyTab(name)
    updateGraphInfo()
  })

  $('#add-edge').on('click', () => {
    var id = sigmaInst.graph.edges().length + 1
    var source = $('#edge-source').val()
    var target = $('#edge-target').val()
    var type = $('#is-oriented').prop('checked') ? 'curvedArrow' : 'curve'
    sigmaInst.graph.addEdge({
      id: newEdgeId(),
      source: source,
      target: target,
      type: type,
      size: 3,
      color: '#668f3c',
      count: (multipleEdgesCount(source, target) + 1) * 10
    })
    sigmaInst.refresh()
    if (!$('.selected-tab').is('div')) addAndSelectEmptyTab(name)
    updateGraphInfo()
  })

  $(document).on('click', '#new-tab', () => {
    saveGraphToTab()
    addAndSelectEmptyTab()
    updateGraphFromSelectedTab()
  })

  $(document).on('click', '.close-tab', function () {
    var tab = $(this).parent()
    tab.addClass('fadeOutLeft animated')
    setTimeout(() => {
      tab.remove()
      if (!$('.tab').is('div')) {
        clearGraph()
      } else if (tab.is('.selected-tab')) {
        selectLastTab()
      }
    }, 150)
  })

  $(document).on('click', '.tab-content', function () {
    saveGraphToTab()
    $('.selected-tab').removeClass('selected-tab')
    $(this).parent().addClass('selected-tab')
    updateGraphFromSelectedTab()
  })

  $(document).on('click', '#hide-controls', function () {
    let button = $(this)
    button.attr('id', 'show-controls')
    button.text('⤻ Show me! ⤻')
    $('#graph-controls').remove('fadeInLeft')
    $('#graph-controls').addClass('fadeOutLeft')
  })

  $(document).on('click', '#show-controls', function () {
    let button = $(this)
    button.attr('id', 'hide-controls')
    button.text('⤺ Hide me! ⤺')
    $('#graph-controls').removeClass('fadeOutLeft')
    $('#graph-controls').addClass('fadeInLeft')
  })

  $(document).on('click', '#hide-search', function () {
    let button = $(this)
    button.attr('id', 'show-search')
    button.text('⤺ Show me! ⤺')
    $('#search-controls').remove('fadeInRight')
    $('#search-controls').addClass('fadeOutRight')
  })

  $(document).on('click', '#show-search', function () {
    let button = $(this)
    button.attr('id', 'hide-search')
    button.text('⤻ Hide me! ⤻')
    $('#search-controls').removeClass('fadeOutRight').removeClass('hidden')
    $('#search-controls').addClass('fadeInRight')
  })

  $('#find-path').on('click', () => {
    var from = $('#path-from').val()
    var to = $('#path-to').val()
    var paths = findAllPaths(getNodeById(from), getNodeById(to))
    debugger
  })
})
