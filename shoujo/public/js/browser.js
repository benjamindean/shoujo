const electron = require('electron');
const elementReady = require('element-ready');
const globalConfig = require('./config');
const ipcRenderer = electron.ipcRenderer;
const $ = document.querySelectorAll.bind(document);
const Config = require('electron-config');
const config = new Config();
const Vue = require('vue/dist/vue.js');
const VueResource = require('vue-resource');
Vue.use(VueResource);

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

var processRequest = function (url, id) {
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
    $('#toolbar')[0].style.display = state ? "none" : "flex";
    $('#thumbnails')[0].style.display = state ? "none" : "block";
    $('#page')[0].style.width = state ? "100%" : pageWidth;
};

var listenNextImage = function () {
    $('#mainImage')[0].addEventListener('click', function (e) {
        e.preventDefault();
        processRequest(`${globalConfig.host}/image/next/`, e.target.getAttribute('data-id'));
    });
};

elementReady('#shoujo').then(function () {
    pageWidth = $('#page')[0].style.width;

    var v = new Vue({
        el: '#shoujo',
        data: {
            thumbnails: [],
            image_path: '',
            last_image_name: config.get('last_image_name'),
            last_image_path: config.get('last_image_path')
        },
        methods: {
            fetchMessages: function () {
                this.$http.get('/list').then((response) => {
                    this.thumbnails = response.body;
                }, (response) => {
                    console.log(response);
                });
            },
            getImagePath: function () {
                this.$http.get('/get-image-path').then((response) => {
                    this.image_path = response.body;
                }, (response) => {
                    console.log(response);
                });
            }
        }
    });

    v.getImagePath();
    v.fetchMessages();

    listenThumbnails();
    listenNextImage();
});

ipcRenderer.on('toggle-full-screen', function (event, state) {
    toggleFullScreen(state);
});