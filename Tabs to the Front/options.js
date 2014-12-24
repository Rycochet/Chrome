/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome */

(function() {
	"use strict";

	/**
	 * Shortcut to document.querySelector - if given a number find the nth anchor
	 * @param {(number|string)} id
	 * @returns {Element}
	 */
	function find(id) {
		return document.querySelector(id);
	}

	/**
	 * Toggle the menu / toggle item and hide the menu section if needed
	 */
	function toggleMenu() {
		var toggleVal = find("#opt_toggle").checked;
		localStorage.setItem("toggle", toggleVal ? 0 : 1);
		find("#menu_section").style.display = toggleVal ? "" : "none";
		find("#ignore_section").style.display = !toggleVal || find("#opt_ignore").checked ? "none" : "";
	}

	/**
	 * Toggle the menu / toggle item and hide the menu section if needed
	 */
	function toggleIgnore() {
		var toggleVal = this.checked;
		localStorage.setItem("ignored", toggleVal ? 1 : 0);
		find("#ignore_section").style.display = !find("#opt_toggle").checked || toggleVal ? "none" : "";
	}

	/**
	 * Set the donate option
	 */
	function toggleDonate() {
		localStorage.setItem("donate", this.checked ? 1 : 0);
	}

	/**
	 * Set the settings option
	 */
	function toggleSettings() {
		localStorage.setItem("settings", this.checked ? 1 : 0);
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
	 * Remove an ignored domain
	 */
	function removeIgnore() {
		var li = this.parentNode,
				url = li.textContent,
				ignored = JSON.parse(localStorage.getItem("ignore") || "[]"),
				index = ignored.indexOf(url);

		if (index >= 0) {
			ignored.splice(index, 1);
			localStorage.setItem("ignore", JSON.stringify(ignored));
			li.remove();
		}
	}

	function createIgnoreList() {
		var i, li, div,
				ignoreList = JSON.parse(localStorage.getItem("ignore") || "[]"),
				ul = find("#ignore_list");

		while (ul.hasChildNodes()) {
			ul.removeChild(ul.lastChild);
		}
		for (i = 0; i < ignoreList.length; i++) {
			li = document.createElement("li");
			div = document.createElement("div");
			div.appendChild(document.createElement("button"));
			div.appendChild(document.createTextNode(ignoreList[i]));
			div.addEventListener("click", removeIgnore);
			li.appendChild(div);
			ul.appendChild(li);
		}
	}

	// Make sure we update if still open
	window.addEventListener("storage", createIgnoreList, false);

	/**
	 * Setup all click handlers and start the text update
	 */
	document.addEventListener("DOMContentLoaded", function() {
		var toggleVal = parseFloat(localStorage.getItem("toggle") || 0),
				ignoreVal = parseFloat(localStorage.getItem("ignored") || 0);

		find("#menu_section").style.display = toggleVal ? "none" : "";
		find("#ignore_section").style.display = toggleVal || ignoreVal ? "none" : "";

		setupInput("#opt_toggle", toggleMenu, !toggleVal);
		setupInput("#opt_toggle2", toggleMenu, toggleVal);
		setupInput("#opt_donate", toggleDonate, parseFloat(localStorage.getItem("donate") || 0));
		setupInput("#opt_settings", toggleSettings, parseFloat(localStorage.getItem("settings") || 0));
		setupInput("#opt_ignore", toggleIgnore, ignoreVal);

		createIgnoreList();
	});
}());