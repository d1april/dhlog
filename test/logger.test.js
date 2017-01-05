'use strict';

const fs = require('fs');
const rmdir = require('rmdir');
const assert = require('assert');
const path = require('path');
const tempDir = 'temp';
const tempLogFile = path.join(tempDir, 'default.log');


describe('log something', () => {

    const log = require('../').forModule(module)
        .withOnlyOutput('fileOutput', {path: tempLogFile})
        .withOutput('consoleOutput');

    const ids = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta'];

    before(() => {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
    });

    after((done) => {
        rmdir(tempDir, done);
    });

    it('should log an string', () => {
        log.info('test line '+ids[0]);
    });

    it('should log an object', () => {
        log.info('test '+ids[1], {name: 'a '+ids[2], num: 1});
    });

    it('should log error info', () => {
        log.error('test error '+ids[3], new Error('error '+ids[4]));
    });

    it('should log debug info', () => {
        log.debug('test debug '+ids[5]);
    });

    it('should have logged', () =>  {
        log.close()
            .then(() => {
                const logContent = fs.readFileSync(tempLogFile, {encoding: 'utf8'});
                for(const id of ids) {
                    assert.ok(logContent.includes(id));
                }
            });
    });

});

describe('cycle files', () => {

    let log;
    const tempDir = 'temp';
    const maxFileSize = 1024;
    const maxFileCount = 10;

    before(() => {
        log = require('../').forName('test')
            .withOnlyOutput('fileOutput', {
                path: tempLogFile,
                maxLevel: 4,
                maxFileSize: maxFileSize,
                maxFileCount: maxFileCount
            });

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
    });

    it('should log 5000 chars', () => {
        const lines = 200;

        for (let i = 0; i < lines; i++) {
            log.info('test line, some test, test, test, test, test, test'); // 50 chars
        }
        return log.close()
            .then(() => {
                console.log('check after close');
                const files = fs.readdirSync(tempDir);
                assert.equal(files.length, 10, 'Only 10 files should be in the log dir');
            });
    });

    after((done) => {
        rmdir(tempDir, done);
    });

});
