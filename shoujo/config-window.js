'use strict';

const {BrowserWindow} = require('electron');
const path = require('path');

let instance = null;

class ConfigWindow {

    constructor() {
        if (!instance) {
            instance = this;
        }
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
        return instance;
    }

    create() {
        this.windowInstance = new BrowserWindow(this.opts);
        this.windowInstance.loadURL('file://' + path.join(__dirname, 'public/html/config.html'));
        return this.windowInstance;
    }

}

module.exports = new ConfigWindow();