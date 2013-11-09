/**
 * FetLife+ - All pages
 * --------
 * Change main navigation bar.
 *
 * Make the .longer links into Picto links.
 * Optionally use the .longer links rather than the .shorter ones.
 * Optionally hide the K&P button.
 *
 * TODO: User-editable menu items, perhaps link to bookmarks?
 */

function Navigation() {
	this.$bar = $('#navigation_bar ul.sections, #header_v2 ul.sections');
	this.$shorter = $('li.shorter', this.$bar);
	this.$longer = $('li.longer', this.$bar);
	this.$kandp = $('li:first a', this.$bar);
	this.createLinks();
	this.load();

	var self = this;
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (changes.opt_navigation || changes.opt_kandp) {
			self.load();
		}
	});
}

Navigation.prototype.picto = {
	'/groups': 'g',
	'/places': 'G',
	'/events/all': '\\',
	'/fetishes': 'Y',
	'/posts/everyone': 'W',
	'/videos/all': 'V'
};

Navigation.prototype.createLinks = function() {
	var self = this;
	$('a', this.$longer).each(function() {
		var $this = $(this);
		$this.attr('title', $this.text());
		$this.css('font-size', '1.5em');
		$this.addClass('picto');
		$this.text(self.picto[$this.attr('href')]);
	});
}

Navigation.prototype.load = function() {
	var self = this;
	chrome.storage.sync.get(['opt_navigation', 'opt_kandp'], function(data) {
		self.$shorter.toggle(data.opt_navigation);
		self.$longer.toggle(!data.opt_navigation);
		self.$kandp.toggle(!data.opt_kandp);
	});
}

var navigation = new Navigation();
