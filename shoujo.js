'use strict';

const {Menu, BrowserWindow, ipcMain, app, electron, dialog} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const appMenu = require('./shoujo/menu');
const appConfig = require('./shoujo/config');
const configWindow = require('./shoujo/config-window');
const Config = require('electron-config');
const config = new Config();
const eventEmitter = require('./shoujo/event');
const archive = require('./shoujo/archive');

const file = function () {
    let arg = process.argv[2] || process.argv[1];
    return (arg && arg !== '.') ? arg : false;
}() || config.get('last_file');

let rq = null;
let mainWindow = null;
let configInstance = null;

const instanceRunning = app.makeSingleInstance(() => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
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
            handleFile(filePath[0]);
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

const handleFile = function (file) {
    if (!file) return;
    archive.deleteFolder();
    archive.unpack(file);
};

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    var openWindow = function () {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 600,
            center: true,
            webPreferences: {
                preload: path.join(__dirname, 'shoujo/browser.js'),
                nodeIntegration: false,
                webSecurity: false
            },
            icon: path.join(__dirname, 'resources/icons/icon.png')
        });

        mainWindow.loadURL('file://' + path.join(__dirname, 'shoujo/public/html/index.html'));
        if (isDev) mainWindow.webContents.openDevTools();
        Menu.setApplicationMenu(appMenu.template);
        require('./shoujo/context-menu')();

        mainWindow.on('enter-full-screen', function () {
            this.webContents.send('toggle-full-screen', true);
        });

        mainWindow.on('leave-full-screen', function () {
            this.webContents.send('toggle-full-screen', false);
        });

        ipcMain.on('shoujo-ready', function () {
            handleFile(file);
        });

        eventEmitter.on('open-file', openFile);
        eventEmitter.on('open-config', openConfig);
        eventEmitter.on('extract-started', function (data) {
            mainWindow.webContents.send('extract-started', data);
        });
        eventEmitter.on('extract-finished', function (data) {
            mainWindow.webContents.send('extract-finished', data);
        });

        ipcMain.on('open-file', openFile);
        ipcMain.on('open-config', openConfig);

        mainWindow.on('closed', function () {
            archive.deleteFolder();
            configInstance = null;
            mainWindow = null;
        });

    };

    openWindow();
});

