'use strict';

const {ipcRenderer} = require('electron');
const electron = require('electron').remote;
const elementReady = require('element-ready');
const Config = require('electron-config');
const config = new Config();
const Vue = require('vue/dist/vue.js');
const $ = document.querySelector.bind(document);

let vm = null,
    main_image = null;

const initialState = function () {
    return {
        file: false,
        loading: false,
        images: [],
        image_path: '',
        images_count: 0,
        last_image: config.get('last_image') || 0,
        active_image: config.get('last_image') || 0
    }
};

elementReady('#shoujo').then(function () {
    ipcRenderer.send('shoujo-ready', true);
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
                this.images_count = data.images_count;

                if (event === 'extract-started') {
                    this.loading = true;
                } else {
                    if (config.get('last_file') !== data.file) {
                        config.set('last_image', 0);
                        config.set('last_file', data.file);
                        this.last_image = 0;
                        this.active_image = 0;
                    }
                    this.loading = false;
                    this.updateCounter();
                    this.scrollToThumb(config.get('last_image'));

                    main_image = $('#mainImage');
                    main_image.addEventListener("load", function () {
                        $('#page').scrollTop = 0;
                    });
                }
            },
            handleAttributes: function (image) {
                if (!this.file) return;
                this.scrollToThumb(image.id);

                let attrs = {
                    'data-id': image.id,
                    'data-name': image.name,
                    'src': `file://${image.path}`
                };

                for (let key in attrs) {
                    main_image.setAttribute(key, attrs[key]);
                }
                config.set('last_image', image.id);
            },
            reset: function () {
                let initialData = initialState();
                for (let prop in initialData) {
                    this[prop] = initialData[prop];
                }
            },
            switchImage: function (id, direction) {
                switch (direction) {
                    case 'next':
                        id++;
                        this.active_image = id;
                        break;
                    case 'prev':
                        id--;
                        this.active_image = id;
                        break;
                    case 'thumb':
                        this.active_image = id;
                        break;
                    case 'forward':
                        this.active_image++;
                        break;
                }

                let image = this.images[id];
                if (!image) return;
                this.updateCounter();
                this.handleAttributes(image);
            },
            onClickThumb: function (e) {
                let id = e.target.getAttribute('data-id');
                this.switchImage(id, 'thumb');
            },
            scrollToThumb(id) {
                document.getElementById("thumb-" + id).scrollIntoView();
                document.getElementById("thumbnails").scrollTop -= window.innerHeight / 3;
            },
            onClickImage: function (e) {
                let id = parseInt(e.target.getAttribute('data-id')) + 1;
                this.switchImage(id, 'forward');
            },
            toggleFullScreen: function (state) {
                if (!this.file) return;
                let body = $('body');
                state ? body.classList.add('fullscreen') : body.classList.remove('fullscreen');
                this.scrollToThumb(this.active_image);
            },
            openConfig: function () {
                ipcRenderer.send('open-config', true);
            },
            openFile: function () {
                ipcRenderer.send('open-file', true);
            },
            updateCounter: function () {
                $('#image-counter').innerHTML = (this.active_image + 1) + ' / ' + this.images_count;
            }
        }
    });

    ipcRenderer.on('extract-started', function (event, data) {
        vm.setData(data, 'extract-started');
    });

    ipcRenderer.on('item-added', function (event, data) {
        vm.images.push(data);
        vm.loading = false;
    });

    ipcRenderer.on('extract-finished', function (event, data) {
        vm.setData(data, 'extract-finished');
    });

    ipcRenderer.on('toggle-full-screen', function (event, state) {
        vm.toggleFullScreen(state);
    });

    ipcRenderer.on('switch-image', function (event, direction) {
        let el = $('#mainImage'),
            id = el ? el.getAttribute('data-id') : false;
        vm.switchImage(id, direction);
    });
});