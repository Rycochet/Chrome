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

(function($) {
	"use strict";

	var $bar = $("#navigation_bar ul.sections, #header_v2 ul.sections"),
			$shorter = $("li.shorter", $bar),
			$longer = $("li.longer", $bar),
			$kandp = $("li:first a", $bar),
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

	function onNavigation() {
		$shorter.toggle(!this.sync.navigation);
		$longer.toggle(this.sync.navigation);
		$kandp.toggle(this.sync.kandp);
	}

	fetlife.onSync(onNavigation);
}(jQuery));
