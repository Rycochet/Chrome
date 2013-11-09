/**
 * FetLife+ - Kinky & Popular
 * --------
 * Fixes to the K&P page
 */

function KandP() {
	this.$bar = $('#navigation_bar > .flexible_container, #header_v2 > .flexible_container');
	this.load();

	var self = this;
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (changes.opt_kandp_width) {
			self.load();
		}
	});
}

KandP.prototype.load = function() {
	chrome.storage.sync.get('opt_kandp_width', function(data) {
		$('#header_v2 > .flexible_container').css('width', (!data.opt_kandp_width ? '' : '950px'));
		$('#notification_counts').css('margin-right', (!data.opt_kandp_width ? '' : '25px'));
	});
}

var kandp = new KandP();
