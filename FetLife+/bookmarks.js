/**
 * FetLife+ - All pages
 * --------
 * Add Bookmarks menu.
 *
 * Add/remove bookmark when first option clicked.
 * Use Picto icons for all types.
 * Store as {bookmarks: [ {path: "name"}, {...} ]}
 * TODO: Bookmark editor
 * TODO: Nested Bookmarks
 * TODO: Separator Bars
 *
 * TODO: Correct the FetLife coders on the spelling of "separate"... :-P
 */

function Bookmarks() {
	this.$icon = $();
	this.$list = $();
	this.open = false;
	this.bookmarks = [];

	this.createMenu();
	this.load();

	var self = this;
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (changes.bookmarks) {
			self.load();
		}
	});
}

Bookmarks.prototype.title = new RegExp('\\(\\d\\) |\\(\\d//\\d\\) | - FetLife| - Kinksters', 'gi');
Bookmarks.prototype.allow = {
	'v': new RegExp('/users/\\d+/pictures(|/\\d+)', 'i'),
	'V': new RegExp('/users/\\d+/videos(|/\\d+)', 'i'),
	'W': new RegExp('/users/\\d+/posts(|/\\d+)', 'i'),
	'U': new RegExp('/users/\\d+', 'i'),
	'g': new RegExp('/groups/\\d+', 'i'),
	'\\': new RegExp('/events/\\d+', 'i'),
	'G': new RegExp('/administrative_areas(|/\\d+)', 'i'),
	'Y': new RegExp('/fetishes/\\d+', 'i'),
	'H': new RegExp('/home/v4', 'i')
//	'S': new RegExp('.*', 'i')
};

Bookmarks.prototype.save = function() {
	chrome.storage.sync.set({bookmarks: this.bookmarks});
}

Bookmarks.prototype.load = function() {
	var self = this;
	chrome.storage.sync.get('bookmarks', function(data) {
		self.bookmarks = data.bookmarks || [];
		self.createList();
	});
}

Bookmarks.prototype.addBookmark = function(path, title) {
	var data = {};
	data[path] = title;
	this.bookmarks.push(data);
	this.save();
}

Bookmarks.prototype.removeBookmark = function(path) {
	for (var i = 0; i<this.bookmarks.length ; i++) {
		if (this.bookmarks[i][path]) {
			this.bookmarks.splice(i, 1);
			this.save();
			return;
		}
	}
}

Bookmarks.prototype.getBookmark = function() {
	var path = document.location.pathname;
	for (var i = 0; i<this.bookmarks.length ; i++) {
		if (this.bookmarks[i][path]) {
			return this.bookmarks[i][path];
		}
	}
	return null;
}

Bookmarks.prototype.isBookmark = function() {
	return this.getBookmark() !== null;
}

Bookmarks.prototype.getPicto = function(path) {
	for (allow in this.allow) {
		if (this.allow.hasOwnProperty(allow) && typeof(allow) !== 'function') {
			if (this.allow[allow].test(path)) {
				return allow;
			}
		}
	}
	return null;
}

Bookmarks.prototype.canBookmark = function() {
	return this.getPicto(document.location.pathname) !== null;
}

Bookmarks.prototype.createMenu = function() {
	var $outer = $('<ul id="nav_dropdown" class="horizontal profile" style="margin:0;"></ul>');
	var $inner = $('<li></li>');
	this.$icon = $('<a href="#" class="rcts"><span class="picto">l</span></a>');
	this.$list = $('<ul class="vertical rcbs" style="display:none;z-index:10;"></ul>');
	$inner.append(this.$icon, this.$list);
	$outer.append($inner);
	$('form.global_search').next().after($outer);

	var self = this;
	$(document).click(function(event){
		var eatMe = $(event.target).closest(self.$icon).length === 0;
		if (!eatMe && !self.open) {
			self.$list.show();
			self.open = true;
		} else {
			self.$list.hide();
			self.open = false;
		}
		return eatMe;
	});
}

Bookmarks.prototype.createChoice = function(href, picto, title, seperator) {
	var $anchor = $('<a href="' + href + '" title="' + title + '"><span class="picto">' + picto + '</span>' + title + '</a>');
	this.$list.append($('<li' + (seperator ? ' class="seperator"' : '') + ' style="overflow:hidden;white-space:nowrap;"></li>').append($anchor));
	return $anchor;
}

Bookmarks.prototype.createList = function() {
	var self = this;
	this.$list.hide();
	this.$list.empty();
	this.open = false;
	if (this.isBookmark()) {
		this.createChoice('#', 'S', 'Remove bookmark', true).click(function(event) {
			if (confirm('Are you sure you wish to remove:\n"' + self.getBookmark() + '"?')) {
//				console.log('Remove bookmark: ' + document.location.pathname);
				self.removeBookmark(document.location.pathname);
			}
			return false;
		});
	} else if (this.canBookmark()) {
		this.createChoice('#', 'S', 'Bookmark this page', true).click(function(event) {
			var title = prompt('Please enter a title', document.title.replace(self.title, ''));
			if (title != null && title != '') {
//				console.log('Add bookmark: ' + document.location.pathname + ' = ' + document.title.replace(self.title, ''));
				self.addBookmark(document.location.pathname, title);
			}
			return false;
		});
	} else if (this.bookmarks.length === 0) {
		this.createChoice('#', 'd', 'No bookmarks', true).click(function(event) {
			return false;
		});
	}
	for (var i = 0; i<this.bookmarks.length ; i++) {
		for (first in this.bookmarks[i]) {
			if (this.bookmarks[i].hasOwnProperty(first) && typeof(first) !== 'function') {
				this.createChoice(first, this.getPicto(first), this.bookmarks[i][first], i === 0);
				break;
			}
		}
	}
/*
	this.createChoice('#', 'U', 'Profile', true);
	this.createChoice('#', 'V', 'Video');
	this.createChoice('#', 'W', 'Notes');
	this.createChoice('#', 'v', 'Picture');
	this.createChoice('#', 'G', 'Place');
	this.createChoice('#', '\\', 'Event');
	this.createChoice('#', 'g', 'Group');
	this.createChoice('#', 'Y', 'Fetish');
	this.createChoice('#', 'S', 'Unknown');
*/
}

var bookmarks = new Bookmarks();
