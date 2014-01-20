/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome, jQuery, fetlife */
/*
 * FetLife+ - Kinky & Popular
 * --------
 * Fixes to the K&P page
 */

(function($, document) {
	"use strict";

	fetlife.KandP = function() {
		$('#header_v2 > .flexible_container').css("width", (!this.opt_kandp_width ? "950px" : ""));
		$("#notification_counts").css("margin-right", (!this.opt_kandp_width ? "25px" : ""));
	};

	$(document).on("init sync", fetlife.KandP.bind(fetlife));
}(jQuery, document));