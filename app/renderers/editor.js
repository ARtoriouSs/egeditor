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

  graph.bind('clickNode', (event) => {
    var node = event.data.node
    var colorInput = $('#node-color-input')

    $('#node-label-input').val(node.label)
    $('#node-id-label').text(node.id)
    colorInput.val(node.color)
    $('#node-info').attr('data-id', node.id)

    var selectedColor = colorInput.children("option:selected").text()
    colorInput.removeClass().addClass('color-input-' + selectedColor)
  })

  $('#node-color-input').on('change', function () {
    var selected = $(this).children("option:selected")
    var color = selected.text()
    var value = selected.val()
    var id = $('#node-info').data('id')

    if (value === 'placeholder') {
      $(this).removeClass().addClass('color-input-white')
      return
    }
    getNodeById(id).color = value
    graph.refresh()
    $(this).removeClass().addClass('color-input-' + color)
  })

  $(document).on('input', '#node-label-input', () => {
    var id = $('#node-info').data('id')
    getNodeById(id).label = $('#node-label-input').val()
    graph.refresh()
  })

  function getNodeById(id) {
    var foundNode
    graph.graph.nodes().forEach((node) => {
      if (node.id === id) foundNode = node
    })
    return foundNode
  }

// var dom = document.querySelector('#graph-container canvas:last-child');

// dom.addEventListener('click', function(e) {
//   graph.graph.addNode({
//     id: i + 1,
//     x: x,
//     y: y,
//     size: 30
//   });
//   graph.refresh();
//   i++;
// }, false);

// graph.bind('rightClick', function (e) {
//   debugger;
//     graph.graph.addNode({
//         id: i + 1,
//         label: "Test node",
//         categories: ['sample'],
//         x: e.data.x,
//         y: e.data.y,
//         type: 'circle'
//     });
//     graph.refresh();
//     i++;
// });

})
