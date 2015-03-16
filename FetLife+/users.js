/*
 * FetLife+ - User pages (/users/0000000)
 * --------
 * Recognise when someone has been blocked.
 */
(function(window, $, chrome, sync) {
	if (/^\/users\/[0-9]+(#.*)?$/.test(location.pathname)) {
		onLoaded(function() {
			var user = window.location.pathname.match(/[0-9]+/)[0],
					isBlocked = !!$("a[data-opens-modal='unblock']").length;

			if (isBlocked) {
				sync.blocked[user] = $("h2.bottom").contents()[0].textContent.trim();
			} else {
				delete sync.blocked[user];
			}
			chrome.storage.sync.set({
				blocked: sync.blocked
			});
		});
	}
}(window, $, chrome, sync));
