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

class Shoujo {

    constructor() {
        this.file = Shoujo.getFile();
        let mainWindowInstance = new mainWindow(this.file);
        mainWindowInstance.open();
        this.mainWindow = mainWindowInstance.window;
        this.configInstance = null;
    }

    static getFile() {
        let arg = process.argv[2] || process.argv[1];
        return ((arg && arg !== '.') ? arg : false) || config.get('last_file');
    }

    handleFile(file = this.file) {
        if (!file) return;
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

    openConfig() {
        if (this.configInstance && this.configInstance.isMinimized()) {
            this.configInstance.restore();
            return;
        }
        if (this.configInstance) return;

        let pos = this.mainWindow.getPosition();
        let size = this.mainWindow.getSize();
        let instance = configWindow.create();

        instance.setParentWindow(this.mainWindow);
        instance.setPosition(
            pos[0] + Math.round((size[0] / 2) - (configWindow.size.width / 2)),
            pos[1] + Math.round((size[1] / 2) - (configWindow.size.height / 2))
        );

        instance.on('close', () => {
            this.configInstance = null;
        });

        instance.once('ready-to-show', () => {
            this.configInstance = instance;
            instance.show();
        });
    }
}

// const instanceRunning = app.makeSingleInstance(() => {
//     if (window.window) {
//         if (window.window.isMinimized()) window.window.restore();
//         window.window.focus();
//     }
// });
//
// if (instanceRunning) app.quit();

app.on('window-all-closed', app.quit);
app.on('ready', () => {
    const shoujo = new Shoujo();

    ipcMain.once('shoujo-ready', () => {
        shoujo.handleFile();
    });

    ipcMain.on('open-config', () => {
        shoujo.openConfig();
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

    eventEmitter.on('extract-started', (data) => {
        shoujo.mainWindow.webContents.send('extract-started', data);
    });

    eventEmitter.on('extract-finished', (data) => {
        shoujo.mainWindow.webContents.send('extract-finished', data);
    });
});



