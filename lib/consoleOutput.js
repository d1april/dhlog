'use strict';

const fs = require('fs');
const util = require('util');
const func = require('./func');

let instance = null;

class ConsoleOutput {

    static getInstance() {
        if (instance) return instance;
        return instance = new ConsoleOutput();
    }

    addEntry(entry) {

        const line = func.getLineParts(entry);

        if (entry.level == 'DBG') console.log(line.join(' '));
        if (entry.level == 'NFO') console.info(line.join(' '));
        if (entry.level == 'WRN') console.warn(line.join(' '));
        if (entry.level == 'ERR') console.error(line.join(' '));

    }

    close() {
        return Promise.resolve();
    }
}

module.exports = ConsoleOutput;

