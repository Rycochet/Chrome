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
	 * Get the domain for a tab if possible
	 * @param {Object} tab
	 */
	function getDomain(tab) {
		return tab && tab.url.match(/https?:\/+([^\/]+)/);
	}

	/**
	 * Check whether we're enabled
	 * @param {Object} oldTab Currently existing tab
	 * @param {Object} newTab Tab being opened or undefined if just checking for display etc
	 * @returns {Boolean}
	 */
	function isEnabled(oldTab, newTab) {
		var ignored,
				time = parseFloat(localStorage.getItem("front") || 0), now = Date.now(),
				oldUrl = getDomain(oldTab),
				newUrl = getDomain(newTab);

		window.clearTimeout(updateTimeout);
		if (time > now) {
			updateTimeout = setTimeout(update, time - now + 50);
		}
		if ((newTab && oldUrl && newUrl && oldUrl[1] === newUrl[1]) || (!newTab && oldUrl)) {
			ignored = JSON.parse(localStorage.getItem("ignore") || "[]").indexOf(oldUrl[1]) >= 0;
		}
		return !ignored && time >= 0 && now > time;
	}

	/**
	 * Update the badge icon, title and action
	 */
	function update() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var front = isEnabled(tabs[0]);
			chrome.browserAction.setTitle({title: "New Tabs to the " + (front ? "Front" : "Back")});
			chrome.browserAction.setIcon({path: "icon48" + (front ? "" : "r") + ".png"});
			chrome.browserAction.setPopup({popup: parseFloat(localStorage.getItem("toggle") || 0) ? "" : "popup.html"});
		});
	}

	// Click on the button unless we're using a menu (by option)
	chrome.browserAction.onClicked.addListener(function() {
		localStorage.setItem("front", parseFloat(localStorage.getItem("front") || 0) ? 0 : -1);
		update();
	});

	// Watch for new tabs being created, set focus if enabled
	chrome.tabs.onCreated.addListener(function(tab) {
		if (tab.url !== "chrome://newtab/") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				if (isEnabled(tab, tabs[0])) {
					chrome.tabs.update(tab.id, {selected: true});
				}
			});
		}
	});

	// Watch for tab url being changed
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.url) {
			update();
		}
	});

	// Update display on changing tabs
	chrome.tabs.onActivated.addListener(update);
	// When we've been installed on a running browser
	chrome.runtime.onInstalled.addListener(update);
	// When we're already installed and browser starts
	chrome.runtime.onStartup.addListener(update);
	// Watch for our settings being changed
	window.addEventListener("storage", update, false);
}());
