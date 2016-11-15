'use strict';

const {Menu} = require('electron');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'Ctrl+O',
                enabled: true,
                click () {
                    eventEmitter.emit('open-file', true);
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Settings',
                accelerator: 'Ctrl+E',
                enabled: true,
                click () {
                    eventEmitter.emit('open-config', true);
                }
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'Ctrl+R',
                click (item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload();
                }
            },
            {
                label: 'Fullscreen',
                accelerator: 'F',
                click (item, mainWindow) {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }
        ]
    },
    {
        role: 'window',
        submenu: [
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    }
];

module.exports = {
    template: Menu.buildFromTemplate(template),
    eventEmitter: eventEmitter
};