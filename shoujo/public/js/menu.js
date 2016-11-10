'use strict';

const {Menu} = require('electron');

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'Ctrl+O',
                enabled: true,
                click () {
                    process.emit('open-file', 'test');
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

module.exports = Menu.buildFromTemplate(template);