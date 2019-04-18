const { dialog } = require('electron').remote
const fs = require('fs')

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






// var dom = document.querySelector('#graph-container canvas:last-child');

// dom.addEventListener('click', function(e) {
//   s.graph.addNode({
//     id: i + 1,
//     x: 0,
//     y: 0,
//     size: 30
//   });
//   s.refresh();
//   i++;
// }, false);

var dragListener = sigma.plugins.dragNodes(graph, graph.renderers[0]);

// dragListener.bind('startdrag', function(event) {
//   console.log(event);
// });
// dragListener.bind('drag', function(event) {
//   console.log(event);
// });
// dragListener.bind('drop', function(event) {
//   console.log(event);
// });
// dragListener.bind('dragend', function(event) {
//   console.log(event);
// });
