const electron = require('electron');
const { app, BrowserWindow } = require('electron');

function createWindow () {
  let win = new BrowserWindow({ width: 1500, height: 800 })
  win.loadFile('app/views/editor.html')
  win.webContents.toggleDevTools()
}

app.on('ready', createWindow)
