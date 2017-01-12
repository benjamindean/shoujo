const {app, Menu, BrowserWindow, electron} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const appMenu = require('./menu');
const Config = require('electron-config');
const config = new Config();
const archive = require('./archive');
const url = require('url');
const eventEmitter = require('./event');

let instance = null;

class MainWindow {

    constructor(file) {
        if (!instance) {
            instance = this;
        }
        this.file = file;
        this.window = null;
        this.opts = {
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 600,
            center: true,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'browser.js'),
                nodeIntegration: false,
                webSecurity: false
            },
            icon: path.join(__dirname, '../resources/icons/icon.png')
        };
        return instance;
    }

    open() {
        this.window = new BrowserWindow(this.opts);
        this.window.loadURL(url.format({
                protocol: 'file',
                slashes: true,
                pathname: path.join(__dirname, 'public/html/index.html')
            })
        );
        if (isDev) this.window.webContents.openDevTools();
        Menu.setApplicationMenu(appMenu.template);
        require('./context-menu')();
        this.attachEvents();
    }

    attachEvents() {
        eventEmitter.on('extract-started', (data) => {
           this.window.setTitle(app.getName() + ` - ${data.fileName}`)
        });

        this.window.on('ready-to-show', function () {
            this.show();
        });

        this.window.on('enter-full-screen', function () {
            this.webContents.send('toggle-full-screen', true);
        });

        this.window.on('leave-full-screen', function () {
            this.webContents.send('toggle-full-screen', false);
        });

        this.window.on('closed', function () {
            archive.deleteFolder();
        });
    }
}

module.exports = MainWindow;