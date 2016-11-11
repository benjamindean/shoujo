'use strict';

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

var pageWidth = 0;
var vm = null;

elementReady('#shoujo').then(function () {
    pageWidth = $('#page')[0].style.width;

    vm = new Vue({
        el: '#shoujo',
        data: {
            thumbnails: [],
            image_path: '',
            last_image: {
                id: config.get('last_image_id') || 0,
                name: config.get('last_image_name'),
                path: config.get('last_image_path')
            },
            active_image: config.get('last_image_id')
        },
        methods: {
            handleAttributes: function (response) {
                let main_image = $('#mainImage')[0];
                main_image.setAttribute('data-id', response.id);
                main_image.setAttribute('data-name', response.name);
                main_image.setAttribute('src', `file://${response.path}`);
                config.set('last_image.id', response.id);
                config.set('last_image.name', response.name);
                config.set('last_image.path', response.path);
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
            fetchThumbnails: function () {
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
            }
        }
    });

    vm.getImagePath();
    vm.fetchThumbnails();

});

ipcRenderer.on('load-file', function (event, data) {
    console.log(data);
});

ipcRenderer.on('toggle-full-screen', function (event, state) {
    vm.toggleFullScreen(state);
});