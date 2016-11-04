const electron = require('electron');
const elementReady = require('element-ready');
const globalConfig = require('./config');
const ipcRenderer = electron.ipcRenderer;
const $ = document.querySelectorAll.bind(document);
const Config = require('electron-config');
const config = new Config();

var loadXMLDoc = function (url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                callback(xmlhttp.responseText);
            }
            else {
                console.log(xmlhttp.status);
            }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
};

var processRequest = function(url, id) {
    if (!id) return;
    loadXMLDoc(url + encodeURI(id), function (response) {
            response = JSON.parse(response);
            var main_image = $('#mainImage')[0];
            main_image.setAttribute('data-id', response['name']);
            main_image.setAttribute('src', `file://${response['path']}`);
            config.set('last_image_name', response['name']);
            config.set('last_image_path', response['path']);
            $('body')[0].scrollTop = 0;
        });
};

var listenThumbnails = function () {
    $('#thumbnails')[0].addEventListener('click', function (e) {
        e.preventDefault();
        processRequest(`${globalConfig.host}/image/`, e.target.getAttribute('data-id'));
    });
};

var pageWidth = 0;
var toggleFullScreen = function (state) {
    $('#thumbnails')[0].style.display = state ? "none" : "block";
    $('#page')[0].style.width = state ? "100%" : pageWidth;
};

var listenNextImage = function () {
    $('#mainImage')[0].addEventListener('click', function (e) {
        e.preventDefault();
        processRequest(`${globalConfig.host}/image/next/`, e.target.getAttribute('data-id'));
    });
};

elementReady('#mainImage').then(function () {
    pageWidth = $('#page')[0].style.width;
    listenThumbnails();
    listenNextImage();
});

ipcRenderer.on('toggle-full-screen', function (event, state) {
    toggleFullScreen(state);
});