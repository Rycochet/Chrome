/*
 * FetLife+ - Kinky & Popular
 * --------
 * Fixes to the K&P page
 */

(function($, document) {
	"use strict";

	function KandP() {
		$("#header_v2 > .flexible_container").css("width", (this.sync.kandp_width ? "950px" : ""));
		$("#notification_counts").css("margin-right", (this.sync.kandp_width ? "25px" : ""));
	}

	fetlife.onSync(KandP);
}(jQuery, document));