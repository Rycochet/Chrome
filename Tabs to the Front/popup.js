(function() {
	var timer, enable, times = [
		["Enable", 0],
		["Disable for 5 minutes", 5 * 60000],
		["Disable for 15 minutes", 15 * 60000],
		["Disable for 30 minutes", 30 * 60000],
		["Disable for 1 hour", 60 * 60000],
		["Disable permanently", -1]
	];

	function onClick() {
		var i = this;
		localStorage.setItem('front', i > 0 ? Date.now() + i : i);
		window.close();
	}

	function updateTime() {
		var time = parseInt(localStorage.getItem("front") || 0), now = Date.now(), sec;
		if (time === -1) {
			timer.nodeValue = "Disabled";
		} else if (time > now) {
			time = Math.floor((time - now) / 1000);
			sec = time % 60;
			timer.nodeValue = "Disabled for " + Math.floor(time / 60) + ":" + (sec < 10 ? "0" : "") + sec + "";
			window.setTimeout(updateTime, 1000);
		} else {
			if (enable) {
				enable.parentNode.removeChild(enable.nextSibling);
				enable.parentNode.removeChild(enable);
				enable = null;
			}
			timer.nodeValue = "Enabled";
		}
	}

	document.addEventListener("DOMContentLoaded", function() {
		var i, el, body = document.body, time = parseInt(localStorage.getItem("front") || 0), now = Date.now();
		timer = null;
		el = body.appendChild(document.createElement("H1"));
		el.appendChild(document.createTextNode("Tabs to the Front"));
		el = body.appendChild(document.createElement("SPAN"));
		timer = el.appendChild(document.createTextNode(""));
		updateTime();
		body.appendChild(document.createElement("HR"));
		for (i = 0; i < times.length; i++) {
			if (i || (time === -1 || time > now)) {
				el = body.appendChild(document.createElement("A"));
				el.appendChild(document.createTextNode(times[i][0]));
				el.addEventListener("click", onClick.bind(times[i][1]));
				if (!i) {
					enable = el;
					body.appendChild(document.createElement("HR"));
				}
			}
		}
	});
}());