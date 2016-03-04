/* Created by Dominik Herbst on 2016-02-21 */

var fs = require('fs');
var path = require('path');
var util = require('util');
var func = require('./func');

var cachedInstances = {};


function LogFileOutput(filePath) {
	if (!(this instanceof LogFileOutput)) {
		if (cachedInstances[filePath]) return cachedInstances[filePath];
		return cachedInstances[filePath] = new LogFileOutput(filePath);
	}
	this.filePath = filePath;
	this.ws = null;
	this.maxFileSize = 1024 * 1024 * 10; // 10MB
	this.maxFileCount = 10;

}

module.exports = LogFileOutput;

LogFileOutput.prototype.addEntry = function (entry) {
	var ws = this.getWriteStream();

	var line = func.getLineParts(entry);

	ws.write(line.join(' ') + '\n');

};

LogFileOutput.prototype.getWriteStream = function () {
	// Is the write stream already open?
	if (this.ws != null) {
		// check over size
		if (this.ws.logWritten >= this.maxFileSize) {
			this.ws.end();
			this.ws = null;
			this.cycleFiles();
			return this.getWriteStream();
		}
		return this.ws;
	}

	try {
		// Check if file already exists
		var stat = fs.statSync(this.filePath);

		// check for over size
		if (stat.size >= this.maxFileSize) {
			this.cycleFiles();
			return this.getWriteStream();
		}

		// append to current file
		this.ws = fs.createWriteStream(this.filePath, {flags: 'a', encoding: 'utf8'});
		this.ws.logWritten = stat.size;

	} catch (e) {
		// if file does not exist
		this.ws = fs.createWriteStream(this.filePath, {flags: 'w'});
		this.ws.logWritten = 0;

	}

	return this.ws;
};

/**
 * Move the file numbers
 * The filePath should not exist after that anymore
 */
LogFileOutput.prototype.cycleFiles = function () {
	var dirPath = path.dirname(this.filePath);
	var baseName = path.basename(this.filePath);

	try {
		var files = fs.readdirSync(dirPath);
		var i, fileName, newName, newNum;
		for (i = 0; i < files.length; i++) {
			fileName = files[i];
			if (fileName.indexOf(baseName) != 0) {
				files.splice(i, 1);
				i--;
			}
		}

		// sort in descending order
		files.sort(function (a, b) {
			var numA = 0, numB = 0;
			if (a.match(/\.(\d+)$/)) {
				numA = parseInt(RegExp.$1);
			}
			if (b.match(/\.(\d+)$/)) {
				numB = parseInt(RegExp.$1);
			}
			if (numA < numB) return 1;
			if (numA > numB) return -1;
			return 0;
		});

		// sorted descending
		for (i = 0; i < files.length; i++) {
			fileName = files[i];
			if (fileName.match(/^(.+?)\.(\d+)$/)) {
				newNum = parseInt(RegExp.$2) + 1;
				if (this.maxFileCount && newNum > this.maxFileCount) {
					fs.unlinkSync(dirPath + '/' + fileName);
				}
				newName = RegExp.$1 + '.' + newNum;
			} else {
				newName = fileName + '.1';
			}
			fs.renameSync(dirPath + '/' + fileName, dirPath + '/' + newName);

		}


	} catch (e) {
		console.error('Failed to cycle log files ' + filePath, e);
	}


};

