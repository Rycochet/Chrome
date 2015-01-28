/*
 * Listen for the Ctrl key (Command on Mac) and remember it's pressed state.
 * 
 * IMPORTANT: This requires additional permission to run. The permission can
 * also be used to give full access to *everything*, so if you're not sure
 * what's going on then DO NOT ALLOW IT.
 * 
 * This is the source code for "Tabs to the Front" -
 * https://chrome.google.com/webstore/detail/tabs-to-the-front/hiembaoomcehoiehhdldabfgnmphappc
 */

function sendCtrl(event) {
	chrome.storage.local.set({
		ctrl: event.ctrlKey
	});
}

// Listen for the two keypress events, the "true" on the end means we're grabbing
// them before anything else can interrupt them...
window.addEventListener("keydown", sendCtrl, true);
window.addEventListener("keyup", sendCtrl, true);
