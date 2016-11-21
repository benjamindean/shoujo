'use strict';

const {BrowserWindow} = require('electron');
const path = require('path');

const size = {
    width: 400,
    height: 300
};

const createWindow = function () {
    let configWindow = new BrowserWindow({
        width: size.width,
        height: size.height,
        minWidth: size.width,
        minHeight: size.height,
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
    });

    configWindow.loadURL('file://' + path.join(__dirname, 'public/html/config.html'));

    return configWindow;
};


module.exports = {
    create: createWindow,
    size: size
};