/*
 * New tabs to the front, badge toggle to turn it off.
 */

var updateTimeout = -1;

function isEnabled() {
	var time = parseInt(localStorage.getItem("front") || 0), now = Date.now();
	window.clearTimeout(updateTimeout);
	if (time > now) {
		updateTimeout = setTimeout(update, time - now + 50);
	}
	return time >= 0 && now > time;
}

function isToggle() {
	return parseInt(localStorage.getItem("toggle") || 0) === 1;
}

function update() {
	var front = isEnabled();
	chrome.browserAction.setTitle({title: "New Tabs to the " + (front ? "Front" : "Back")});
	chrome.browserAction.setIcon({path: "icon48" + (front ? "" : "r") + ".png"});
	chrome.browserAction.setPopup({popup: isToggle() ? "" : "popup.html"});
}

function doBadge() {
	localStorage.setItem("front", isEnabled() ? -1 : 0);
	update();
}

chrome.tabs.onCreated.addListener(function(tab) {
	if (isEnabled() && tab.url !== "chrome://newtab/") {
		chrome.tabs.update(tab.id, {selected: true});
	}
});

chrome.browserAction.onClicked.addListener(doBadge);
chrome.runtime.onInstalled.addListener(update);
chrome.runtime.onStartup.addListener(update);
window.addEventListener("storage", update, false);
