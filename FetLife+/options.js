/*jslint browser: true, plusplus: true, regexp: true, white: true, unparam: true */
/*global chrome, jQuery, fetlife */

(function($, document, fetlife) {
	"use strict";

	/**
	 * Click handler
	 * @param {event} event
	 */
	function onClick(event) {
		var option = {};
		option[event.data] = $(event.target).prop("checked");
		fetlife.set(option);
	}

	fetlife.setOptions = function() {
		var i;
		for (i in fetlife) {
			if (fetlife.hasOwnProperty(i)) {
				$("#" + i)
						.on("click", null, i, onClick)
						.prop("checked", fetlife[i]);
			}
		}
	};

	$(document).on("init sync", fetlife.setOptions.bind(fetlife));

}(jQuery, document, fetlife));