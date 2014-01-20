/**
 * FetLife+ - Main Feed (/home/v4)
 * --------
 * Highlight new feed items.
 * Filter updates to hide user+type updates (but leave the entry there).
 * Notify background page of new updates.
 */

var users = {}; // Make sure it"s blank at the least
var isNewUpdates = false; // Set the first time we see feed updates
var customizeFeedEnabled = /var\s+customizeFeedEnabled\s+=\s+true;/i.test($("body script").text());

function getData() {
	chrome.storage.sync.get("users", function(items) {
		users = items.users || {};
		updateAll();
	});
}

function setData() {
	chrome.storage.sync.set({users: users});
}

function getHidden(user, story) {
	if (users instanceof Object && users[story] instanceof Object) {
		return users[story][user] === true;
	}
	return false;
}

function toggleHidden(user, story) {
	if (!(users instanceof Object)) {
		users = {};
	}
	if (!(users[story] instanceof Object)) {
		users[story] = {};
	}
	if (users[story][user]) {
		delete users[story][user];
	} else {
		users[story][user] = true;
	}
	setData();
}

function updateAll() {
	for (story in users) {
		if (users.hasOwnProperty(story)) {
			for (user in users[story]) {
				if (users[story].hasOwnProperty(user)) {
					toggleStories("#stories", user, story);
				}
			}
		}
	}
}

function toggleStories($parent, user, story) {
	var $a = $("a.fetfix_" + user + "_" + story + " span", $parent);
	var $b = $(".story .brace .mhs,section", $a.closest("tr"));
	if (getHidden(user, story)) {
		$a.text("Show");
		$b.attr("style", "height:0;overflow:hidden;border:1px dotted rgb(221, 221, 221);");
	} else {
		$a.text("Hide");
		$b.attr("style", "");
	}
}

function toggleEvent(event) {
	var $target = $(event.target);
	var user = $target.data("user");
	var story = $target.data("story");
	toggleHidden(user, story);
	toggleStories("#stories", user, story);
}

// New Messages
function getUpdates() {
	var count = parseInt($("a.view_new span.knockout-bound").text());
	chrome.storage.local.set({updates: count});
	if (count > 0) {
		isNewUpdates = true;
	}
}
getUpdates();
$("a.view_new span.knockout-bound").bind("DOMSubtreeModified", function(event) {
	getUpdates();
});

// FetLife Feed
getData();
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName === "sync" && changes.users) {
		getData();
	}
});

$("#stories").bind("DOMNodeInserted", function(event) {
	var $target = $(event.target), type;
	if ($target.is("tr")) {
		if (isNewUpdates) {
			$target.css({
				backgroundColor: "#333333"
			}).animate({
				backgroundColor: "#1B1B1B"
			}, 30000, "swing", function() {
				$target.css({backgroundColor: ""});
			});
		}
		switch ($target.attr("class")) {
			default:
				return; // Some stories can"t really be hidden
			case "like_created":
				if ($(".story img", $target).length === 0) { // only hide picture likes
					return;
				}
			case "picture_created":
			case "comment_created":
				type = "pictures";
				break;

			case "wall_post_created":
			case "status_created":
			case "post_comment_created":
			case "group_comment_created":
				type = "writings";
				break;
		}

		var $user = $(".user a", $target);
		var username = $("img", $user).attr("title");
		var user = $user.attr("href").replace("/users/", "");
		var story = $target.attr("class");

		// Add option toggle
		var $option = $("<a href=\"#hideByStory\" class=\"fetfix_" + user + "_" + story + " story_options\" style=\"text-decoration:none;\"><span>Hide</span> " + $target.attr("class") + " content by " + username + "</a>")
//		var $option = $("<a href="#hideByStory" class="fetfix_" + user + "_" + story + " story_options" style="text-decoration:none;"><span>Hide</span> " + type + " content by " + username + "</a>")
				.data("user", user)
				.data("story", story)
				.click(toggleEvent);

		// Not a fetlife supporter!
		$(".options > div", $target).attr("data-bind", "visible: page() != 'trends_feed'");
		$(".options ul ul.open li", $target).toggle(customizeFeedEnabled);
		$(".options ul ul.open", $target).width(350).append($("<li></li>").append($option));

		toggleStories($target, user, story);
	}
});
