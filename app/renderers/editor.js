$(document).ready(() => {
  const { dialog } = require('electron').remote
  const fs = require('fs')

  sigma.plugins.dragNodes(graph, graph.renderers[0]);

  updateGraphInfo()

  $('#load').on('click', (event) => {
    var options = {
      properties: ['openFile', 'showHiddenFiles'],
      title: 'Open graph',
      filters: [
        { name: 'Graphs', extensions: ['json'] },
      ]
    }
    var callback = (paths) => {
      if (!paths) return

      var path = paths[0]
      fs.readFile(path, 'utf-8', (error, data) => {
        if (error) {
          alert("An error ocurred reading the file: " + error.message)
          return
        }
        var graphData = JSON.parse(data)
        graphData = { edges: graphData.edges, nodes: graphData.nodes }

        graph.graph.clear()
        graph.graph.read(graphData)
        graph.refresh()
        updateGraphInfo()
      })
      $('#graph-name').text(getGraphName(path))
    }
    dialog.showOpenDialog(null, options, callback);
  });

  $('#save').on('click', (event) => {
    var options = {
      title: 'Save graph',
      filters: [
        { name: 'Graphs', extensions: ['json'] },
      ]
    }
    var callback = (path) => {
      if (!path) return

      var data = '{ "nodes": ' + JSON.stringify(graph.graph.nodes()) + ',\n' +
                  '"edges": ' + JSON.stringify(graph.graph.edges()) + ' }'

      fs.writeFile(path, data, (error) => {
        if (error) {
          alert("An error ocurred creating the file: " + error.message)
          return
        }
      });
      $('#graph-name').text(getGraphName(path))
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
      graph.refresh()
    }
    dialog.showOpenDialog(null, options, callback);
  });

  graph.bind('clickStage', () => {
    clearNodeInfo()
    clearEdgeInfo()
  })

  graph.bind('clickNode', (event) => {
    var node = event.data.node
    var colorInput = $('#node-color-input')

    $('#node-info').attr('data-id', node.id)
    $('#node-label-input').val(node.label)
    $('#node-data-input').val(node.data)
    $('#file-name').text(node.file.split('/').pop() || 'No file')
    $('#node-id-label').text(node.id)
    $('#node-power').text(getPower(node))
    colorInput.val(node.color)

    var selectedColor = colorInput.children("option:selected").text()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  graph.bind('clickEdge', (event) => {
    var edge = event.data.edge
    var colorInput = $('#edge-color-input')

    $('#edge-info').attr('data-id', edge.id)
    $('#edge-id-label').text(edge.id)
    colorInput.val(edge.color)

    var selectedColor = colorInput.children("option:selected").text()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  $(document).on('change', '#node-color-input', function () {
    var id = $('#node-info').attr('data-id')
    var input = $(this)
    var selected = input.children("option:selected")
    var color = selected.text()
    var value = selected.val()

    if (value === 'placeholder') {
      input.removeClass().addClass('color-input-white')
      return
    }

    getNodeById(id).color = value
    graph.refresh()
    input.removeClass().addClass('color-input-' + color)
  })

  $(document).on('change', '#edge-color-input', function () {
    var id = $('#edge-info').attr('data-id')
    var input = $(this)
    var selected = input.children("option:selected")
    var color = selected.text()
    var value = selected.val()

    if (value === 'placeholder') {
      input.removeClass().addClass('color-input-white')
      return
    }

    getEdgeById(id).color = value
    graph.refresh()
    input.removeClass().addClass('color-input-' + color)
  })

  $(document).on('input', '#node-label-input', function () {
    var id = $('#node-info').attr('data-id')
    getNodeById(id).label = $(this).val()
    graph.refresh()
  })

  $(document).on('click', '#drop-node', () => {
    var id = $('#node-info').attr('data-id')
    graph.graph.dropNode(id)
    graph.refresh()
    updateGraphInfo()
    clearNodeInfo()
  })

  $(document).on('click', '#drop-edge', () => {
    var id = $('#edge-info').attr('data-id')
    graph.graph.dropEdge(id)
    graph.refresh()
    updateGraphInfo()
    clearEdgeInfo()
  })

  $(document).on('click', '#add-node', () => {
    var id = 'n' + (graph.graph.nodes().length + 1)
    var x = parseFloat($('#node-x').val()) || 0
    var y = parseFloat($('#node-y').val()) || 0
    graph.graph.addNode({
      id: id,
      label: "New node",
      size: 30,
      x: x,
      y: y,
      color: '#ffb300'
    });
    graph.refresh()
    updateGraphInfo()
  })

  $(document).on('click', '#add-edge', () => {
    var id = 'e' + (graph.graph.edges().length + 1)
    var source = $('#edge-source').val()
    var target = $('#edge-target').val()
    var type = $('#is-oriented').prop('checked') ? 'arrow' : 'line'
    graph.graph.addEdge({
      id: id,
      source: source,
      target: target,
      type: type,
      size: 3,
      color: '#668f3c'
    });
    graph.refresh()
    updateGraphInfo()
  })

  $(document).on('click', '#new-tab', function () {
    var newTab = $(this)
    newTab.remove()
    $('#tabulator').append(
      '<div class="tab">' +
        '<div class="tab-content"></div>' +
        '<img src="../assets/images/cross.png" class="close-tab">' +
      '</div>'
    ).append(newTab)
  })

  $(document).on('click', '.close-tab', function () {
    $(this).parent().remove()
  })


  function getNodeById(id) {
    var foundNode
    graph.graph.nodes().forEach((node) => {
      if (node.id === id) foundNode = node
    })
    return foundNode
  }

  function getEdgeById(id) {
    var foundEdge
    graph.graph.edges().forEach((edge) => {
      if (edge.id === id) foundEdge = edge
    })
    return foundEdge
  }

  function updateGraphInfo() {
    $('#nodes-number').text(graph.graph.nodes().length)
    $('#edges-number').text(graph.graph.edges().length)
    $('#nodes-powers').empty()
    graph.graph.nodes().forEach((node) => {
      $('#nodes-powers').append('<div>' + node.id + ': ' + getPower(node) + '</div>')
    })
  }

  function getPower(node) {
    var power = 0
    graph.graph.edges().forEach((edge) => {
      if (edge.source === node.id) power++
    })
    return power
  }

  function clearNodeInfo() {
    var colorInput = $('#node-color-input')
    colorInput.val('placeholder')
    colorInput.removeClass().addClass('color-input-white')
    $('#node-info').removeAttr('data-id')
    $('#node-label-input').val('')
    $('#node-id-label').text('')
    $('#node-power').text('')
  }

  function clearEdgeInfo() {
    var edgeColorInput = $('#edge-color-input')
    edgeColorInput.val('placeholder')
    edgeColorInput.removeClass().addClass('color-input-white')
    $('#edge-info').removeAttr('data-id')
    $('#edge-id-label').text('')
  }

  function getGraphName(path) {
    return path.split('/').pop().split('.')[0]
  }
})
