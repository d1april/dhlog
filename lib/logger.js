'use strict';

const LogFileOutput = require('./fileOutput');
const ConsoleOutput = require('./consoleOutput');

const levelNum = {
    'DBG': 4,
    'NFO': 3,
    'WRN': 2,
    'ERR': 1
};

const knownOutputs = {
    consoleOutput: ConsoleOutput,
    fileOutput: LogFileOutput,
};

const defaultConfig = {
    outputs: [
        {type: 'consoleOutput', maxLevel: 4},
        {type: 'fileOutput', path: './logs/default.log', maxLevel: 4}
    ]
};

class Logger {
    constructor(name, config) {
        if (!(this instanceof Logger)) return new Logger(name, config);
        this.name = name;
        this.config = Object.assign({}, config || defaultConfig);

        this.outputs = [];

        this.initOutputs();
    }

    /**
     * @param {...*} o to be logged as debug
     */
    debug(o) {
        this.submitLogEntry('DBG', arguments);
    }

    /**
     * @param {...*} o to be logged as info
     */
    info(o) {
        this.submitLogEntry('NFO', arguments);
    }

    /**
     * @param {...*} o to be logged as warning
     */
    warn(o) {
        this.submitLogEntry('WRN', arguments);
    }

    /**
     * @param {...*} o to be logged as error
     */
    error(o) {
        this.submitLogEntry('ERR', arguments);
    }

    /**
     * Creates a new logger with just the specified output
     * @param type
     * @param [params]
     * @returns {Logger}
     */
    withOnlyOutput(type, params) {
        if (!knownOutputs[type]) {
            this.error('Logger output ' + type + ' unknown');
            return this;
        }
        const newConfig = Object.assign({}, this.config);
        const outCfg = {type: type, maxLevel: 4};
        if (params) {
            for (const key in params) {
                if (!params.hasOwnProperty(key)) continue;
                outCfg[key] = params[key];
            }
        }
        newConfig.outputs = [outCfg];
        return new Logger(this.name, newConfig);
    }

    /**
     * Creates anew logger with the additional output
     * @param type
     * @param [params]
     * @returns {Logger}
     */
    withOutput(type, params) {
        if (!knownOutputs[type]) {
            this.error('Logger output ' + type + ' unknown');
            return this;
        }
        const newConfig = Object.assign({}, this.config);
        const outCfg = {type: type, maxLevel: 4};
        if (params) {
            for (const key in params) {
                if (!params.hasOwnProperty(key)) continue;
                outCfg[key] = params[key];
            }
        }
        newConfig.outputs.push(outCfg);
        return new Logger(this.name, newConfig);
    }

    submitLogEntry(level, args) {
        const entry = {date: new Date(), level: level, args: args, name: this.name};
        const numLevel = levelNum[level];

        for (const out of this.outputs) {
            if (out.maxLevel >= numLevel) {
                out.output.addEntry(entry);
            }
        }

    }


    initOutputs() {
        for (const outCfg of this.config.outputs) {
            this.addOutput(outCfg);
        }
    }

    addOutput(outCfg) {
        const OutputClass = knownOutputs[outCfg.type];
        if (!OutputClass) {
            this.error('Logger output ' + outCfg.type + ' unknown');
            return this;
        }
        const out = OutputClass.getInstance(outCfg);
        this.outputs.push({output: out, maxLevel: outCfg.maxLevel});

        return this;
    }


    close() {
        return Promise.all(this.outputs.map(out => out.output.close()));
    };
}
module.exports = Logger;
