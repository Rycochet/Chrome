(function($, document, window, chrome, globalSync) {
	"use strict";

	var sync = {};

	/**
	 * Save data to sync storage
	 */
	function save() {
		chrome.storage.sync.set(sync);
		close();
	}

	/**
	 * Close options window
	 */
	function close() {
		window.close();
	}

	/**
	 * Click handler
	 * @param {event} event
	 */
	function onClick(event) {
		sync[event.data] = $(event.target).prop("checked");
	}

	/**
	 * Select handler
	 * @param {event} event
	 */
	function onSelect(event) {
		console.log("on change", $(event.target).val())
		sync[event.data] = $(event.target).val();
	}

	/**
	 * Update local sync data
	 */
	function update() {
		for (var index in globalSync) {
			sync[index] = globalSync[index];
			$("input#opt_" + index)
					.on("click", null, index, onClick)
					.prop("checked", sync[index]);
		}
		$("#opt_kandp_default")
				.on("change", null, "kandp_default", onSelect)
				.val(sync.kandp_default);
	}

	onSync(update);

	/**
	 * Setup all click handlers and start the text update
	 */
	document.addEventListener("DOMContentLoaded", function() {
		$("#button_ok").on("click", save);
		$("#button_cancel").on("click", close);
		update();
	});

}(jQuery, document, window, chrome, sync));
