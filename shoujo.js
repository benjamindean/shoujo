'use strict';

const {Menu, BrowserWindow, ipcMain, app, electron, dialog} = require('electron');
const path = require('path');
const appMenu = require('./shoujo/public/js/menu');
const appConfig = require('./shoujo/public/js/config');
const contextMenu = require('./shoujo/public/js/context-menu');
const Config = require('electron-config');
const config = new Config();
const file = function() {
    let arg = process.argv[2] || process.argv[1];
    return (arg && arg !== '.') ? arg : false;
}();

var rq = null;
var mainWindow = null;

global.shared = {
    file: file
};

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

const openFile = function() {
    dialog.showOpenDialog(
        {
            title: 'Open File',
            properties: ['openFile'],
            defaultPath: config.get('fileBrowserPath'),
            filters: [
                {
                    name: 'Archives',
                    extensions: appConfig.supportedFormats
                },
            ]
        }, function (filePath) {
            if(!filePath) return;
            config.set('fileBrowserPath', path.dirname(filePath[0]));
            mainWindow.webContents.send('load-file', filePath[0]);
        }
    );
};

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    var subpy = require('child_process').spawn('python', [path.join(__dirname, 'shoujo/server.py')]);
    rq = require('request-promise');
    var mainAddr = appConfig.host;

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
        Menu.setApplicationMenu(appMenu.template);

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

        appMenu.eventEmitter.on('open-file', openFile);

        contextMenu();
    };

    const startUp = function () {
        rq(mainAddr).then(function () {
            openWindow();
        }).catch(function (err) {
            console.log(err);
        });
    };

    startUp();
});

