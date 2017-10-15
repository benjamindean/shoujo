'use strict';

const {BrowserWindow} = require('electron');
const path = require('path');

class ConfigWindow {
    constructor() {
        this.size = {
            width: 400,
            height: 300
        };
        this.opts = {
            width: this.size.width,
            height: this.size.height,
            minWidth: this.size.width,
            minHeight: this.size.height,
            webPreferences: {
                preload: path.join(__dirname, 'browser.js'),
                nodeIntegration: false,
                webSecurity: false
            },
            skipTaskbar: true,
            fullscreenable: false,
            resizable: false,
            center: true,
            show: false
        };
        this.windowInstance = null;
    }

    open(mainWindow) {
        if (this.windowInstance) {
            if (this.windowInstance.isMinimized()) {
                this.windowInstance.restore();
            }
            return;
        }

        this.windowInstance = new BrowserWindow(this.opts);
        this.windowInstance.loadURL('file://' + path.join(__dirname, 'public/html/config.html'));

        let pos = mainWindow.getPosition();
        let size = mainWindow.getSize();

        this.windowInstance.setParentWindow(mainWindow);
        this.windowInstance.setPosition(
            pos[0] + Math.round((size[0] / 2) - (this.size.width / 2)),
            pos[1] + Math.round((size[1] / 2) - (this.size.height / 2))
        );

        this.attachEvents();
    }

    attachEvents() {
        this.windowInstance.on('close', () => {
            this.windowInstance = null;
        });

        this.windowInstance.once('ready-to-show', () => {
            this.windowInstance.show();
        });
    }

}

module.exports = new ConfigWindow();