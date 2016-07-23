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

(function($, document, window, chrome, sync) {
	"use strict";

	var isKandP = /^\/explore\//.test(window.location.pathname),
			$header = $("#navigation_bar,#header_v2"),
			$bar = $header.find("ul.sections"),
			$explore = $bar.children("li:not([class])"),
			$kandp = $explore.clone().addClass("longer").insertAfter($explore.addClass("shorter")).add($explore).children("a"),
			$shorter = $bar.children("li.shorter"),
			$longer = $bar.children("li.longer"),
			$feed = $header.find("h1 a"),
			picto = {
				"explore": "N",
				"groups": "g",
				"places": "G",
				"events": "\\",
				"fetishes": "Y",
				"posts": "W",
				"videos": "V"
			};

	var txt = document.head.textContent;
	if (txt && txt.length) {
		chrome.storage.local.set({
			username: txt.match(/"nickname":"(.+)"/)[1] || "",
			userid: parseInt(txt.match(/"id":(\d+)/)[1], 10) || -1
		});
	}

	// Setup the picto icons, doesn't need to change again
	$longer.find("a").each(function() {
		var $el = $(this);
		$el
				.attr("title", $el.text())
				.css("font-size", "1.5em")
				.addClass("picto")
				.text(picto[$el.attr("href").replace(/^\/([^\/]*)\/?.*$/, "$1")]);
	});

	onSync(function() {
		if (isKandP) {
			$header.find(".messaging").css("margin-right", sync.kandp_width ? "25px" : "");
			$("#header_v2 > .flexible_container").css("width", (sync.kandp_width ? "950px" : ""));
			$("#notification_counts").css("margin-right", (sync.kandp_width ? "25px" : ""));
		}
		$shorter.toggle(!sync.navigation);
		$longer.toggle(sync.navigation);
		$feed.attr("href", sync.feed_default);
		$kandp
				.toggle(sync.kandp)
				.attr("href", (sync.kandp_page ? sync.kandp_page + sync.kandp_default : sync.kandp_default));
	});

}(jQuery, document, window, chrome, sync));
