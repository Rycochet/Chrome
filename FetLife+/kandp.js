/*
 * FetLife+ - Kinky & Popular
 * --------
 * Fixes to the K&P header
 */

(function($, sync) {
	"use strict";

	onSync(function() {
		$("#header_v2 > .flexible_container").css("width", (sync.kandp_width ? "950px" : ""));
		$("#notification_counts").css("margin-right", (sync.kandp_width ? "25px" : ""));
	});

}(jQuery, sync));
