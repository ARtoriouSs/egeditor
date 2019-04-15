const electron = require('electron');
const {app, BrowserWindow} = require('electron');

function createWindow () {
  let win = new BrowserWindow({ width: 1500, height: 800 })
  win.loadFile('app/views/editor.html')
}

app.on('ready', createWindow)
