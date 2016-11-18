'use strict';

const eventEmitter = require('./event');
const path = require('path');
const unzip = require('unzip2');
const fs = require('fs');

let data = {
    list: [],
    dir: null
};

const unpack = function (file) {
    data.dir = __dirname + `/.${file}/`;
    if (!fs.existsSync(data.dir)) fs.mkdirSync(data.dir);
    let idx = 0;
    fs.createReadStream(file)
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


module.exports = {
    unpack: unpack,
    data: data,
    delete: deleteFolder
};