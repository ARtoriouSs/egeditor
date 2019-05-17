$(document).ready(() => {
  const { dialog } = require('electron').remote
  const fs = require('fs')
  var _ = require('lodash')

  const NO_FILE_TEXT = 'No file'
  const UNTITLED_TEXT = 'Untitled'
  const PLACEHOLDER_VALUE = 'placeholder'
  const COLORS = ['#ffb300', '#c6583e', '#668f3c', '#617db4', '#bconst956af']
  const EDGE_TYPES = ['line', 'arrow']

  sigma.plugins.dragNodes(sigmaInst, sigmaInst.renderers[0]);
  CustomShapes.init(sigmaInst);
  sigmaInst.refresh();
  updateGraphInfo()

  $('#load').on('click', (event) => {
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
      var name = getGraphName(path)
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
    dialog.showOpenDialog(null, options, callback);
  });

  $('#save').on('click', (event) => {
    var options = {
      title: 'Save graph',
      filters: [
        { name: 'Graphs', extensions: ['ege'] },
      ]
    }
    var callback = (path) => {
      if (!path) return
      var name = getGraphName(path)
      fs.writeFile(path, graphData(), (error) => {
        if (error) {
          alert("An error ocurred creating the file: " + error.message)
          return
        }
      });
      $('#graph-name').text(name)
      renameSelectedTab(name)
    }
    dialog.showSaveDialog(null, options, callback)
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
    dialog.showOpenDialog(null, options, callback);
  });

  $(document).on('click', '#randomize', () => {
    var randomGraph = { nodes: [], edges: [] };
    var nodesCount = 10
    var edgesCount = 10

    for (var i = 0; i < nodesCount; i++) {
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
      });
    }

    for (var i = 0; i < edgesCount; i++) {
      randomGraph.edges.push({
        id: i.toString(),
        source: (Math.random() * nodesCount | 0).toString(),
        target: (Math.random() * nodesCount | 0).toString(),
        type: EDGE_TYPES[Math.floor(Math.random() * EDGE_TYPES.length)],
        size: 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      })
    }

    sigmaInst.graph.clear()
    sigmaInst.graph.read(randomGraph)
    sigmaInst.refresh()
    clearNodeInfo()
    clearEdgeInfo()
    if (!$('.selected-tab').is('div')) addAndSelectTab()
    updateGraphInfo()
  });

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
    $('#node-power').text(getPower(node))
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

  $(document).on('change', '#node-color-input', function () {
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

    $(document).on('change', '#node-shape-input', function () {
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

  $(document).on('change', '#edge-color-input', function () {
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

  $(document).on('input', '#node-label-input', function () {
    var id = $('#node-info').attr('data-id')
    getNodeById(id).label = $(this).val()
    sigmaInst.refresh()
  })

  $(document).on('click', '#drop-node', () => {
    var id = $('#node-info').attr('data-id')
    sigmaInst.graph.dropNode(id)
    sigmaInst.refresh()
    updateGraphInfo()
    clearNodeInfo()
  })

  $(document).on('click', '#drop-edge', () => {
    var id = $('#edge-info').attr('data-id')
    sigmaInst.graph.dropEdge(id)
    sigmaInst.refresh()
    updateGraphInfo()
    clearEdgeInfo()
  })

  $(document).on('click', '#add-node', () => {
    var id = sigmaInst.graph.nodes().length + 1
    var x = parseFloat($('#node-x').val()) || 0 + (id / 10)
    var y = parseFloat($('#node-y').val()) || 0

    sigmaInst.graph.addNode({
      id: id.toString(),
      label: "New node",
      size: 30,
      x: x,
      y: y,
      color: '#ffb300',
      file: '',
      data: ''
    });
    sigmaInst.refresh()
    if (!$('.selected-tab').is('div')) addAndSelectEmptyTab(name)
    updateGraphInfo()
  })

  $(document).on('click', '#add-edge', () => {
    var id = sigmaInst.graph.edges().length + 1
    var source = $('#edge-source').val()
    var target = $('#edge-target').val()
    var type = $('#is-oriented').prop('checked') ? 'arrow' : 'line'
    sigmaInst.graph.addEdge({
      id: id,
      source: source,
      target: target,
      type: type,
      size: 3,
      color: '#668f3c'
    });
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
    tab.remove()
    if (tab.is('.selected-tab')) {
      selectLastTab()
    }
  })

  $(document).on('click', '.tab-content', function () {
    saveGraphToTab()
    $('.selected-tab').removeClass('selected-tab')
    $(this).parent().addClass('selected-tab')
    updateGraphFromSelectedTab()
  })

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

  function getPower(node) {
    var power = 0
    sigmaInst.graph.edges().forEach((edge) => {
      if (edge.source === node.id) power++
    })
    return power
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

  function graphData() {
    return '{ "nodes": ' + JSON.stringify(sigmaInst.graph.nodes()) + ',\n' +
             '"edges": ' + JSON.stringify(sigmaInst.graph.edges()) + ' }'
  }

  function emptyGraphData() {
    return "{ &quot;nodes&quot;: [], &quot;edges&quot;: [] }"
  }

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
      '<div class="tab selected-tab">' +
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
    if (!$('.tab').is('div')) {
      sigmaInst.graph.clear()
      sigmaInst.refresh()
    }
  }

  function renameSelectedTab(name) {
    var newName = name || UNTITLED_TEXT
    $('.selected-tab').find('.tab-content').text(newName)
  }



// =============

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
      return element != value;
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


// =============
})
