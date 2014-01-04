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
	 * Check whether we're enabled
	 * @returns {Boolean}
	 */
	function isEnabled() {
		var time = parseFloat(localStorage.getItem("front") || 0), now = Date.now();
		window.clearTimeout(updateTimeout);
		if (time > now) {
			updateTimeout = setTimeout(update, time - now + 50);
		}
		return time >= 0 && now > time;
	}

	/**
	 * Check whether we're supposed to toggle or show a menu
	 * @returns {Boolean}
	 */
	function isToggle() {
		return parseFloat(localStorage.getItem("toggle") || 0) === 1;
	}

	/**
	 * Update the badge and anything else settings might change
	 */
	function update() {
		var front = isEnabled();
		chrome.browserAction.setTitle({title: "New Tabs to the " + (front ? "Front" : "Back")});
		chrome.browserAction.setIcon({path: "icon48" + (front ? "" : "r") + ".png"});
		chrome.browserAction.setPopup({popup: isToggle() ? "" : "popup.html"});
	}

	/**
	 * Click on the badge (only if no popup menu)
	 */
	function badgeClick() {
		localStorage.setItem("front", isEnabled() ? -1 : 0);
		update();
	}

	/**
	 * Watch for new tabs being created, set focus if enabled
	 * @param {Object} tab
	 */
	chrome.tabs.onCreated.addListener(function(tab) {
		if (isEnabled() && tab.url !== "chrome://newtab/") {
			chrome.tabs.update(tab.id, {selected: true});
		}
	});

	/*
	 * Various event listeners
	 */
	chrome.browserAction.onClicked.addListener(badgeClick);
	chrome.runtime.onInstalled.addListener(update);
	chrome.runtime.onStartup.addListener(update);
	window.addEventListener("storage", update, false);

}());