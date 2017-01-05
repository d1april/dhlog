# DHLog

A simple logger to be used in node.js, that can be configured with different outputs.

## Usage

Get a logger in your module:

    const log = require('dhlog').forModule(module);
    log.debug('This is a debug output');
    log.info('This is an info output');
    log.warn('This is a warning output');
    log.error('This is an error output');
    
By default only logging to the console is activated.

### Configuration
You can supply a custom logging configuration either per file or per environment variable. The environment variable takes precedence.

* Create a file named `dhlog.json` in your working directory
* Create the environment variable `DHLOG` with the config as json string

Example configuration:

    {
      "outputs": [
        {"type": "consoleOutput", "maxLevel": 4},
        {"type": "fileOutput","path": "./logs/default.log","maxLevel": 4}
      ]
    }



## Log outputs

All output modules support all the option:

* `maxLevel` the maximum log level that should be logged. 
    * 4: debug
    * 3: info
    * 2: warn
    * 1: error

### consoleOutput

This output module maps the log functions to the functions of the `console`.

### fileOutput

This output module writes all log statements to a file and rotates the file when it gets too large.

Options:

* `path` the file path where the log should be written to
* `maxFileSize` maximum bytes that should be written to a file before it is rotated
* `maxFileCount` maximum count of rotated files to keep

When a file is full, the output module will rename the logfile and open a new one. The rotated files get a timestamp as suffix.

    
## License

The MIT License (MIT)

