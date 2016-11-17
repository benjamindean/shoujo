'use strict';

const path = require('path');
const unzip = require('unzip2');
const fs = require('fs');

let list = [];

const unpack = function (file) {
    const dir = __dirname + `/.${file}/`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    let idx = 0;
    fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            let fileName = path.basename(entry.path);
            let type = entry.type;
            if (type == "File") {
                list.push({
                    id: idx++,
                    path: entry.path
                });
                entry.pipe(fs.createWriteStream(dir + fileName));
            }
        });
};

module.exports = {
    unpack: unpack,
    list: list
};