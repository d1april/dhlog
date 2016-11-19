# DHLog

A simple logger to be used in node.js, that can be configured with different outputs.

## Usage

    const log = require('dhlog').forModule(module);
    log.debug('This is a debug output');
    log.info('This is an info output');
    log.warn('This is a warning output');
    log.error('This is an error output');
    
## License

The MIT License (MIT)

