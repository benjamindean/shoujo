'use strict';

const {ipcRenderer, remote} = require('electron');
const elementReady = require('element-ready');
const globalConfig = require('./config');
const Config = require('electron-config');
const config = new Config();
const Vue = require('vue/dist/vue.js');
const $ = document.querySelectorAll.bind(document);

var vm = null;

const initialState = function () {
    return {
        file: false,
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
            setData: function (data, event) {
                this.reset();
                this.image_path = data.dir;
                this.images = data.list;
                this.file = data.file;
                if (event === 'list-processing') {
                    this.loading = true;
                } else {
                    if (config.get('last_file') !== data.file) {
                        config.set('last_image', 0);
                        config.set('last_file', data.file);
                        this.last_image = 0;
                        this.active_image = 0;
                    }
                    this.loading = false;
                }
            },
            handleAttributes: function (image) {
                if (!this.file) return;
                this.scrollToThumb(image.id);
                let main_image = $('#mainImage')[0];

                let attrs = {
                    'data-id': image.id,
                    'data-name': image.name,
                    'src': `file://${image.path}`
                };

                for (let key in attrs) {
                    main_image.setAttribute(key, attrs[key]);
                }
                config.set('last_image', image.id);
                $('#page')[0].scrollTop = 0;
            },
            reset: function () {
                let initialData = initialState();
                for (let prop in initialData) {
                    this[prop] = initialData[prop];
                }
            },
            onClickThumb: function (e) {
                let id = e.target.getAttribute('data-id');
                let image = this.images[id];
                if (!image) return;
                this.handleAttributes(image);
                this.active_image = id;
            },
            scrollToThumb(id) {
                document.getElementById("thumb-" + id).scrollIntoView();
                document.getElementById("thumbnails").scrollTop -= window.innerHeight / 3;
            },
            onClickImage: function (e) {
                let id = parseInt(e.target.getAttribute('data-id')) + 1;
                let image = this.images[id];
                if (!image) return;
                this.handleAttributes(image);
                this.active_image++;
            },
            toggleFullScreen: function (state) {
                if (!this.file) return;
                let body = $('body')[0];
                state ? body.classList.add('fullscreen') : body.classList.remove('fullscreen');
            },
            openConfig: function () {
                ipcRenderer.send('open-config', true);
            },
            openFile: function () {
                ipcRenderer.send('open-file', true);
            }
        }
    });

    ipcRenderer.on('list-processing', function (event, data) {
        vm.setData(data, 'list-processing');
    });

    ipcRenderer.on('list-ready', function (event, data) {
        vm.setData(data, 'list-ready');
    });

    ipcRenderer.on('toggle-full-screen', function (event, state) {
        vm.toggleFullScreen(state);
    });

});

