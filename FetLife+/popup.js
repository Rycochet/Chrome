(function(document, window, chrome) {
	"use strict";

	var local = {};

	/**
	 * As the name suggests...
	 */
	function onClick() {
		var url = this.href;
		chrome.tabs.query({url: url.replace(/#.*$/, ""), status: "complete"}, function(tabs) {
			if (tabs.length) {
				chrome.tabs.update(tabs[0].id, {active: true});
			} else {
				chrome.tabs.create({
					url: url,
					active: true
				});
			}
		});
		window.close();
		return false;
	}

	/**
	 * Click on the doante button
	 */
	function donate() {
		chrome.windows.create({
			"url": "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JEYU3D2AJCEH8",
			"width": 800,
			"height": 840,
			"type": "popup"});
		window.close();
	}

	chrome.storage.local.get(null, function(data) {
		for (var index in data) {
			local[index] = data[index];
		}
		document.querySelector("#donate").addEventListener("click", donate);
		document.querySelector("#options").href = "chrome://extensions/?options=" + chrome.runtime.id;
		document.querySelector("#inbox").innerText = chrome.i18n.getMessage("inboxButton", [local.messages || 0]);
		document.querySelector("#friends").innerText = chrome.i18n.getMessage("friendshipButton", [local.friends || 0]);
		document.querySelector("#you").innerText = chrome.i18n.getMessage("atYouButton", [local.ats || 0]);
		document.querySelector("#options").addEventListener("click", options);
		var links = document.querySelectorAll("a[href]");
		for (var i = 0; i < links.length; i++) {
			links[i].addEventListener("click", onClick);
		}
	});

}(document, window, chrome));
