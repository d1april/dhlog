/* Created by Dominik Herbst on 2016-02-21 */



describe('log something', function(){

	/**
	 * @type {Logger}
	 */
	var log = require('../index')('test');

	it('should log an info', function(){
		log.info('test line');
	});

	it('should log error info', function(){
		log.error('test error', new Error('error'));
	});



});
