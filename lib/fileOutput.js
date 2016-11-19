'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const func = require('./func');

const instances = {};

/**
 * Writes log entries to a file.
 * The file is cycled when it becomes to big.
 */
class LogFileOutput {

    static getInstance(options) {
        const filePath = options.path;
        if (!instances[filePath]) instances[filePath] = new LogFileOutput(filePath);
        instances[filePath].applyOptions(options);
        return instances[filePath];
    }

    constructor(filePath) {
        this.filePath = filePath;
        this.ws = null;
        this.maxFileSize = 1024 * 1024 * 10; // 10MB
        this.maxFileCount = 10;

        this._unlinkingFiles = func.advancedArray();
        this._runningOperations = func.advancedArray();
        this.entries = 0;
        this.filesCreated = 0;
        this.filesRemoved = 0;
    }

    applyOptions(options) {
        for (const key in options) {
            if (!options.hasOwnProperty(key)) continue;
            if (!this.hasOwnProperty(key)) continue;
            this[key] = options[key];
        }
    }

    addEntry(entry) {
        const ws = this._getWriteStream();

        const line = func.getLineParts(entry);
        const bytes = new Buffer(line.join(' ') + '\n');
        ws.write(bytes);
        ws.logWritten += bytes.length;
        this.entries++;
    };

    _getWriteStream() {
        // Is the write stream already open?
        if (this.ws != null) {
            // check over size
            if (this.ws.logWritten >= this.maxFileSize) {
                this._cycle();
                return this._getWriteStream();
            }
            return this.ws;
        }

        try {
            // Check if file already exists
            const stat = fs.statSync(this.filePath);

            // check for over size
            if (stat.size >= this.maxFileSize) {
                this._cycle();
                return this._getWriteStream();
            }

            // append to current file
            this.ws = fs.createWriteStream(this.filePath, {flags: 'a'});
            this.ws.logWritten = stat.size;

        } catch (e) {
            // if file does not exist
            this.ws = fs.createWriteStream(this.filePath, {flags: 'a'});
            this.ws.logWritten = 0;
            this.filesCreated++;

        }

        return this.ws;
    }

    _cycle() {
        const dirPath = path.dirname(this.filePath);
        const baseName = path.basename(this.filePath);
        const now = new Date().getTime();

        if (this.ws) {
            this.ws.end();
            this.ws = null;
        }

        try {
            fs.renameSync(this.filePath, path.join(dirPath, baseName + '.' + now));
        } catch (e) {
            console.error('Failed to rename ' + this.filePath, e);
        }


        this._removeFiles();

    }

    /**
     * Move the file numbers
     * The filePath should not exist after that anymore
     */
    _removeFiles() {
        const dirPath = path.dirname(this.filePath);
        const baseName = path.basename(this.filePath);

        return this._createTrackedPromise((resolve, reject) => {
            fs.readdir(dirPath, (err, allFiles) => {
                err ? reject(err) : resolve(allFiles)
            });
        }).then(allFiles => {
            const files = allFiles.filter(fileName => fileName.indexOf(baseName + '.') == 0);
            const filesCount = files.length + 1;

            if (filesCount > this.maxFileCount) {

                // sort in ascending order
                files.sort(function (a, b) {
                    let numA = 0, numB = 0;
                    if (a.match(/\.(\d+)$/)) {
                        numA = parseInt(RegExp.$1);
                    }
                    if (b.match(/\.(\d+)$/)) {
                        numB = parseInt(RegExp.$1);
                    }
                    return numA - numB;
                });

                const tooManyCount = filesCount - this.maxFileCount;
                for (const fileName of files.slice(0, tooManyCount)) {
                    this._removeLogFile(path.join(dirPath, fileName));
                }
            }

        }, (e) => {
            console.error('Failed to list files for removal ' + this.filePath, e);
        });

    }

    _removeLogFile(filePath) {
        if (this._unlinkingFiles.indexOf(filePath) != -1) return;
        this._unlinkingFiles.push(filePath);

        return this._createTrackedPromise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                this._unlinkingFiles.remove(filePath);
                err ? reject(err) : resolve()
            });
        }).then(() => {
            this.filesRemoved++;
        }, (e)=> {
            console.error('failed to unlink file: ' + filePath, e);
        });
    }

    _createTrackedPromise(executor) {
        const p = new Promise(executor);
        this._runningOperations.push(p);
        const remove = () => {
            this._runningOperations.remove(p);
        };
        p.then(remove, remove);
        return p;
    }

    close() {
        if (this.ws) {
            this._createTrackedPromise(resolve => {
                this.ws.end(resolve);
                this.ws = null;
            });
        }
        return Promise.all(this._runningOperations);
    }

}

module.exports = LogFileOutput;


