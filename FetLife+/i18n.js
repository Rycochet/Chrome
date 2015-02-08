(function(document, chrome) {
	"use strict";

	/**
	 * Translate anything that needs it...
	 */
	document.addEventListener("DOMContentLoaded", function() {
		"use strict";
		var i, attr = "data-i18n", elements = document.querySelectorAll("[" + attr + "]");
		for (i = 0; i < elements.length; i++) {
			elements[i][elements[i].tagName === "INPUT" ? "value" : "innerHTML"] = chrome.i18n.getMessage(elements[i].getAttribute(attr));
		}
	});
}(document, chrome));
