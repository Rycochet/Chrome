/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome, jQuery, fetlife */

// Chrome FetLife icon including unread pm count...

(function($, document, fetlife) {
	"use strict";

	var timerId = 0, frame = 0, leftVal, rightVal;

	fetlife.setBadge = function(left, right) {
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
	};

	fetlife.onChange = function() {
		console.log("fetlife.onChange();");
		var updates = parseInt(this.opt_updates ? this.updates : 0, 10),
				total = (this.opt_messages ? this.messages : 0) + (this.opt_friends ? this.friends : 0) + (this.opt_ats ? this.ats : 0);
		this.setBadge(updates, total);
		chrome.browserAction.setTitle({title: total ? ("Inbox: " + (this.messages || 0) + ", Friends: " + (this.friends || 0) + ", @You: " + (this.ats || 0)) : "No updates..."});
		if (this.opt_colour) {
			chrome.browserAction.setBadgeBackgroundColor({color:
						this.messages > 0 ? "#FF0000" // red
						: this.friends > 0 ? "#FF00FF" // purple
						: "#00FF00"}); // green
		}
	};

	$(document).on("sync local", fetlife.onChange.bind(fetlife));

	fetlife.getCounts = function() {
		$.get("https://fetlife.com/polling/counts?fetch=friendship_requests%2Cnew_messages%2Cats", function(counts) {
			console.log("FetLife.getCounts();", counts);
			var friends = parseInt(counts.friendship_requests, 10),
					messages = parseInt(counts.new_messages, 10),
					ats = parseInt(counts.ats, 10);
			notify("Friendship Requests", friends - fetlife.friends, "friendship request");
			notify("Inbox", messages - fetlife.messages, "unread message");
			notify("@You", ats - fetlife.ats, "@You update");
			fetlife.set({
				"friends": friends,
				"messages": messages,
				"ats": ats
			});
		});
	};

	fetlife.getNews = function() {
		// https://fetlife.com/polling/home/new_stories_v4?subfeed=everything + &marker=xyz
		/*
		 last_event_uuid: null
		 marker_head: "0004dc26-72a8-8f1b-33cd-9784184f4e55"
		 no_more_stories: null
		 show_cta: null
		 stale: null
		 stories: []
		 */
		$.get("https://fetlife.com" + (this.marker ? "/polling/home/new_stories_v4?subfeed=everything&marker=" + this.marker : "https://fetlife.com/home/v4_stories.json?subfeed=everything"), function(reply) {
			console.log("FetLife.getNews();");
			fetlife.set({
				marker: reply.marker_head,
				stories: reply.no_more_stories ? reply.stories : [],
				updates: reply.no_more_stories ? reply.stories.length : 0
			}, "local");
		});
	};

	function plural(n) {
		return n === 1 ? "" : "s";
	}

	function notify(title, count, content, url) {
		chrome.storage.sync.get("opt_notify", function(options) {
			if (!options.opt_notify && count > 0) {
				var notification = webkitNotifications.createNotification("icon48.png", title, "You have " + count + " new " + content + plural(count) + "...");
				notification.show();
				window.setTimeout(function() {
					notification.cancel();
				}, 10000);
			}
		});
	}

	function checkLogin(onAlarm) {
		chrome.cookies.get({url: "https://fetlife.com/", name: "_fl_sessionid"}, function(cookie) {
			if (!cookie) {
				fetlife.setBadge(-1, -1);
			} else {
				fetlife.getCounts();
//			fetlife.getNews();
			}
		});
	}

	function isFeedShown() {
//	console.log("isFeedShown();");
		chrome.tabs.query({url: "https://fetlife.com/home/v4*"}, function(tabs) {
			if (!tabs.length) {
				chrome.storage.local.set({updates: 0});
			}
		});
	}

	chrome.runtime.onInstalled.addListener(function() {
		console.log("onInstalled();");
		chrome.storage.local.set({updates: 0, marker_head: null /*, friends: 0, messages: 0, ats: 0*/});
		checkLogin();
	});

	chrome.runtime.onStartup.addListener(function() {
		console.log("onStartup();");
		isFeedShown();
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
//		console.log("onRemoved(" + tabId + ", " + JSON.stringify(removeInfo) + ");");
		isFeedShown();
	});

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.status === "complete") {
//		console.log("onUpdated(" + tabId + ", " + JSON.stringify(changeInfo) + ", " + JSON.stringify(tab) + ");");
			isFeedShown();
		}
	});

	/*
	 chrome.webRequest.onCompleted.addListener(function(details) {
	 console.log(details);
	 }, {urls: ["https://fetlife.com/polling/home/new_stories_v4*"]});
	 */

	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name === "counts") {
			console.log("onAlarm();");
			checkLogin();
		}
	});

	chrome.alarms.create("counts", {periodInMinutes: 1});

}(jQuery, document, fetlife));
