/*
 * Common functions, all hidden within a nice and useful singleton class
 */

(function(window, chrome) {
	"use strict";

	window.sync = {
		// Badge
		updates: true,
		messages: true,
		friends: true,
		ats: true,
		colour: true,
		// Notify
		notify: true,
		// Kinky & Popular
		kandp_width: true,
		kandp_default: "/explore/",
		// Main Feed
		feed_default: "/home",
		// Navigation
		navigation: true,
		kandp: true,
		// Bookmarks
		bookmarks: [],
		// Feed
		users: {},
		// Blocked users
		block_action: "",
		blocked: {}
	};

	window.local = {
		username: "",
		userid: -1,
		// Badge
		updates: 0,
		messages: 0,
		friends: 0,
		ats: 0,
		// Feed
		marker: null,
		stories: []
	};

	var loaded = false,
			onSyncList = [],
			onLocalList = [],
			onLoadedList = [];

	window.onSync = function(fn) {
		onSyncList.push(fn);
		if (loaded) {
			fn.call(this);
		}
	};

	window.onLocal = function(fn) {
		onLocalList.push(fn);
		if (loaded) {
			fn.call(this);
		}
	};

	window.onLoaded = function(fn) {
		onLoadedList.push(fn);
		if (loaded) {
			fn.call(this);
		}
	};

	chrome.storage.sync.get(null, function(data) {
		for (var index in data) {
			sync[index] = data[index];
		}
		chrome.storage.local.get(null, function(data) {
			for (var index in data) {
				local[index] = data[index];
			}
			loaded = true;
			onSyncList.forEach(function(fn) {
				fn();
			});
			onLocalList.forEach(function(fn) {
				fn();
			});
			onLoadedList.forEach(function(fn) {
				fn();
			});
		});
	});

	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName === "sync" || areaName === "local") {
			for (var i in changes) {
				window[areaName][i] = changes[i].newValue;
			}
			(areaName === "sync" ? onSyncList : onLocalList).forEach(function(fn) {
				fn();
			});
		}
	});

}(window, chrome));
