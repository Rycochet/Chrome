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

(function($, sync) {
	"use strict";

	var $bar = $("#navigation_bar ul.sections, #header_v2 ul.sections"),
			$shorter = $bar.find("li.shorter"),
			$longer = $bar.find("li.longer"),
			$kandp = $bar.find("li:first a"),
			picto = {
				"groups": "g",
				"places": "G",
				"events": "\\",
				"fetishes": "Y",
				"posts": "W",
				"videos": "V"
			};

	// Setup the picto icons, doesn't need to change again
	$("a", $longer).each(function() {
		var $el = $(this);
		$el
				.attr("title", $el.text())
				.css("font-size", "1.5em")
				.addClass("picto")
				.text(picto[$el.attr("href").replace(/^\/([^\/]*)\/?.*$/, "$1")]);
	});

	onSync(function() {
		$shorter.toggle(!sync.navigation);
		$longer.toggle(sync.navigation);
		$kandp.toggle(sync.kandp);
	});

}(jQuery, sync));
