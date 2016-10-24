const electron = require('electron');
const elementReady = require('element-ready');

const ipcRenderer = electron.ipcRenderer;
const $ = document.querySelectorAll.bind(document);

elementReady('html').then(function() {
    $('.thumbnails')[0].addEventListener('click', function(e) {
        e.preventDefault();
        console.log(e.target);
    });
});