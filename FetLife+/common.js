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
		// Navigation
		navigation: true,
		kandp: true,
		// Bookmarks
		bookmarks: [],
		// Feed
		users: {}
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

	{ // TODO: update storage, remove in a few weeks
		var save = false;
		for (var index in sync) {
			if (sync.hasOwnProperty(index) && localStorage["opt_" + index] !== undefined) {
				sync[index] = localStorage["opt_" + index];
				delete localStorage["opt_" + index];
			}
		}
		if (save) {
			chrome.storage.sync.set(sync);
		}
	}

	var loaded = false,
			onSyncList = [],
			onLocalList = [];

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
		});
	});

	chrome.storage.onChanged.addListener(function(changes, areaName) {
		var isSync = areaName === "sync",
				storage = isSync ? sync : local,
				fnList = isSync ? onSyncList : onLocalList;

		for (var i in changes) {
			storage[i] = changes[i].newValue;
		}
		fnList.forEach(function(fn) {
			fn();
		});
	});

}(window, chrome));
