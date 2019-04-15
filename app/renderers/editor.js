const { dialog } = require('electron').remote
dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })



var dom = document.querySelector('#graph-container canvas:last-child');

dom.addEventListener('click', function(e) {
  s.graph.addNode({
    id: i + 1,
    x: 0,
    y: 0,
    size: 30
  });
  s.refresh();
  i++;
}, false);

var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

dragListener.bind('startdrag', function(event) {
  console.log(event);
});
dragListener.bind('drag', function(event) {
  console.log(event);
});
dragListener.bind('drop', function(event) {
  console.log(event);
});
dragListener.bind('dragend', function(event) {
  console.log(event);
});
