/*
 * FetLife+ - User pages (/users/0000000)
 * --------
 * Recognise when someone has been blocked.
 */
(function(window, $, chrome, sync) {
	onLoaded(function() {
		var user = window.location.pathname.match(/[0-9]+/)[0],
				isBlocked = !$("a[data-opens-modal='block']").length;

		if (isBlocked) {
			sync.blocked[user] = true;
		} else {
			delete sync.blocked[user];
		}
		chrome.storage.sync.set({
			blocked: sync.blocked
		});
	});
}(window, $, chrome, sync));
