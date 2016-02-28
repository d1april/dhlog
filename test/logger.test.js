/* Created by Dominik Herbst on 2016-02-21 */



describe('log something', function(){

	/**
	 * @type {Logger}
	 */
	var log = require('../index')('test');

	it('should log', function(){
		log.info('test line');
	});



});
