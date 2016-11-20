'use strict';

const path = require('path');
const util = require('util');


exports.padNum2 = function (num) {
    return num < 10 ? '0' + num : num.toString();
};


exports.getTimeString = function (dt) {
    if (!dt) dt = new Date();

    return dt.getFullYear() + '' + exports.padNum2(dt.getMonth() + 1) + '' + exports.padNum2(dt.getDate())
        + ' ' + exports.padNum2(dt.getHours()) + '' + exports.padNum2(dt.getMinutes()) + exports.padNum2(dt.getSeconds());

};

exports.getLineParts = function (entry) {
    var line = ['[' + exports.getTimeString(entry.date) + ']', entry.level, entry.name + ':'];
    for (var i = 0; i < entry.args.length; i++) {
        var arg = entry.args[i];
        if (typeof arg == 'string')
            line.push(arg);
        else if (arg instanceof Error)
            line.push(exports.getErrorStack(arg));
        else
            line.push(util.inspect(arg));
    }
    return line;
};

exports.getErrorStack = function (err) {
    if (!err) return '';
    if (!err.stack) return err.toString();
    var cwd = process.cwd() + path.sep;
    cwd = cwd.replace(/\\/g, '\\\\');
    return err.stack.replace(new RegExp(cwd, 'g'), '');
};

exports.advancedArray = function () {
    const a = [];
    a.remove = function (o) {
        const i = this.indexOf(o);
        this.splice(i, 0);
    };
    return a;
};
