const electron = require('electron');
const elementReady = require('element-ready');
const config = require('./config');
const ipcRenderer = electron.ipcRenderer;
const $ = document.querySelectorAll.bind(document);

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
            $('body')[0].scrollTop = 0;
        });
};

var listenThumbnails = function () {
    $('#thumbnails')[0].addEventListener('click', function (e) {
        e.preventDefault();
        processRequest(`${config.host}/image/`, e.target.getAttribute('data-id'));
    });
};

var toggleFullScreen = function (state) {
    $('#thumbnails')[0].style.display = state ? "none" : "block";
    $('.page-image')[0].style.float = state ? "none" : "right";
};

var listenNextImage = function () {
    $('#mainImage')[0].addEventListener('click', function (e) {
        e.preventDefault();
        processRequest(`${config.host}/image/next/`, e.target.getAttribute('data-id'));
    });
};

elementReady('#mainImage').then(function () {
    listenThumbnails();
    listenNextImage();
});

ipcRenderer.on('toggle-full-screen', function (event, state) {
    toggleFullScreen(state);
});