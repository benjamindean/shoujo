'use strict';

const eventEmitter = require('./event');
const path = require('path');
const unzip = require('unzip2');
const fs = require('fs');

let data = {
    list: null,
    dir: null,
    file: null
};

const unpack = function (file) {
    reset();
    let inputFileName = path.basename(file);
    data = {
        list: [],
        dir: __dirname + `/.${inputFileName}/`,
        file: file
    };
    if (!fs.existsSync(data.dir)) fs.mkdirSync(data.dir);
    let idx = 0;
    fs.createReadStream(file)
        .on('open', function () {
            eventEmitter.emit('extract-started', data);
        })
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            let fileName = path.basename(entry.path);
            let type = entry.type;
            if (type == "File") {
                data.list.push({
                    id: idx++,
                    name: fileName,
                    path: data.dir + fileName
                });
                entry.pipe(fs.createWriteStream(data.dir + fileName));
            }
        })
        .on('close', function () {
            eventEmitter.emit('extract-finished', data);
        });
};


const deleteFolder = function () {
    if (fs.existsSync(data.dir)) {
        fs.readdirSync(data.dir).forEach(function (file, index) {
            var curPath = data.dir + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(data.dir);
    }
};

const reset = function () {
    for (let prop in data) {
        data[prop] = null;
    }
};


module.exports = {
    unpack: unpack,
    data: data,
    delete: deleteFolder
};