/* Created by Dominik Herbst on 2016-02-21 */

var LogFileOutput = require('./fileOutput');
var ConsoleOutput = require('./consoleOutput');

var levelNum = {
	'DBG': 4,
	'NFO': 3,
	'WRN': 2,
	'ERR': 1
};

var defaultConfig = {
	outputs: [
		{type: 'consoleOutput', maxLevel: 4},
		{type: 'fileOutput', path: './logs/default.log', maxLevel: 4}
	]
};

/**
 * Initializes the logger
 * @param name
 * @param config
 * @returns {Logger}
 * @constructor
 */
function Logger(name, config) {
	if(!(this instanceof Logger)) return new Logger(name, config);
	this.name = name;
	this.config = config || defaultConfig;

	this.outputs = [];

	Logger.prototype.initOutputs.call(this);
}

module.exports = Logger;

Logger.prototype.debug = function () {
	this.submitLogEntry('DBG', arguments);
};

Logger.prototype.info = function () {
	this.submitLogEntry('NFO', arguments);
};

Logger.prototype.warn = function () {
	this.submitLogEntry('WRN', arguments);
};

Logger.prototype.error = function () {
	this.submitLogEntry('ERR', arguments);
};

Logger.prototype.submitLogEntry = function (level, args) {
	var entry = {date: new Date(), level: level, args: args, name: this.name};
	var numLevel = levelNum[level];

	for (var i = 0; i < this.outputs.length; i++) {
		var out = this.outputs[i];
		if(out.maxLevel >= numLevel) {
			out.output.addEntry(entry);
		}
	}

};

Logger.prototype.initOutputs = function () {
	for (var i = 0; i < this.config.outputs.length; i++) {
		var outCfg = this.config.outputs[i];
		this.addOutput(outCfg);
	}

};

Logger.prototype.addOutput = function (outCfg) {
	var out;
	if(outCfg.type == 'fileOutput') {
		out = LogFileOutput(outCfg.path);
		this.outputs.push({output: out, maxLevel: outCfg.maxLevel});
	} else if(outCfg.type == 'consoleOutput') {
		out = ConsoleOutput();
		this.outputs.push({output: out, maxLevel: outCfg.maxLevel});
	}

};

Logger.prototype.close = function (callb) {
	var finished = 0;
	var count = this.outputs.length;
	function fin() {
		finished++;
		if(finished == count) {
			callb();
		}
	}

	for (var i = 0; i < count; i++) {
		var out = this.outputs[i];
		out.output.close(fin);
	}

};