/*
 * Common functions, chrome version...
 */

function getUserID() {
	return $('head script').text().match(/FetLife\.currentUser\.nickname\s*=\s*"(.+)";/)[1];
}

function getUserName() {
	return parseInt($('head script').text().match(/FetLife\.currentUser\.id\s*=\s*(\d+);/)[1], 10);
}
