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
        loading: false,
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

                let attrs = {
                    'data-id': response.id,
                    'data-name': response.name,
                    'src': `file://${response.path}`
                };

                for (let key in attrs) {
                    main_image.setAttribute(key, attrs[key]);
                }

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
            toggleFullScreen: function (state) {
                if (!this.file) return;
                let body = $('body')[0];
                state ? body.classList.add('fullscreen') : body.classList.remove('fullscreen');
            },
            handleFile: function (file) {
                this.loading = true;
                this.file = file;
                if (config.get('last_file') !== file) {
                    config.set('last_image', false);
                }
                this.reset(file);
                this.$http.get('/?file=' + file).then(() => {
                    config.set('last_file', file);
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

ipcRenderer.on('toggle-full-screen', function (event, state) {
    vm.toggleFullScreen(state);
});