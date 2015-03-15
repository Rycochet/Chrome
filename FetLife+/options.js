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
//		console.log("on change", $(event.target).val())
		sync[event.data] = $(event.target).val();
	}

	/**
	 * Toggle the menu / toggle item and hide the menu section if needed
	 */
	function toggleMenu() {
		sync.toggle = !$("#opt_toggle").prop("checked");
	}

	/**
	 * Update local sync data
	 */
	function update() {
		for (var index in globalSync) {
			sync[index] = globalSync[index];
			$("input[checkbox]#opt_" + index)
					.on("click", null, index, onClick)
					.prop("checked", sync[index]);
		}
		$("#opt_toggle")
				.on("change", toggleMenu)
				.prop("checked", !sync.toggle);
		$("#opt_toggle2")
				.on("change", toggleMenu)
				.prop("checked", sync.toggle);
		$("#opt_kandp_default")
				.on("change", null, "kandp_default", onSelect)
				.val(sync.kandp_default);
		$("#opt_blocked_action")
				.on("change", null, "block_action", onSelect)
				.val(sync.block_action);
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
