/* Created by Dominik Herbst on 2016-02-21 */

var fs = require('fs');
var rmdir = require('rmdir');
var assert = require('assert');

describe('log something', function(){

	/**
	 * @type {Logger}
	 */
	var log = require('../')('test');

	it('should log an info', function(){
		log.info('test line');
	});

	it('should log error info', function(){
		log.error('test error', new Error('error'));
	});

});

describe('cycle files', function(){

	/**
	 * @type {Logger}
	 */
	var log;
	var tempDir = 'temp';

	beforeEach(function() {
		if(!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir);
		}

		log = require('../')('test', {
			outputs: [
				{type: 'fileOutput', path: tempDir+'/default.log', maxLevel: 4}
			]
		});
		log.outputs[0].output.maxFileSize = 1024;

	});

	afterEach(function(callb){
		rmdir(tempDir, callb);
	});

	it('should log 5000 chars', function(end){
		for(var i=0; i<100; i++) {
			log.info('test line, some test, test, test, test, test, test'); // 50 chars
		}
		log.close(function(){
			var files = fs.readdirSync(tempDir);
			assert.equal(files.length, 10, 'Only 10 files should be in the log dir');
			end();
		});
	});


});