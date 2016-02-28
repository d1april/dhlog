/* Created by Dominik Herbst on 2016-02-21 */

var fs = require('fs');
var path = require('path');
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

	var line = [func.getTimeString(entry.date),entry.level];
	for (var i = 0; i < entry.args.length; i++) {
		var arg = entry.args[i];
		if(typeof arg == 'string') line.push(arg);
		else line.push(util.inspect(arg));
	}

	if(entry.level == 'DBG') console.log(line.join(' '));
	if(entry.level == 'NFO') console.info(line.join(' '));
	if(entry.level == 'WRN') console.warn(line.join(' '));
	if(entry.level == 'ERR') console.error(line.join(' '));

};
