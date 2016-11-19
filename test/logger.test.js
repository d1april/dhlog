'use strict';

const fs = require('fs');
const rmdir = require('rmdir');
const assert = require('assert');

describe('log something', () => {

    const log = require('../').forModule(module);

    it('should log an info', function () {
        log.info('test line');
    });

    it('should log error info', function () {
        log.error('test error', new Error('error'));
    });

    after(() => {
        return log.close();
    });

});

describe('cycle files', () => {

    let log;
    const tempDir = 'temp';
    const maxFileSize = 1024;
    const maxFileCount = 10;

    beforeEach(() => {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        log = require('../').forName('test')
            .withOnlyOutput('fileOutput', {
                path: tempDir + '/default.log',
                maxLevel: 4,
                maxFileSize: maxFileSize,
                maxFileCount: maxFileCount
            });

    });

    afterEach((callb) => {
        rmdir(tempDir, callb);
    });

    it('should log 5000 chars', () => {
        const lines = 200;

        for (let i = 0; i < lines; i++) {
            log.info('test line, some test, test, test, test, test, test'); // 50 chars
        }
        return log.close()
            .then(() => {
                const files = fs.readdirSync(tempDir);
                assert.equal(files.length, 10, 'Only 10 files should be in the log dir');
            });
    });


});
