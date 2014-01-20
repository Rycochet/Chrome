/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome, jQuery */
/*
 * Common functions, all hidden within a nice and useful singleton class
 */

(function($, document) {
	"use strict";

	/**
	 * Common data, storage, and stuff
	 * @constructor
	 */
	function FetLife() {
		var self = this, done = 0;
		// Variables
		this.username = "";
		this.userid = -1;
		// Badge
		this.opt_updates = true;
		this.opt_messages = true;
		this.opt_friends = true;
		this.opt_ats = true;
		this.opt_colour = true;
		// Notify
		this.opt_notify = true;
		// Kinky & Popular
		this.opt_kandp_width = true;
		// Navigation
		this.opt_navigation = true;
		this.opt_kandp = true;

		// Background.js - Badge
		this.updates = 0;
		this.messages = 0;
		this.friends = 0;
		this.ats = 0;
		this.marker = null;
		this.stories = [];

		/**
		 * Set a value, and pass it back into storage
		 * @param {object} data
		 * @param {?string} areaName
		 */
		this.set = function(data, areaName) {
			areaName = areaName || "sync";
			chrome.storage[areaName].set(data);
			$(document).triggerHandler(areaName);
		};

		function checkLoaded() {
			done++;
			if (done === 3) { // Local data, Sync data, Page loaded
				$(document).triggerHandler("init");
			}
		}

		function setInitialData(data) {
			var i;
			for (i in data) {
				if (data.hasOwnProperty(i) && i.indexOf("_") !== 0 && !$.isFunction(self[i])) {
					self[i] = data[i];
				}
			}
			checkLoaded();
		}

		chrome.storage.sync.get(null, setInitialData);
		chrome.storage.local.get(null, setInitialData);

		chrome.storage.onChanged.addListener(function(changes, areaName) {
			var i;
			for (i in changes) {
				if (changes.hasOwnProperty(i) && i.indexOf("_") !== 0 && !$.isFunction(self[i])) {
					self[i] = changes[i].newValue;
				}
			}
			$(document).triggerHandler(areaName);
		});

		$(function() {
			var txt = $("head script").text();
			if (txt && txt.length) {
				self.username = txt.match(/FetLife\.currentUser\.nickname\s*=\s*"(.+)";/)[1];
				self.userid = parseInt(txt.match(/FetLife\.currentUser\.id\s*=\s*(\d+);/)[1], 10);
			}
			checkLoaded();
		});
	}

	window.fetlife = new FetLife(); // Save us

}(jQuery, document));
