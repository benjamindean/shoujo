const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow;
require('electron-debug')()

var mainWindow = null;

const instanceRunning = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
  }
})

if (instanceRunning) {
  app.quit()
}

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', function() {
  var subpy = require('child_process').spawn('python', ['./shoujo/server.py']);
  var rq = require('request-promise');
  var mainAddr = 'http://localhost:5000';

  var openWindow = function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
      mainWindow = null;
      subpy.kill('SIGINT');
    });
  };

  var startUp = function(){
    rq(mainAddr)
      .then(function(htmlString){
        openWindow();
      })
      .catch(function(err){
        startUp();
      });
  };

  startUp();
});
