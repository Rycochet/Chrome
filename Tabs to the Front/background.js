/*
 * New tabs to the front, badge toggle to turn it off.
 */

var title = [
	'New Tabs to the Front',
	'New Tabs to the Back'
];

var icon = [
	'icon48.png',
	'icon48r.png'
];

function get() {
	return parseInt(localStorage.getItem('front') || 0);
}

function updateBadge() {
	var front = get();
	chrome.browserAction.setTitle({title:title[front]});
	chrome.browserAction.setIcon({path:icon[front]});
}

function doBadge() {
	localStorage.setItem('front', 1 - get());
	updateBadge();
}

chrome.tabs.onCreated.addListener(function(tab) {
	if (!get() && tab.url != 'chrome://newtab/') {
		chrome.tabs.update(tab.id, {selected: true});
	}
});

chrome.browserAction.onClicked.addListener(doBadge);
chrome.runtime.onInstalled.addListener(updateBadge);
chrome.runtime.onStartup.addListener(updateBadge);
