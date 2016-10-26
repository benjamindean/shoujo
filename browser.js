const electron = require('electron');
const elementReady = require('element-ready');
const config = require('./config');
const ipcRenderer = electron.ipcRenderer;
const $ = document.querySelectorAll.bind(document);

var loadXMLDoc = function(url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
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

var listenThumbnails = function () {
    $('.thumbnails')[0].addEventListener('click', function (e) {
        e.preventDefault();
        let id = e.target.getAttribute('id');
        if(!id) return;
        loadXMLDoc(`${config.host}/image/` + encodeURI(id), function(response) {
            var main_image = $('#mainImage')[0];
            main_image.setAttribute('data-id', id);
            main_image.setAttribute('src', `file://${response}`);
        });
    });
};

var listenNextImage = function() {
    $('#mainImage')[0].addEventListener('click', function (e) {
        e.preventDefault();
        let id = e.target.getAttribute('data-id');
        if(!id) return;
        loadXMLDoc(`${config.host}/image/next/` + encodeURI(id), function(response) {
            response = JSON.parse(response);
            var main_image = $('#mainImage')[0];
            main_image.setAttribute('data-id', response['id']);
            main_image.setAttribute('src', `file://${response['url']}`);
        });
    });
};

elementReady('html').then(function () {
    listenThumbnails();
    listenNextImage();
});