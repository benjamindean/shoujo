'use strict';

const {Menu} = require('electron');
const eventEmitter = require('./event');

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
                enabled: true,
                click () {
                    eventEmitter.emit('open-file', true);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'CommandOrControl+Q',
                enabled: true,
                click () {
                    eventEmitter.emit('quit', true);
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Settings',
                accelerator: 'CommandOrControl+E',
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
                accelerator: 'CommandOrControl+R',
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