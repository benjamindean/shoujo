'use strict';

const eventEmitter = require('./event'),
    path = require('path'),
    unzip = require('unzip2'),
    fs = require('fs'),
    os = require('os');

class Archive {
    constructor() {
        this.data = {
            list: null,
            dir: null,
            file: null
        };
    }

    unpack(file) {
        this.reset();
        let inputFileName = path.basename(file);

        this.data = {
            list: [],
            dir: os.tmpdir() + `/.${inputFileName}/`,
            file: file,
            images_count: 0,
            fileName: inputFileName.substr(0, inputFileName.lastIndexOf('.'))
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

                if (type === "File") {
                    let item = {
                        id: idx++,
                        name: fileName,
                        path: this.data.dir + fileName
                    };

                    this.data.list.push(item);
                    entry.pipe(
                        fs.createWriteStream(this.data.dir + fileName)
                            .on('close', () => {
                                this.data.images_count++;
                                eventEmitter.emit('item-added', item);
                            })
                    );

                }
            })
            .on('close', () => {
                eventEmitter.emit('extract-finished', this.data);
            });
    }

    deleteFolder() {
        if (fs.existsSync(this.data.dir)) {
            fs.readdirSync(this.data.dir).forEach((file, index) => {
                fs.unlinkSync(this.data.dir + "/" + file);
            });
            fs.rmdirSync(this.data.dir);
        }
    }

    reset() {
        for (let prop in this.data) {
            if (this.data.hasOwnProperty(prop)) {
                this.data[prop] = null;
            }
        }
    }
}

module.exports = new Archive();