'use strict';

const {app, electron, dialog, ipcMain} = require('electron');
const Config = require('electron-config');
const config = new Config();
const appConfig = require('./shoujo/config');
const configWindow = require('./shoujo/config-window');
const archive = require('./shoujo/archive');
const mainWindow = require('./shoujo/main-window');
const eventEmitter = require('./shoujo/event');
const path = require('path');
const fs = require('fs');

class Shoujo {

    constructor() {
        this.file = Shoujo.getFile();
        let mainWindowInstance = new mainWindow(this.file);
        mainWindowInstance.open();
        this.mainWindow = mainWindowInstance.window;
    }

    static getFile() {
        let arg = process.argv[2] || process.argv[1];
        return ((arg && arg !== '.') ? arg : false) || config.get('last_file');
    }

    handleFile(file = this.file) {
        if (!fs.existsSync(file)) return;
        archive.deleteFolder();
        archive.unpack(file);
    }

    openFile() {
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
            }, (filePath) => {
                if (!filePath) return;
                config.set('fileBrowserPath', path.dirname(filePath[0]));
                this.handleFile(filePath[0]);
            }
        );
    }
}

const instanceRunning = app.makeSingleInstance(() => {
    if (Shoujo.window) {
        if (Shoujo.window.isMinimized()) Shoujo.window.restore();
        Shoujo.window.focus();
    }
});

if (instanceRunning) app.quit();

app.on('window-all-closed', app.quit);
app.on('ready', () => {
    const shoujo = new Shoujo();

    ipcMain.once('shoujo-ready', () => {
        shoujo.handleFile();
    });

    ipcMain.on('open-config', () => {
        configWindow.open(shoujo.mainWindow);
    });

    ipcMain.on('open-file', () => {
        shoujo.openFile();
    });

    eventEmitter.on('open-file', () => {
        shoujo.openFile();
    });

    eventEmitter.on('open-config', () => {
        shoujo.openConfig();
    });

    eventEmitter.on('item-added', (data) => {
        shoujo.mainWindow.webContents.send('item-added', data);
    });

    eventEmitter.on('extract-started', (data) => {
        shoujo.mainWindow.webContents.send('extract-started', data);
    });

    eventEmitter.on('extract-finished', (data) => {
        shoujo.mainWindow.webContents.send('extract-finished', data);
    });
});



