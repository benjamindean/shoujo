const electron = require('electron');

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Settings',
        accelerator: 'Ctrl+O',
        enabled: true,
        click () {}
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

module.exports = electron.Menu.buildFromTemplate(template);