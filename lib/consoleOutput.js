/* Created by Dominik Herbst on 2016-02-21 */

var fs = require('fs');
var util = require('util');
var func = require('./func');

var cachedInstance = null;


function ConsoleOutput() {
	if (!(this instanceof ConsoleOutput)) {
		if (cachedInstance) return cachedInstance;
		return cachedInstance = new ConsoleOutput();
	}
}

module.exports = ConsoleOutput;

ConsoleOutput.prototype.addEntry = function (entry) {

	var line = func.getLineParts(entry);

	if(entry.level == 'DBG') console.log(line.join(' '));
	if(entry.level == 'NFO') console.info(line.join(' '));
	if(entry.level == 'WRN') console.warn(line.join(' '));
	if(entry.level == 'ERR') console.error(line.join(' '));

};

ConsoleOutput.prototype.close = function (callb) { callb(); };