/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome */
/*
 * New tabs to the front, badge toggle to turn it off.
 */

(function() {
	"use strict";

	/**
	 * Timeout used to enable us again if needed
	 */
	var updateTimeout = -1;

	/**
	 * Runtime data, currently only ctrl key
	 */
	var local = {
		ctrl: false
	};

	/**
	 * Sync data, currently only options
	 */
	var sync = {
		front: false,
		toggle: false,
		ctrl: false,
		badge: false,
		ignore: []
				// Ignore any others as we don't need them here
	};

	/**
	 * Get the domain for a tab if possible
	 * @param {Object} tab
	 */
	function getDomain(tab) {
		var url = tab && tab.url.match(/https?:\/+([^\/]+)/);
		return url ? url[1].toLowerCase() : null;
	}

	/**
	 * Check whether we're enabled
	 * @param {Object} oldTab Currently existing tab
	 * @param {Object} newTab Tab being opened or undefined if just checking for display etc
	 * @returns {Boolean}
	 */
	function isEnabled(oldTab, newTab) {
		var ignored,
				time = sync.front,
				now = Date.now(),
				oldUrl = getDomain(oldTab),
				newUrl = getDomain(newTab);

		if (oldUrl && (!newTab || oldUrl === newUrl)) {
			ignored = sync.ignore.indexOf(oldUrl) >= 0;
		}
		if (!sync.badge) {
			chrome.browserAction.setBadgeText({text: ignored ? "!" : ""});
		}
		window.clearTimeout(updateTimeout);
		if (time > now) {
			updateTimeout = setTimeout(update, time - now + 50);
			ignored = true;
		} else if (time === -1) {
			ignored = true;
		}
		return (sync.ctrl && !local.ctrl) && !ignored;
	}

	/**
	 * Update the badge icon, title and action
	 */
	function update() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var front = isEnabled(tabs[0]);
			if (sync.toggle) {
				front = sync.front >= 0;
			}
			chrome.browserAction.setTitle({title: chrome.i18n.getMessage(front ? "extTitleEnabled" : "extTitleDisabled")});
			chrome.browserAction.setIcon({path: "icon48" + (front ? "" : "r") + ".png"});
			chrome.browserAction.setPopup({popup: sync.toggle ? "" : "popup.html"});
		});
	}

	/**
	 * Called when starting - cache our info
	 * @param {?Object} details
	 */
	function startup(details) {
		chrome.storage.sync.get(null, function(items) {
			for (var key in items) {
				sync[key] = items[key];
			}
			// Updating from an earlier version that used localStorage
			// TODO: Remove this section in a couple of months...
			if (details && details.reason === "update" && parseFloat(details.previousVersion) <= 1.5) {
				sync.ignore = sync.ignore.length ? sync.ignore : JSON.parse(localStorage.getItem("ignore") || "[]");
				sync.front |= parseFloat(localStorage.getItem("front") || 0);
				sync.toggle |= parseFloat(localStorage.getItem("toggle") || 0);
				sync.ignored |= parseFloat(localStorage.getItem("ignored") || 0);
				sync.donate |= parseFloat(localStorage.getItem("donate") || 0);
				sync.settings |= parseFloat(localStorage.getItem("settings") || 0);
				chrome.storage.sync.set(sync);
				localStorage.clear();
			}
			// Watch for ctrl key
			chrome.tabs.query({}, function(tabs) {
				for (var i in tabs) {
					ctrlInTab(tabs[i].id);
				}
			});
			update();
		});
	}

	/**
	 * Toggle enabled state
	 */
	function toggle() {
		sync.front = sync.front ? 0 : -1;
		chrome.storage.sync.set(sync);
		update();
	}

	/**
	 * Toggle ignoring the current domain
	 */
	function ignore() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var url = tabs[0].url.match(/.*?:\/+([^\/]+)/)[1];

			if (url && url.length) {
				var index = sync.ignore.indexOf(url);

				if (index >= 0) {
					sync.ignore.splice(index, 1);
				} else {
					sync.ignore.push(url);
					sync.ignore.sort(function(a, b) {
						return a.replace(/^www\./i, "") - b.replace(/^www\./i, "");
					});
				}
				chrome.storage.sync.set(sync);
				update();
			}
		});
	}

	/**
	 * Inject the sontent script to watch for the tab key
	 * @param {Number} tabId
	 */
	function ctrlInTab(tabId) {
		if (sync.ctrl) {
			chrome.tabs.executeScript(tabId, {
				file: "keypress.js",
				allFrames: true,
				matchAboutBlank: true,
				runAt: "document_start"
			}, function() {
				chrome.runtime.lastError; // Don't worry if we can't hook a tab
			});
		}
	}

	// Click on the button unless we're using a menu (by option)
	chrome.browserAction.onClicked.addListener(toggle);

	// Watch for new tabs being created, set focus if enabled
	chrome.tabs.onCreated.addListener(function(tab) {
		ctrlInTab(tab.id);
		if (tab.url !== "chrome://newtab/") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				if (isEnabled(tab, tabs[0])) {
					chrome.tabs.update(tab.id, {selected: true});
				}
			});
		}
	});

	// Handle control keypress - currently only toggle
	chrome.commands.onCommand.addListener(function(command) {
		switch (command) {
			case "toggle":
				return toggle();
			case "ignore":
				return ignore();
		}
	});

	// Watch for our settings being changed
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		var storage = areaName === "local" ? local : sync;
		for (var key in changes) {
			storage[key] = changes[key].newValue;
		}
		if (storage === sync && changes.sync && changes.sync.newValue) {
			chrome.tabs.query({}, function(tabs) {
				for (var i in tabs) {
					ctrlInTab(tabs[i].id);
				}
			});
		}
		update();
	});

	// Update display on changing active tab
	chrome.tabs.onActivated.addListener(update);

	// Watch for tab url being changed
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.url) {
			update();
		}
	});

	// When we've been installed on a running browser
	chrome.runtime.onInstalled.addListener(startup);

	// When we're already installed and browser starts
	chrome.runtime.onStartup.addListener(startup);
}());
