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
	function toggle() {
		var toggleVal = find("#opt_toggle").checked;
		localStorage.setItem("toggle", toggleVal ? 0 : 1);
		find("#menu_section").style.display = toggleVal ? "" : "none";
	}

	/**
	 * Set the donate option
	 */
	function donate() {
		localStorage.setItem("donate", find("#opt_donate").checked ? 1 : 0);
	}

	/**
	 * Set the settings option
	 */
	function settings() {
		localStorage.setItem("settings", find("#opt_settings").checked ? 1 : 0);
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
	 * Setup all click handlers and start the text update
	 */
	document.addEventListener("DOMContentLoaded", function() {
		var toggleVal = parseFloat(localStorage.getItem("toggle") || 0);
		find("#menu_section").style.display = toggleVal == 0 ? "" : "none";
		setupInput("#opt_toggle", toggle, toggleVal === 0);
		setupInput("#opt_toggle2", toggle, toggleVal === 1);
		setupInput("#opt_donate", donate, parseFloat(localStorage.getItem("donate") || 0) === 1);
		setupInput("#opt_settings", settings, parseFloat(localStorage.getItem("settings") || 0) === 1);
	});
}());