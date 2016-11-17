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
        loading: true,
        images: [],
        image_path: '',
        last_image: config.get('last_image') || 0,
        active_image: config.get('last_image') || 0
    }
};

elementReady('#shoujo').then(function () {
    vm = new Vue({
        el: '#shoujo',
        data: function () {
            return initialState();
        },
        methods: {
            handleAttributes: function (response) {
                if (!this.file) return;
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
                });
            },
            fetchImages: function () {
                this.$http.get('/list').then((response) => {
                    this.images = response.body;
                });
            },
            reset: function (file) {
                this.$http.get('/reset').then((response) => {
                    let initialData = initialState();
                    for (let prop in initialData) {
                        this[prop] = initialData[prop];
                    }
                });
            },
            getImagePath: function () {
                this.$http.get('/get-image-path').then((response) => {
                    this.image_path = response.body;
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
            toggleFullScreen: function () {
                if (!this.file) return;
                $('body')[0].classList.toggle('fullscreen');
            },
            handleFile: function (file) {
                if (config.get('last_file') !== file) {
                    config.set('last_image', false);
                }
                this.loading = true;
                this.reset(file);
                this.$http.get('/?file=' + file).then(() => {
                    config.set('last_file', file);
                    this.file = file;
                    this.getImagePath();
                    this.fetchImages();
                    this.loading = false;
                });
            },
            openConfig: function () {
                ipcRenderer.send('open-config', true);
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

ipcRenderer.on('toggle-full-screen', function () {
    vm.toggleFullScreen();
});