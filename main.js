'use strict';

const electron = require('electron');
const app = electron.app;
const path = require('path');
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const appMenu = require('./shoujo/public/js/menu');
const config = require('./shoujo/public/js/config');
var rq = null;

var mainWindow = null;

const file = process.argv[2] || process.argv[1];

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
    var subpy = require('child_process').spawn('python', [path.join(__dirname, 'shoujo/server.py')]);
    rq = require('request-promise');
    var mainAddr = `${config.host}/?file=${file}`;

    var openWindow = function () {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                preload: path.join(__dirname, 'shoujo/public/js/browser.js'),
                nodeIntegration: false,
                webSecurity: false
            },
            icon: path.join(__dirname, 'resources/icons/icon.png')
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
