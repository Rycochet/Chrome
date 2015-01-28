/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome */

(function() {
	"use strict";

	/**
	 * Sync data, currently only options
	 */
	var sync = {
		front: false,
		toggle: false,
		ctrl: false,
		donate: false,
		settings: false,
		ignore: []
	};

	/**
	 * Shortcut to document.querySelector - if given a number find the nth anchor
	 * @param {(number|string)} id
	 * @returns {Element}
	 */
	function find(id) {
		return document.querySelector(id);
	}

	/**
	 * Setup an input element with listener and checked state
	 * @param {string} selector
	 * @param {function} callback
	 * @param {boolean} checked
	 */
	function setupInput(selector, callback, checked) {
		var element = find(selector);
		element.checked = checked;
		element.addEventListener("change", callback);
	}

	/**
	 * Save data to sync storage
	 */
	function save() {
		chrome.storage.sync.set(sync);
		close();
	}

	/**
	 * Close options window
	 */
	function close() {
		window.close();
	}

	/**
	 * Toggle the menu / toggle item and hide the menu section if needed
	 */
	function toggleMenu() {
		sync.toggle = !find("#opt_toggle").checked;
		update();
	}

	/**
	 * Toggle the menu / toggle item and hide the menu section if needed
	 */
	function toggleIgnore() {
		sync.ignored = this.checked;
		update();
	}

	/**
	 * Set the donate option
	 */
	function toggleDonate() {
		sync.donate = this.checked;
		update();
	}

	/**
	 * Set the settings option
	 */
	function toggleSettings() {
		sync.settings = this.checked;
		update();
	}

	/**
	 * Set the settings option
	 */
	function toggleCtrl() {
		var checked = this.checked;
		chrome.permissions[checked ? "request" : "remove"]({
			origins: ["<all_urls>"]
		}, function(granted) {
			if (granted) {
				sync.ctrl = checked;
			}
			update();
		});
	}

	/**
	 * Remove an ignored domain
	 */
	function removeIgnore() {
		var li = this.parentNode,
				url = li.textContent,
				index = sync.ignore.indexOf(url);

		if (index >= 0) {
			sync.ignore.splice(index, 1);
			li.remove();
		}
		update();
	}

	function createIgnoreList() {
		var i, li, div, span, button,
				ul = find("#ignore_list");

		while (ul.hasChildNodes()) {
			ul.removeChild(ul.lastChild);
		}
		for (i = 0; i < sync.ignore.length; i++) {
			//background-image: -webkit-image-set(url(chrome://favicon/size/16@1x/iconurl/http://www.amazon.co.uk/favicon.ico) 1x);
			li = document.createElement("li");
			div = document.createElement("div");
			span = document.createElement("span");
			button = document.createElement("button");
			button.addEventListener("click", removeIgnore);
			span.style.backgroundImage = "url(chrome://favicon/size/16@1x/iconurl/http://" + sync.ignore[i] + "/favicon.ico)";
			div.appendChild(span);
			div.appendChild(button);
			div.appendChild(document.createTextNode(sync.ignore[i]));
			li.appendChild(div);
			ul.appendChild(li);
		}
	}

	function update() {
		find("#menu_section").style.display = sync.toggle ? "none" : "";
		find("#ignore_list").style.display = sync.ignored ? "none" : "";

		setupInput("#opt_toggle", toggleMenu, !sync.toggle);
		setupInput("#opt_toggle2", toggleMenu, sync.toggle);
		setupInput("#opt_donate", toggleDonate, sync.donate);
		setupInput("#opt_settings", toggleSettings, sync.settings);
		setupInput("#opt_ignore", toggleIgnore, sync.ignored);
		setupInput("#opt_ctrl", toggleCtrl, sync.ctrl);

		createIgnoreList();
	}

	// Make sure we update if still open
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName === "sync") {
			for (var key in changes) {
				sync[key] = changes[key].newValue;
			}
			update();
		}
	});

	/**
	 * Setup all click handlers and start the text update
	 */
	document.addEventListener("DOMContentLoaded", function() {
		find("#button_ok").addEventListener("click", save);
		find("#button_cancel").addEventListener("click", close);

		chrome.storage.sync.get(null, function(items) {
			for (var key in items) {
				sync[key] = items[key];
			}
			update();
		});
	});
}());