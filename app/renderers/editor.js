const { dialog } = require('electron').remote

$('#load').on('click', (e) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'showHiddenFiles'],
    title: 'Open graph',
    filters: [
      { name: 'Graphs', extensions: ['json'] },
    ]
  })
});

$('#save').on('click', (e) => {
  dialog.showSaveDialog({
    properties: ['openFile', 'showHiddenFiles'],
    title: 'Open graph',
    filters: [
      { name: 'Graphs', extensions: ['json'] },
    ]
  })
});






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

var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

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
