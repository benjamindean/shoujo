'use strict';

// Some parts of this code were taken from https://github.com/sindresorhus/electron-context-menu

const electron = require('electron');
const app = electron.app;
const {download} = require('electron-dl');
const notifier = require('node-notifier');
const path = require('path');
const eventEmitter = require('./event');

function create(win) {
    (win.webContents || win.getWebContents()).on('context-menu', (e, props) => {
        let menuTpl = [{
            id: 'settings',
            label: 'Settings',
            click(item, win) {
                eventEmitter.emit('open-config', true);
            }
        }];

        if (props.mediaType === 'image') {
            menuTpl.push({
                id: 'save',
                label: 'Save Image',
                click(item, win) {
                    download(win, props.srcURL)
                        .then(notifier.notify({
                            'title': app.getName(),
                            'message': 'Image has been saved to ' + app.getPath('downloads'),
                            'icon': props.srcURL
                        }))
                }
            });
        }
        if (menuTpl && menuTpl.length > 0) {
            const menu = (electron.Menu || electron.remote.Menu).buildFromTemplate(menuTpl);
            menu.popup(electron.remote ? electron.remote.getCurrentWindow() : win);
        }
    });
}

module.exports = (opts = {}) => {
    if (opts.window) {
        const win = opts.window;
        const webContents = win.webContents || win.getWebContents();

        if (webContents === undefined) {
            win.addEventListener('dom-ready', () => {
                create(win, opts);
            }, {once: true});
            return;
        }

        return create(win, opts);
    }

    (electron.BrowserWindow || electron.remote.BrowserWindow).getAllWindows().forEach(win => {
        create(win, opts);
    });

    (electron.app || electron.remote.app).on('browser-window-created', (e, win) => {
        create(win, opts);
    });
};