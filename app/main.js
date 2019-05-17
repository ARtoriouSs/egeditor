const electron = require('electron');
const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
  let window = new BrowserWindow({ width: 1500, height: 800 })
  window.maximize()
  window.loadFile('app/views/editor.html')
  window.webContents.toggleDevTools()
})
