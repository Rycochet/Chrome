/*
 * FetLife+ - Main Feed (/home/v4)
 * --------
 * Highlight new feed items.
 * Filter updates to hide user+type updates (but leave the entry there).
 * Notify background page of new updates.
 */
(function(chrome, fetlife) {
	var isNewUpdates = false, // Set the first time we see feed updates
			customizeFeedEnabled = /var\s+customizeFeedEnabled\s+=\s+true;/i.test($("body script").text());


	function getHidden(user, story) {
		if (fetlife.sync.users[story]) {
			return fetlife.sync.users[story][user] === true;
		}
		return false;
	}

	function toggleHidden(user, story) {
		if (fetlife.sync.users[story] && fetlife.sync.users[story][user]) {
			delete fetlife.sync.users[story][user];
		} else {
			fetlife.sync.users[story] = fetlife.sync.users[story] || {};
			fetlife.sync.users[story][user] = true;
		}
		chrome.storage.sync.set({
			users: fetlife.sync.users
		});
	}

	function toggleStories($parent, user, story) {
		var $a = $("a.fetfix_" + user + "_" + story + " span", $parent),
				$b = $a.closest("tr").find(".story .brace .mhs,section");

		if (getHidden(user, story)) {
			$a.text("Show");
			$b.attr("style", "height:0;overflow:hidden;border:1px dotted rgb(221, 221, 221);");
		} else {
			$a.text("Hide");
			$b.attr("style", "");
		}
	}

	function toggleEvent(event) {
		var $target = $(event.target),
				user = $target.data("user"),
				story = $target.data("story");

		toggleHidden(user, story);
		toggleStories("#stories", user, story);
	}

	// New Messages
	function getUpdates() {
		var count = parseInt($("a.view_new span.knockout-bound").text());

		chrome.storage.local.set({
			updates: count
		});
		if (count > 0) {
			isNewUpdates = true;
		}
	}

	getUpdates();
	$("a.view_new span.knockout-bound").on("DOMSubtreeModified", getUpdates);

	function updateAll() {
		var story, user;

		for (story in fetlife.sync.users) {
			for (user in fetlife.sync.users[story]) {
				toggleStories("#stories", user, story);
			}
		}
	}

	fetlife.onSync(updateAll);

	$("#stories").on("DOMNodeInserted", function(event) {
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
//			var $option = $("<a href="#hideByStory" class="fetfix_" + user + "_" + story + " story_options" style="text-decoration:none;"><span>Hide</span> " + type + " content by " + username + "</a>")
					.data("user", user)
					.data("story", story)
					.on("click", toggleEvent);

			// Not a fetlife supporter!
			$(".options > div", $target).attr("data-bind", "visible: page() != 'trends_feed'");
			$(".options ul ul.open li", $target).toggle(customizeFeedEnabled);
			$(".options ul ul.open", $target).css({width: 350}).append($("<li></li>").append($option));

			toggleStories($target, user, story);
		}
	});
}(chrome, fetlife));
