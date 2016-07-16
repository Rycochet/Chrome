/*
 * FetLife+ - All pages
 * --------
 * Change theme - set body id and inject theme script
 */

(function($, chrome, sync) {
	"use strict";

	onSync(function() {
		$("#theme").attr("href", sync.theme ? chrome.extension.getURL("themes/" + sync.theme + ".css") : "");
		$("#workSafeMode").attr("href", sync.work_safe ? chrome.extension.getURL("themes/workSafeMode.css") : "");
	});
	
	$("<link id=\"theme\" href=\"\" rel=\"stylesheet\" type=\"text/css\">").appendTo("head");
	$("<link id=\"workSafeMode\" href=\"\" rel=\"stylesheet\" type=\"text/css\">").appendTo("head");
}(jQuery, chrome, sync));
