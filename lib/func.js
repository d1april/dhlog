/* Created by Dominik Herbst on 2016-02-28 */


exports.padNum2 = function (num) {
	return num < 10 ? '0' + num : num.toString();
};


exports.getTimeString = function (dt) {
	if (!dt) dt = new Date();

	return dt.getFullYear() + '' + exports.padNum2(dt.getMonth() + 1) + '' + exports.padNum2(dt.getDate())
		+ ' ' + exports.padNum2(dt.getHours()) + '' + exports.padNum2(dt.getMinutes()) + exports.padNum2(dt.getSeconds());

};

