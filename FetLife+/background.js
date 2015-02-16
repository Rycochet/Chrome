/*
 * Main script, this controls injecting all other scripts (to ensure verions etc)
 * Also controls FetLife icon including unread pm count...
 */

(function(window, chrome, sync, local) {
	"use strict";

	var timerId = 0, frame = 0, leftVal, rightVal;

	function noop() {
	}

	function setBadge(left, right) {
		if (left === -1 && right === -1) {
			if (!timerId) {
				timerId = window.setInterval(function() {
					chrome.browserAction.setBadgeText({text: "   ....     ".substr(frame++ % 8, 4)});
				}, 250);
			}
		} else if (left !== leftVal || right !== rightVal) {
			if (timerId) {
				window.clearInterval(timerId);
				timerId = 0;
			}
			chrome.browserAction.setBadgeText({text: (
						(left > 0 ? (left < 100 ? left : "99") + "/" : "") +
						(left > 0 || right > 0 ? right : "")
						)});
			leftVal = left;
			rightVal = right;
		}
	}

	function onBackground() {
//		console.log("onBackground();");
		var updates = sync.updates ? local.updates || 0 : 0,
				total = (sync.messages ? local.messages || 0 : 0)
				+ (sync.friends ? local.friends || 0 : 0)
				+ (sync.ats ? local.ats || 0 : 0);

		setBadge(updates, total);
		chrome.browserAction.setTitle({
			title: total
					? "Inbox: " + (local.messages || 0) + ", Friends: " + (local.friends || 0) + ", @You: " + (local.ats || 0)
					: "No updates..."
		});
		if (sync.colour) {
			chrome.browserAction.setBadgeBackgroundColor({color:
						local.messages > 0 ? "#FF0000" // red
						: local.friends > 0 ? "#FF00FF" // purple
						: "#00FF00"}); // green
		}
	}

	onSync(onBackground);
	onLocal(onBackground);

	function getCounts() {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://fetlife.com/polling/counts?fetch=friendship_requests%2Cnew_messages%2Cats", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				var counts = JSON.parse(xhr.responseText),
						friends = parseInt(counts.friendship_requests, 10),
						messages = parseInt(counts.new_messages, 10),
						ats = parseInt(counts.ats, 10);

				notify("Friendship Requests", friends - local.friends, "friendship request", "https://fetlife.com/requests");
				notify("Inbox", messages - local.messages, "unread message", "https://fetlife.com/conversations");
				notify("@You", ats - local.ats, "@You update", "https://fetlife.com/ats");
				chrome.storage.local.set({
					friends: friends,
					messages: messages,
					ats: ats
				});
			}
		};
		xhr.send();
	}

	function getNews() {
		// https://fetlife.com/polling/home/new_stories_v4?subfeed=everything + &marker=xyz
		/*
		 last_event_uuid: null
		 marker_head: "0004dc26-72a8-8f1b-33cd-9784184f4e55"
		 no_more_stories: null
		 show_cta: null
		 stale: null
		 stories: []
		 */
		var xhr = new XMLHttpRequest();
		xhr.open("GET", local.marker ? "https://fetlife.com/polling/home/new_stories_v4?subfeed=everything&marker=" + local.marker : "https://fetlife.com/home/v4_stories.json?subfeed=everything", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				var reply = JSON.parse(xhr.responseText);
//				console.log("getNews();", reply);
				chrome.storage.local.set({
					marker: reply.marker_head,
					stories: reply.no_more_stories ? reply.stories : [],
					updates: reply.no_more_stories ? reply.stories.length : 0
				});
			}
		};
		xhr.send();
	}

	function plural(n) {
		return n === 1 ? "" : "s";
	}

	function notify(title, count, content, url) {
		if (sync.notify && count > 0) {
			closeNotification(url);
			chrome.notifications.create(url, {
				type: "basic",
				iconUrl: "icon48.png",
				title: title,
				buttons: [{
						iconUrl: "icon48.png",
						title: "Open in Browser..."
					}],
				message: "You have " + count + " new " + content + plural(count) + "..."
			}, noop);
		}
	}

	function closeNotification(notificationId) {
		chrome.notifications.clear(notificationId, noop);
	}

	function clickNotification(notificationId) {
		chrome.tabs.query({url: notificationId, status: "complete"}, function(tabs) {
			closeNotification(notificationId);
			if (tabs.length) {
				chrome.tabs.update(tabs[0].id, {active: true});
			} else {
				chrome.tabs.create({
					url: notificationId,
					active: true
				});
			}
		});
	}

	function checkLogin(onAlarm) {
		chrome.cookies.get({url: "https://fetlife.com/", name: "_fl_sessionid"}, function(cookie) {
			if (!cookie) {
				setBadge(-1, -1);
			} else {
				getCounts();
//				getNews();
			}
		});
	}

	function isFeedShown() {
		chrome.tabs.query({url: "https://fetlife.com/home/v4*", status: "complete"}, function(tabs) {
			if (!tabs.length) {
				chrome.storage.local.set({updates: 0});
			}
		});
	}

	chrome.notifications.onClicked.addListener(closeNotification);
	chrome.notifications.onButtonClicked.addListener(clickNotification);

	chrome.runtime.onInstalled.addListener(checkLogin);

	chrome.runtime.onStartup.addListener(isFeedShown);
	chrome.tabs.onRemoved.addListener(isFeedShown);
	chrome.tabs.onUpdated.addListener(isFeedShown);

	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name === "counts") {
			checkLogin();
		}
	});

	chrome.alarms.create("counts", {periodInMinutes: 1});

}(window, chrome, sync, local));
