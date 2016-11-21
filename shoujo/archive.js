'use strict';

const eventEmitter = require('./event');
const path = require('path');
const unzip = require('unzip2');
const fs = require('fs');
const os = require('os');

let instance = null;

class Archive {

    constructor() {
        if (!instance) {
            instance = this;
        }
        this.data = {
            list: null,
            dir: null,
            file: null
        };
        return instance;
    }

    unpack(file) {
        this.reset();
        let inputFileName = path.basename(file);
        this.data = {
            list: [],
            dir: os.tmpdir() + `/.${inputFileName}/`,
            file: file
        };
        if (!fs.existsSync(this.data.dir)) fs.mkdirSync(this.data.dir);
        let idx = 0;
        fs.createReadStream(file)
            .on('open', () => {
                eventEmitter.emit('extract-started', this.data);
            })
            .pipe(unzip.Parse())
            .on('entry', (entry) => {
                let fileName = path.basename(entry.path);
                let type = entry.type;
                if (type == "File") {
                    this.data.list.push({
                        id: idx++,
                        name: fileName,
                        path: this.data.dir + fileName
                    });
                    entry.pipe(fs.createWriteStream(this.data.dir + fileName));
                }
            })
            .on('close', () => {
                eventEmitter.emit('extract-finished', this.data);
            });
    }

    deleteFolder() {
        if (fs.existsSync(this.data.dir)) {
            fs.readdirSync(this.data.dir).forEach((file, index) => {
                var curPath = this.data.dir + "/" + file;
                fs.unlinkSync(curPath);
            });
            fs.rmdirSync(this.data.dir);
        }
    }

    reset() {
        for (let prop in this.data) {
            this.data[prop] = null;
        }
    }
}

module.exports = new Archive();