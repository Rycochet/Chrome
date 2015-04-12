/*
 * FetLife+ - All pages
 * --------
 * Change theme - set body id and inject theme script
 */

(function($, chrome, sync) {
	"use strict";

	onSync(function() {
		$("#theme").attr("href", sync.theme ? chrome.extension.getURL("themes/" + sync.theme + ".css") : "");
	});
	
	$("<link id=\"theme\" href=\"\" rel=\"stylesheet\" type=\"text/css\">").appendTo("head");
}(jQuery, chrome, sync));
