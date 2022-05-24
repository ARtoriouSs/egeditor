const electron = require('electron')
const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
  let window = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true },
  })
  window.maximize()
  window.loadFile('src/views/editor.html')
})
