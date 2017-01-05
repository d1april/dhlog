'use strict';

const LogFileOutput = require('./fileOutput');
const ConsoleOutput = require('./consoleOutput');

const levelNum = {
    'DBG': 4,
    'NFO': 3,
    'WRN': 2,
    'ERR': 1
};

const defaultConfig = {
    outputs: [
        {type: 'consoleOutput', maxLevel: 4},
        //{type: 'fileOutput', path: './logs/default.log', maxLevel: 4}
    ]
};

// Reading the default config from a file
try {
    Object.assign(defaultConfig, require(process.cwd()+'/dhlog.json'));
} catch(e) {
    // just ignore missing default configuration in dhlog.json
}

// Reading the default config from the environment
try {
    Object.assign(defaultConfig, JSON.parse(process.env['DHLOG']));
} catch(e) {
    // just ignore missing default configuration in the environment
}

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
        if (!Logger.outputs[type]) {
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
        if (!Logger.outputs[type]) {
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
        const OutputClass = Logger.outputs[outCfg.type];
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

Logger.outputs = {
    consoleOutput: ConsoleOutput,
    fileOutput: LogFileOutput,
};

module.exports = Logger;
