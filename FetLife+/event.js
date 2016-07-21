/*
 * FetLife+ - Event pages (/events/000)
 * --------
 * Add "add to google calendar" button
 */
(function($, chrome, sync) {
	"use strict";

	$.fn.ignore = function(sel) {
		return this.clone().find(sel || ">*").remove().end();
	};

	function formatTime(time) {
		time.setMinutes(time.getMinutes() + time.getTimezoneOffset());
		return time.toISOString().replace(/-|:|\.\d\d\d/g, "");
	}

	onLoaded(function() {
		var title = $("h1[itemprop=name]").text(),
				desc = $("div.long_description").text().trim(),
				eventLink = window.location.toString(),
				address = [
					$("div[itemprop=address] span[itemprop=name]").text(),
					($("tr td span.db.s").ignore("a").text() || "").trim().replace(".", ""),
					$("div[itemprop=address] meta[itemprop=addressLocality]").attr("content"),
					$("div[itemprop=address] meta[itemprop=addressRegion]").attr("content"),
					$("div[itemprop=address] meta[itemprop=addressCountry]").attr("content")
				],
				location = address.filter(function(line) {
					return !!line;
				}).join(", "),
				startDate = new Date($("meta[itemprop=startDate]").attr("content")),
				endDate = new Date($("meta[itemprop=endDate]").attr("content")),
				googleIconLink = "https://calendar.google.com/googlecalendar/images/favicon_v2014_" + startDate.getDate() + ".ico",
				addToCalendarLink = "https://www.google.com/calendar/render?action=TEMPLATE&" +
				"text=" + encodeURIComponent(title) +
				"&dates=" + formatTime(startDate) + "/" + formatTime(endDate) +
				"&location=" + encodeURIComponent(location) +
				"&sprop=" + encodeURIComponent(eventLink) +
				"&sprop=name:fetlife" +
				"&details=" + encodeURIComponent(desc) +
				"&sf=true&output=xml";

		$("<a target=\"_blank\" href=\"" + addToCalendarLink + "\" class=\"xs q tdn\" style=\"margin-left:10px\">"
				+ "<img src=\"" + googleIconLink + "\" title=\"" + chrome.i18n.getMessage("addToGoogleCalendar") + "\" alt=\"+gCal\" style=\"height:1.5em;background:none;float:left;padding:0 0.4em 0 0;\">"
				+ "</a>")
				.appendTo("table.list.mbn .db>.l");
	});

}($, chrome, sync));
