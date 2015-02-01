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
		badge: false,
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
	 * Get the element index
	 * @param {Element} element
	 * @returns {Number}
	 */
	function indexOf(element) {
		var index = -1;
		while (element) {
			if (element.nodeType === 1) {
				index++;
			}
			element = element.previousSibling;
		}
		return index;
	}

	/**
	 * Add an ignore if the return key is pressed
	 * @param {Event} event
	 */
	function addIgnore(event) {
		var keyCode = event.keyCode;

		if (keyCode === 13) {
			var list = this.parentNode.parentNode,
					index = -1,
					domain = this.value.replace(/(^http?s:\/?\/?|^\/+|\/.*$)/g, "");

			if (sync.ignore.indexOf(domain) === -1) {
				if (list.nextSibling) {
					index = indexOf(list);
				}
				if (index >= 0) {
					sync.ignore[index] = domain;
				} else {
					sync.ignore.push(domain);
				}
				update();
			}
		}
	}

	/**
	 * Remove an ignored domain
	 */
	function removeIgnore() {
		var index = indexOf(this.parentNode.parentNode);

		if (index >= 0) {
			sync.ignore.splice(index, 1);
		}
		update();
	}

	function focusInput() {
		this.parentNode.classList.add("focus");
	}

	function blurInput() {
		this.parentNode.classList.remove("focus");
		if (this.parentNode.parentNode.nextSibling) {
			addIgnore.call(this, {keyCode: 13});
		}
	}

	/**
	 * Create the ignore list, including the "Add domain" box
	 */
	function createIgnoreList() {
		var i, li, div, span, button, input,
				ul = find("#ignore_list");

		while (ul.hasChildNodes()) {
			ul.removeChild(ul.lastChild);
		}
		for (i = 0; i <= sync.ignore.length; i++) {
			li = document.createElement("li");
			div = document.createElement("div");
			input = document.createElement("input");
			input.type = "text";
			input.placeholder = chrome.i18n.getMessage("optionsDomain");
			input.addEventListener("keyup", addIgnore);
			input.addEventListener("focus", focusInput);
			input.addEventListener("blur", blurInput);
			if (i < sync.ignore.length) {
				span = document.createElement("span");
				button = document.createElement("button");
				button.addEventListener("click", removeIgnore);
				span.style.backgroundImage = "url(chrome://favicon/size/16@1x/iconurl/http://" + sync.ignore[i] + "/favicon.ico)";
				input.value = sync.ignore[i];
				div.appendChild(span);
				div.appendChild(button);
			}
			div.appendChild(input);
			li.appendChild(div);
			ul.appendChild(li);
		}
	}

	/**
	 * Update the options display
	 */
	function update() {
		find("#menu_section").style.display = sync.toggle ? "none" : "";
		find("#ignore_list").style.display = sync.ignored ? "none" : "";
		find("#opt_badge").parentNode.style.display = sync.ignored ? "none" : "";

		setupInput("#opt_toggle", toggleMenu, !sync.toggle);
		setupInput("#opt_toggle2", toggleMenu, sync.toggle);
		setupInput("#opt_badge", toggleMenu, !sync.badge);
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