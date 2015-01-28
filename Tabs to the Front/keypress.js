/*
 * Listen for the Ctrl key (Command on Mac) and remember it's pressed state
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
