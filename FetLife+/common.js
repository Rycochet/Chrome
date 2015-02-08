/*
 * Common functions, all hidden within a nice and useful singleton class
 */

(function($, window, chrome) {
	"use strict";

	/**
	 * Common data, storage, and stuff
	 * @constructor
	 */
	function FetLife() {
		var self = this;

		// Options
		this.sync = {
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
			// Navigation
			navigation: true,
			kandp: true,
			// Bookmarks
			bookmarks: [],
			// Feed
			users: {}
		};
		this.local = {
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
			for (var index in this.sync) {
				if (this.sync.hasOwnProperty(index) && localStorage["opt_" + index] !== undefined) {
					this.sync[index] = localStorage["opt_" + index];
					delete localStorage["opt_" + index];
				}
			}
			if (save) {
				chrome.storage.sync.set(this.sync);
			}
		}

		this.onSyncLoaded = false;
		this.onSyncList = [];
		this.onSync = function(fn) {
			this.onSyncList.push(fn);
			if (this.onSyncLoaded) {
				fn.call(this);
			}
		};

		this.onLocalLoaded = false;
		this.onLocalList = [];
		this.onLocal = function(fn) {
			this.onLocalList.push(fn);
			if (this.onLocalLoaded) {
				fn.call(this);
			}
		};

		var txt = $("head script").text();
		if (txt && txt.length) {
			chrome.storage.local.set({
				username: txt.match(/FetLife\.currentUser\.nickname\s*=\s*"(.+)";/)[1] || "",
				userid: parseInt(txt.match(/FetLife\.currentUser\.id\s*=\s*(\d+);/)[1], 10) || -1
			});
		}

		chrome.storage.sync.get(null, function(data) {
			$.extend(self.sync, data);
			self.onSyncLoaded = true;
			self.onSyncList.forEach(function(fn) {
				fn.call(self);
			});
		});

		chrome.storage.local.get(null, function(data) {
			$.extend(self.local, data);
			self.onLocalLoaded = true;
			self.onSyncList.forEach(function(fn) {
				fn.call(self);
			});
		});

		chrome.storage.onChanged.addListener(function(changes, areaName) {
			var isSync = areaName === "sync",
					storage = isSync ? self.sync : self.local,
					fnList = isSync ? self.onSyncList : self.onLocalList;

			for (var i in changes) {
				storage[i] = changes[i].newValue;
			}
			fnList.forEach(function(fn) {
				fn.call(self);
			});
		});
	}

	window.fetlife = new FetLife(); // Save us

}(jQuery, window, chrome));
