'use strict'

keks();

function keks() {
  var i,
      s,
      img,
      N = 10,
      E = 10,
      g = {
        nodes: [],
        edges: []
      },
      colors = [
        '#617db4',
        '#668f3c',
        '#c6583e',
        '#b956af'
      ];

  for (i = 0; i < N; i++) {
    g.nodes.push({
      id: 'n' + i,
      label: 'Node ' + i,
      x: Math.random(),
      y: Math.random(),
      size: 30,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  for (i = 0; i < E; i++) {
    g.edges.push({
      id: 'e' + i,
      source: 'n' + (Math.random() * N | 0),
      target: 'n' + (Math.random() * N | 0),
      type: 'arrow',
      size: 3
    });
  }

  s = new sigma({
    graph: g,
    renderer: {
      container: 'graph-container',
      type: 'canvas'
    },
    settings: {
      maxNodeSize: 10,
      maxEdgeSize: 3
    }
  });
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
}
