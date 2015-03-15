/*
 * FetLife+ - User pages (/users/000) and group posts (/groups/000/group_posts/000)
 * --------
 * Recognise when someone has been blocked.
 */
(function($, chrome, sync) {
	onLoaded(function() {
		var replace = sync.block_action === "replace",
				hide = sync.block_action === "hide",
				blockedText = chrome.i18n.getMessage("blockedText");

		if (replace || hide) {
			$(".comment,.wall_post").each(function() {
				var $this = $(this),
						user = $this.find("a[href^='/users/']").attr("href").match(/[0-9]+/)[0],
						isBlocked = !!sync.blocked[user];

				if (isBlocked) {
					if (hide) {
						$this.toggle(!isBlocked);
					} else {
						$this.children().toggle(!isBlocked);
						$("<a style=\"cursor:pointer;\"><em>" + blockedText + "</em></a>").prependTo(this).on("click", function() {
							$(this).nextAll().toggle();
						});
					}
				}
			});
		}
	});
}($, chrome, sync));
