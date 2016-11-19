'use strict';

const path = require('path');
const Logger = require('./lib/logger');

/**
 * Create a new logger for a file path
 * @param filename
 * @param [config]
 * @returns {Logger}
 */
exports.forFile = function (filename, config) {
    const name = path.basename(filename, path.extname(filename));
    return new Logger(name, config);
};

/**
 * Create a new logger for a module, which is identified by module.filename
 * @param module
 * @param [config]
 * @returns {Logger}
 */
exports.forModule = function (module, config) {
    return exports.forFile(module.filename, config);
};

/**
 * Create a new Logger for a specific name
 * @param name
 * @param [config]
 * @returns {Logger}
 */
exports.forName = function (name, config) {
    return new Logger(name, config);
};
