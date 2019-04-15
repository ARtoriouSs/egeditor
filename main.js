const {app, BrowserWindow, dialog} = require('electron');

function createWindow () {
  let win = new BrowserWindow({ width: 1500, height: 800 })
  win.loadFile('index.html')
}

app.on('ready', createWindow)
