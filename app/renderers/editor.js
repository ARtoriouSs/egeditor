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

graph.bind('clickNode', (e) => {
  var node = e.data.node
  $('#node-label-input').val(node.label)
  $('#node-id-input').val(node.id)
  // $('#node-color-input').selectedOptions[0]
})

$('#node-color-input').on('change', function () {
  var selected = this.selectedOptions[0]
  var color  = selected.text
  var rgb = selected.value;
  $(this).removeClass().addClass('color-input-' + color)
});

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
