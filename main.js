const electron = require('electron');
const app = electron.app;
const path = require('path');
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const appMenu = require('./menu');
const config = require('./config');
require('electron-debug')();

var mainWindow = null;

const instanceRunning = app.makeSingleInstance(() => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
    }
});

if (instanceRunning) {
    app.quit();
}

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    var subpy = require('child_process').spawn('python', ['./shoujo/server.py']);
    var rq = require('request-promise');
    var mainAddr = config.host;

    var openWindow = function () {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'browser.js'),
                nodeIntegration: false,
                webSecurity: false
            }
        });
        mainWindow.loadURL(mainAddr);
        mainWindow.webContents.openDevTools();
        electron.Menu.setApplicationMenu(appMenu);

        mainWindow.on('closed', function () {
            mainWindow = null;
            subpy.kill('SIGINT');
        });

        mainWindow.on('enter-full-screen', function () {
            this.webContents.send('toggle-full-screen', true);
        });

        mainWindow.on('leave-full-screen', function () {
            this.webContents.send('toggle-full-screen', false);
        });

    };

    var startUp = function () {
        rq(mainAddr)
            .then(function (htmlString) {
                openWindow();
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    startUp();
});
