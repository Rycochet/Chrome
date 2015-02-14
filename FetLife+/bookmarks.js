/*
 * FetLife+ - All pages
 * --------
 * Add Bookmarks menu.
 *
 * Add/remove bookmark when first option clicked.
 * Use Picto icons for all types.
 * Store as {bookmarks: [ {path: "name"}, {...} ]}
 * TODO: Bookmark editor
 * TODO: Nested Bookmarks
 * TODO: Separator Bars
 *
 * TODO: Correct the FetLife coders on the spelling of "separate"... :-P
 */
(function($, document, chrome, sync) {
	var allow = {
		"v": /^\/users\/\d+\/pictures(|\/\d+)/i,
		"V": /^\/users\/\d+\/videos(|\/\d+)/i,
		"W": /^\/users\/\d+\/posts(|\/\d+)/i,
		"U": /^\/users\/\d+/i,
		"g": /^\/groups\/\d+/i,
		"\\": /^\/events\/\d+/i,
		"G": /^\/administrative_areas(|\/\d+)/i,
		"Y": /^\/fetishes\/\d+/i,
		"H": /^\/home\/v4/i
//		"S": /.*/i
	};

	$("form.global_search + #nav_dropdown").after(
			"<ul id=\"bookmark_dropdown\" class=\"horizontal profile\" style=\"margin:0;\">"
			+ "<li id=\"bookmark_icon\">"
			+ "<a href=\"#\" class=\"rcts\"><span class=\"picto\">l</span></a>"
			+ "<ul id=\"bookmark_list\" class=\"vertical rcbs\"></ul>"
			+ "</li>"
			+ "</ul>");

	$(document).on("mouseup touchend", function(event) {
		if (event.which <= 1) {
			if ($(event.target).closest("#bookmark_icon").length) {
				$("#bookmark_list").toggle();
				event.preventDefault();
			} else {
				$("#bookmark_list").hide();
			}
		}
	});

	function addBookmark() {
		var title = prompt("Please enter a title", document.title.replace(/\(\d\) |\(\d\/\d\) | - FetLife| - Kinksters/gi, ""));
		if (title !== null && title !== "") {
//			console.log("Add bookmark: " + document.location.pathname + " = " + title);
			var data = {};
			data[document.location.pathname] = title;
			sync.bookmarks.push(data);
			chrome.storage.sync.set({
				bookmarks: sync.bookmarks
			});
		}
		return false;
	}

	function removeBookmark() {
		if (confirm("Are you sure you wish to remove:\n\"" + getBookmark() + "\"?")) {
//			console.log("Remove bookmark: " + document.location.pathname);
			for (var i = 0; i < sync.bookmarks.length; i++) {
				if (sync.bookmarks[i][document.location.pathname]) {
					sync.bookmarks.splice(i, 1);
					chrome.storage.sync.set({
						bookmarks: sync.bookmarks
					});
					break;
				}
			}
		}
		return false;
	}

	function getBookmark() {
		var path = document.location.pathname;
		for (var i = 0; i < sync.bookmarks.length; i++) {
			if (sync.bookmarks[i][path]) {
				return sync.bookmarks[i][path];
			}
		}
		return null;
	}

	function isBookmark() {
		return getBookmark() !== null;
	}

	function getPicto(path) {
		for (var index in allow) {
			if (allow[index].test(path)) {
				return index;
			}
		}
		return null;
	}

	function canBookmark() {
		return getPicto(document.location.pathname) !== null;
	}

	function createChoice(href, picto, title, seperator) {
		var $anchor = $("<a href=\"" + href + "\" title=\"" + title + "\"><span class=\"picto\">" + picto + "</span>" + title + "</a>");
		$("#bookmark_list").append($("<li" + (seperator ? " class=\"seperator\"" : "") + " style=\"overflow:hidden;white-space:nowrap;\"></li>").append($anchor));
		return $anchor;
	}

	function createList() {
		$("#bookmark_list")
				.hide()
				.empty();

		if (isBookmark()) {
			createChoice("#", "S", "Remove bookmark", true).click(removeBookmark);
		} else if (canBookmark()) {
			createChoice("#", "S", "Bookmark this page", true).click(addBookmark);
		} else if (sync.bookmarks.length === 0) {
			createChoice("#", "d", "No bookmarks", true).click(function() {
				return false;
			});
		}
		for (var i = 0; i < sync.bookmarks.length; i++) {
			for (var first in sync.bookmarks[i]) {
				if (sync.bookmarks[i].hasOwnProperty(first) && typeof (first) !== "function") {
					createChoice(first, getPicto(first), sync.bookmarks[i][first], i === 0);
					break;
				}
			}
		}
	}

	onSync(createList);

}($, document, chrome, sync));
