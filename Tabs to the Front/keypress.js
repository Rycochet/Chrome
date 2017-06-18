/*
 * Listen for the Ctrl key (Command on Mac) and remember its pressed state.
 * 
 * IMPORTANT: This requires additional permission to run. The permission can
 * also be used to give full access to *everything*, so if you're not sure
 * what's going on then DO NOT ALLOW IT.
 * 
 * This is the source code for "Tabs to the Front" -
 * https://chrome.google.com/webstore/detail/tabs-to-the-front/hiembaoomcehoiehhdldabfgnmphappc
 */
(function(document, chrome) {
	"use strict";

	if (!document.tabsToTheFrontListener) {
		var sendCtrl = function(event) {
			// We use this next line to communicate back to the extension...
			chrome.storage.local.set({
				// ...to store the state of the Control key
				ctrl: event.ctrlKey
			});
		}, options = {
			// Look at the keyboard before anything else - which means anything on the page should leave us alone
			capture: true,
			// We never prevent the keyboard event, just watch it
			passive: true
		};

		document.tabsToTheFrontListener = true;
		document.addEventListener("keydown", sendCtrl, options);
		document.addEventListener("keyup", sendCtrl, options);
	}
}(document, chrome));
