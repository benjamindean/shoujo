const electron = require('electron');
const elementReady = require('element-ready');

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
        loadXMLDoc('http://localhost:5000/image/' + encodeURI(id), function(response) {
            $('#mainImage')[0].setAttribute('src', 'file://' + response);
        });
    });
};

elementReady('html').then(function () {
    listenThumbnails();
});