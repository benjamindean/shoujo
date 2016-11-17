'use strict';

const {Menu, BrowserWindow, ipcMain, app, electron, dialog} = require('electron');
const path = require('path');
const appMenu = require('./shoujo/public/js/menu');
const appConfig = require('./shoujo/public/js/config');
const configWindow = require('./shoujo/public/js/config-window');
const Config = require('electron-config');
const config = new Config();
const eventEmitter = require('./shoujo/public/js/event');

const file = function () {
    let arg = process.argv[2] || process.argv[1];
    return (arg && arg !== '.') ? arg : false;
}();

let rq = null;
let mainWindow = null;
let configInstance = null;

global.shared = {
    file: file
};

const instanceRunning = app.makeSingleInstance(() => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus()
    }
});

if (instanceRunning) app.quit();

const openFile = function () {
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
            if (!filePath) return;
            config.set('fileBrowserPath', path.dirname(filePath[0]));
            mainWindow.webContents.send('load-file', filePath[0]);
        }
    );
};

const openConfig = function () {
    if (configInstance && configInstance.isMinimized()) {
        configInstance.restore();
        return;
    }
    if (configInstance) return;

    let pos = mainWindow.getPosition();
    let size = mainWindow.getSize();
    let window = configWindow.create();

    window.setParentWindow(mainWindow);
    window.setPosition(
        pos[0] + Math.round((size[0] / 2) - (configWindow.size.width / 2)),
        pos[1] + Math.round((size[1] / 2) - (configWindow.size.height / 2))
    );

    window.on('close', () => {
        configInstance = null;
    });

    window.once('ready-to-show', () => {
        configInstance = window;
        window.show();
    });
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
            center: true,
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
        require('./shoujo/public/js/context-menu')();

        mainWindow.on('closed', function () {
            configInstance = null;
            mainWindow = null;
            subpy.kill('SIGINT');
        });

        mainWindow.on('enter-full-screen', function () {
            this.webContents.send('toggle-full-screen', true);
        });

        mainWindow.on('leave-full-screen', function () {
            this.webContents.send('toggle-full-screen', false);
        });

        eventEmitter.on('open-file', openFile);
        eventEmitter.on('open-config', openConfig);

        ipcMain.on('open-file', openFile);
        ipcMain.on('open-config', openConfig);

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

