/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome, jQuery, fetlife */
/*
 * FetLife+ - All pages
 * --------
 * Change main navigation bar.
 *
 * Make the .longer links into Picto links.
 * Optionally use the .longer links rather than the .shorter ones.
 * Optionally hide the K&P button.
 *
 * TODO: User-editable menu items, perhaps link to bookmarks?
 */

(function($, document) {
	"use strict";

	var $shorter = $(),
			$longer = $(),
			$kandp = $(),
			picto = {
				"/groups": "g",
				"/places": "G",
				"/events/all": "\\",
				"/fetishes": "Y",
				"/posts/everyone": "W",
				"/videos/all": "V"
			};

	$(document).on("init", function() {
		var $bar = $("#navigation_bar ul.sections, #header_v2 ul.sections");
		$shorter = $("li.shorter", $bar);
		$longer = $("li.longer", $bar);
		$kandp = $("li:first a", $bar);

		// Setup the picto icons, doesn't need to change again
		$("a", $longer).each(function(i, el) {
			var $el = $(el);
			$el
					.attr("title", $el.text())
					.css("font-size", "1.5em")
					.addClass("picto")
					.text(picto[$el.attr("href")]);
		});
	});

	$(document).on("sync", function() {
		console.log("fetlife.onChange()");
		$shorter.toggle(!this.opt_navigation);
		$longer.toggle(this.opt_navigation);
		$kandp.toggle(this.opt_kandp);
	}.bind(fetlife));
}(jQuery, document));