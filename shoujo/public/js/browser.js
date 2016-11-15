'use strict';

const {ipcRenderer, remote} = require('electron');
const elementReady = require('element-ready');
const globalConfig = require('./config');
const Config = require('electron-config');
const config = new Config();
const Vue = require('vue/dist/vue.js').use(require('vue-resource'));
const $ = document.querySelectorAll.bind(document);

var pageWidth = 0;
var vm = null;
var glob = remote.getGlobal('shared');

const initialState = function () {
    return {
        file: glob.file,
        images: [],
        image_path: '',
        last_image: config.get('last_image') || 0,
        active_image: config.get('last_image') || 0
    }
};

elementReady('#shoujo').then(function () {
    pageWidth = $('#page')[0].style.width;
    vm = new Vue({
        el: '#shoujo',
        data: function () {
            return initialState();
        },
        methods: {
            init: function () {
                this.getImagePath();
                this.fetchImages();
            },
            handleAttributes: function (response) {
                let main_image = $('#mainImage')[0];
                main_image.setAttribute('data-id', response.id);
                main_image.setAttribute('data-name', response.name);
                main_image.setAttribute('src', `file://${response.path}`);
                config.set('last_image', response.id);
                $('#page')[0].scrollTop = 0;
            },
            processRequest: function (url, id) {
                if (!id) return;
                this.$http.get(url + encodeURI(id)).then((response) => {
                    this.handleAttributes(response.body);
                }, (response) => {
                    console.log(response);
                });
            },
            fetchImages: function () {
                this.$http.get('/list').then((response) => {
                    this.images = response.body;
                }, (response) => {
                    console.log(response);
                });
            },
            reset: function () {
                this.$http.get('/reset').then((response) => {
                    config.set('last_image', false);
                    let initialData = initialState();
                    for (let prop in initialData) {
                        this[prop] = initialData[prop];
                    }
                }, (response) => {
                    console.log(response);
                });
            },
            loadFile: function (file) {
                this.reset();
                return this.$http.get('/?file=' + file);
            },
            getImagePath: function () {
                this.$http.get('/get-image-path').then((response) => {
                    this.image_path = response.body;
                }, (response) => {
                    console.log(response);
                });
            },
            onClickThumb: function (e) {
                let id = e.target.getAttribute('data-id');
                this.processRequest(`${globalConfig.host}/image/`, id);
                this.active_image = id;
            },
            onClickImage: function (e) {
                let id = e.target.getAttribute('data-id');
                this.processRequest(`${globalConfig.host}/image/next/`, id);
                this.active_image++;
            },
            toggleFullScreen: function (state) {
                $('#toolbar')[0].style.display = state ? "none" : "flex";
                $('#thumbnails')[0].style.display = state ? "none" : "block";
                $('#page')[0].style.width = state ? "100%" : pageWidth;
            },
            handleFile: function (file) {
                this.loadFile(file).then((response) => {
                    config.set('last_file', file);
                    this.file = file;
                    this.init();
                });
            },
            openFile: function () {
                ipcRenderer.send('open-file', true);
            }
        }
    });

    if (glob.file) {
        vm.handleFile(glob.file);
    }

});

ipcRenderer.on('load-file', function (event, file) {
    vm.handleFile(file);
});

ipcRenderer.on('toggle-full-screen', function (event, state) {
    if (!vm) return;
    vm.toggleFullScreen(state);
});