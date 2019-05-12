$(document).ready(() => {
  const { dialog } = require('electron').remote
  const fs = require('fs')

  sigma.plugins.dragNodes(graph, graph.renderers[0]);

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

      fs.readFile(paths[0], 'utf-8', (error, data) => {
        if (error) {
          alert("An error ocurred reading the file: " + error.message)
          return
        }
        var graphData = JSON.parse(data)
        graphData = { edges: graphData.edges, nodes: graphData.nodes }

        graph.graph.clear()
        graph.graph.read(graphData)
        graph.refresh()
      })
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
    }

    dialog.showSaveDialog(null, options, callback)
  })

  graph.bind('clickStage', (event) => {
    var colorInput = $('#node-color-input')

    $('#node-info').removeAttr('data-id')
    $('#node-label-input').val('')
    $('#node-id-label').text('')
    colorInput.val('placeholder')
    colorInput.removeClass().addClass('color-input-white')
  })

  graph.bind('clickNode', (event) => {
    var node = event.data.node
    var colorInput = $('#node-color-input')

    $('#node-info').attr('data-id', node.id)
    $('#node-label-input').val(node.label)
    $('#node-id-label').text(node.id)
    colorInput.val(node.color)

    var selectedColor = colorInput.children("option:selected").text()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  $(document).on('change', '#node-color-input', () => {
    var id = $('#node-info').attr('data-id')
    var selected = $('#node-color-input').children("option:selected")
    var color = selected.text()
    var value = selected.val()

    if (value === 'placeholder') {
      $('#node-color-input').removeClass().addClass('color-input-white')
      return
    }

    getNodeById(id).color = value
    graph.refresh()
    $('#node-color-input').removeClass().addClass('color-input-' + color)
  })

  $(document).on('input', '#node-label-input', () => {
    var id = $('#node-info').attr('data-id')
    getNodeById(id).label = $('#node-label-input').val()
    graph.refresh()
  })

  $(document).on('click', '#drop-node', () => {
    var id = $('#node-info').attr('data-id')
    graph.graph.dropNode(id)
    graph.refresh()
  })

  function getNodeById(id) {
    var foundNode
    graph.graph.nodes().forEach((node) => {
      if (node.id === id) foundNode = node
    })
    return foundNode
  }

  graph.bind('rightClick', function (e) {
    var x = e.data.x / 1000
    var y = e.data.y / 1000
    graph.graph.addNode({
      id: i + 1,
      label: "Test node",
      size: 30,
      x: 0,
      y: 0,
      color: '#ffb300'
    });
    graph.refresh();
    i++;
  });


})
