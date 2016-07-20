/*
 * FetLife+ - Event pages (/events/000)
 * --------
 * Add "add to google calendar" button
 */
(function ($, chrome, sync) {
    "use strict";

    $.fn.ignore = function(sel){
        return this.clone().find(sel||">*").remove().end();
    };

    function formatTime(time) {
        time.setMinutes(time.getMinutes() + time.getTimezoneOffset());
        return time.toISOString().replace(/-|:|\.\d\d\d/g,"");
    }

    onSync(function() {
        var title = $("h1[itemprop=name]").text();
        var desc = $("div.long_description").text().trim();


        var venueName = $("div[itemprop=address] span[itemprop=name]").text();
        var eventLink = window.location.toString();
        var address = $("tr td span.db.s").ignore("a").text().trim().replace(".","");
        var addressLocality = $("div[itemprop=address] meta[itemprop=addressLocality]").attr("content");
        var addressRegion = $("div[itemprop=address] meta[itemprop=addressRegion]").attr("content");
        var addressCountry = $("div[itemprop=address] meta[itemprop=addressCountry]").attr("content");
        var location = venueName + ", " + address + ", " + addressLocality + ", " + addressRegion + ", " + addressCountry ;

        var startTime = formatTime(new Date($("meta[itemprop=startDate]").attr("content")));
        var endTime = formatTime(new Date($("meta[itemprop=endDate]").attr("content")));

        var addToCalendarLink = "https://www.google.com/calendar/render?action=TEMPLATE&" +
            "text=" + encodeURIComponent(title) +
            "&dates=" +  startTime +"/" + endTime +
            "&location=" + encodeURIComponent(location) +
            "&sprop=" + encodeURIComponent(eventLink) +
            "&sprop=name:fetlife" +
            "&details=" + encodeURIComponent(desc) +
            "&sf=true&output=xml";

        $("#addToGoogleCalendar").attr("href", addToCalendarLink).text("+gCal");
    });

    $("<a id=\"addToGoogleCalendar\" target=\"_blank\" href=\"\" class=\"xs q tdn\" style=\"margin-left:10px\"></a>").insertAfter("table.list.mbn a.xs.q.tdn");

}($, chrome, sync));
