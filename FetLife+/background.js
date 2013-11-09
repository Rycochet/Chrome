// Chrome FetLife icon including unread pm count...

const INFO = 1;
const LOG = 2;
const WARN = 3;
const ERROR = 4;

function plural(n) {
	return n == 1 ? '' : 's';
}

function twoDigits(num) {
	return (num < 10 ? '0' : '') + num;
}

function debug(level, txt /*, obj, array etc*/) {
	var args = Array.prototype.slice.call(arguments);
	var level = args.shift();
	chrome.storage.local.get('debug', function(items) {
		if (items.debug && parseInt(items.debug) >= level) {
			var now = new Date();
			if (typeof args[0] !== 'string' && typeof args[0] !== 'number') { // If we want to pass a single object for inspection
				args.unshift('');
			}
			args.unshift('[' + now.getHours() + ':' + twoDigits(now.getMinutes()) + ':' + twoDigits(now.getSeconds()) + ']');
			console.log.apply(console, args);
		}
	});
}

function notify(title, count, content, url) {
	chrome.storage.sync.get('opt_notify', function(options) {
		if (!options.opt_notify && count > 0) {
			var notification = webkitNotifications.createNotification('icon48.png', title, 'You have ' + count + ' new ' + content + plural(count) + '...');
			notification.show();
			window.setTimeout(function(){notification.cancel();}, 10000);
		}
	});
}

function Badge() {
	this._timerId = 0;
	this._frame = 0;
	this._left = -1;
	this._right = -1;

	var self = this;
	chrome.storage.onChanged.addListener(function(changes, areaName) {
		debug(LOG, 'onChanged(' + JSON.stringify(changes) + ', "' + areaName + '");');
		self.update();
	});
}

Badge.prototype.isStarted = function() {
	return this._timerId !== 0;
}

Badge.prototype.start = function() {
	if (!this.isStarted()) {
		var self = this;
		this._timerId = window.setInterval(function() {
			chrome.browserAction.setBadgeText({text: '   ....     '.substr(self._frame++ % 8, 4)});
		}, 100);
	}
}

Badge.prototype.stop = function(update) {
	if (this.isStarted()) {
		window.clearInterval(this._timerId);
		this._timerId = 0;
	}
	this.update();
}

Badge.prototype.set = function(left, right) {
	if (left !== this._left || right !== this._right) {
		this.stop();
		chrome.browserAction.setBadgeText({text: (
			(left > 0 ? (left < 100 ? left : '99') + '/' : '') +
			(left > 0 || right > 0 ? right : '')
		)});
		this._left = left;
		this._right = right;
	}
}

Badge.prototype.update = function() {
	chrome.storage.sync.get(['opt_updates', 'opt_messages', 'opt_friends', 'opt_ats', 'opt_colour'], function(options) {
		chrome.storage.local.get(['updates', 'messages', 'friends', 'ats'], function(items) {
			debug(LOG, 'Badge.update();');
			var updates = parseInt(!options.opt_updates ? items.updates : 0);
			var total = (!options.opt_messages ? items.messages : 0) + (!options.opt_friends ? items.friends : 0) + (!options.opt_ats ? items.ats : 0);
			badge.set(updates, total);
			chrome.browserAction.setTitle({title: total ? ('Inbox: ' + (items.messages || 0) + ', Friends: ' + (items.friends || 0) + ', @You: ' + (items.ats || 0)) : 'No updates...'});
			if (!options.opt_colour) {
				if (items.messages > 0) {
					chrome.browserAction.setBadgeBackgroundColor({color: '#FF0000'}); // red
				} else if (items.friends > 0) {
					chrome.browserAction.setBadgeBackgroundColor({color: '#FF00FF'}); // purple
				} else {
					chrome.browserAction.setBadgeBackgroundColor({color: '#00FF00'}); // green
				}
			}
		});
	});
}

var badge = new Badge();

function FetLife() {
}

FetLife.prototype.getCounts = function() {
	var XMLHttpReq = new XMLHttpRequest();
	var abortTimerId = window.setTimeout(function() {
		debug(WARN, 'FetLife.getCounts(); TIMEOUT');
		XMLHttpReq.abort();
	}, 2000);
	XMLHttpReq.open('GET', 'https://fetlife.com/polling/counts?fetch=friendship_requests%2Cnew_messages%2Cats', true);
	XMLHttpReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	XMLHttpReq.onreadystatechange = function() {
		if (XMLHttpReq.readyState != 4) {
			return;
		}
		window.clearTimeout(abortTimerId);
		debug(LOG, 'FetLife.getCounts();');
		var counts = JSON.parse(XMLHttpReq.responseText);
		chrome.storage.local.get(['friends', 'messages', 'ats'], function(items) {
			var friends = parseInt(counts.friendship_requests);
			var messages = parseInt(counts.new_messages);
			var ats = parseInt(counts.ats);
			notify('Friendship Requests', friends - items.friends, 'friendship request');
			notify('Inbox', messages - items.messages, 'unread message');
			notify('@You', ats - items.ats, '@You update');
			chrome.storage.local.set({friends: friends, messages: messages, ats: ats});
		});
	}
	XMLHttpReq.send(null);
}

var fetlife = new FetLife();

FetLife.prototype.getNews = function() {
// https://fetlife.com/polling/home/new_stories_v4?subfeed=everything + &marker=xyz
/*
last_event_uuid: null
marker_head: "0004dc26-72a8-8f1b-33cd-9784184f4e55"
no_more_stories: null
show_cta: null
stale: null
stories: []
*/
	chrome.storage.local.get(['marker', 'stories'], function(items) {
		var XMLHttpReq = new XMLHttpRequest();
		var abortTimerId = window.setTimeout(function() {
			debug(WARN, 'FetLife.getNews(); TIMEOUT');
			XMLHttpReq.abort();
		}, 2000);
		XMLHttpReq.open('GET', (items.marker ? 'https://fetlife.com/polling/home/new_stories_v4?subfeed=everything&marker=' + items.marker : 'https://fetlife.com/home/v4_stories.json?subfeed=everything'), true);
		XMLHttpReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		XMLHttpReq.onreadystatechange = function() {
			if (XMLHttpReq.readyState != 4) {
				return;
			}
			window.clearTimeout(abortTimerId);
			debug(LOG, 'FetLife.getNews();');
			var reply = JSON.parse(XMLHttpReq.responseText);
			if (reply.no_more_stories === false) { // Start reading stuff
				chrome.storage.local.set({marker:reply.marker_head, stories:[], updates:0});
			} else {
				var stories = items.stories || [];
				stories.unshift.apply(stories, reply.stories);
				chrome.storage.local.set({marker_head:reply.marker_head, stories:reply.stories, updates:reply.stories.length});
			}
		}
		XMLHttpReq.send(null);
	});
}

function checkLogin(onAlarm) {
	chrome.cookies.get({url: 'https://fetlife.com/', name: '_fl_sessionid'}, function(cookie) {
		if (!cookie) {
			badge.start();
		} else {
			badge.stop();
			fetlife.getCounts();
//			fetlife.getNews();
		}
	});
}

function isFeedShown() {
//	debug(LOG, 'isFeedShown();');
	chrome.tabs.query({url: 'https://fetlife.com/home/v4*'}, function(tabs) {
		if (!tabs.length) {
			chrome.storage.local.set({updates: 0});
		}
	});
}

chrome.runtime.onInstalled.addListener(function() {
	debug(LOG, 'onInstalled();');
	chrome.storage.local.set({updates: 0, marker_head: null /*, friends: 0, messages: 0, ats: 0*/});
	checkLogin();
});

chrome.runtime.onStartup.addListener(function() {
	debug(LOG, 'onStartup();');
	isFeedShown();
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
//	debug(LOG, 'onRemoved(' + tabId + ', ' + JSON.stringify(removeInfo) + ');');
	isFeedShown();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete') {
//		debug(LOG, 'onUpdated(' + tabId + ', ' + JSON.stringify(changeInfo) + ', ' + JSON.stringify(tab) + ');');
		isFeedShown();
	}
});

/*
chrome.webRequest.onCompleted.addListener(function(details) {
	debug(LOG, details);
}, {urls: ['https://fetlife.com/polling/home/new_stories_v4*']});
*/

chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm.name == 'counts') {
		debug(LOG, 'onAlarm();');
		checkLogin();
	}
});

chrome.alarms.create('counts', {periodInMinutes: 1});
