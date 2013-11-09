// Save and load options

function onClick(e){
	console.log('onClick(' + this.id + ' = ' + this.checked + ')');
	var option = {};
	option[this.id] = !this.checked;
	chrome.storage.sync.set(option);
}

function onDebug(e){
	console.log('onDebug(' + this.value + ')');
	var option = {};
	option['debug'] = parseInt(this.value);
	chrome.storage.local.set(option);
}

chrome.storage.sync.get(['opt_messages', 'opt_friends', 'opt_ats', 'opt_notify', 'opt_navigation', 'opt_kandp', 'opt_kandp_width'], function(options) {
	var checkbox = document.querySelectorAll('input[type=checkbox]');
	for(i=0; i<checkbox.length; i++) {
		checkbox[i].checked = !options[checkbox[i].id];
		checkbox[i].addEventListener('click', onClick);
	}
});

chrome.storage.sync.get(['debug'], function(options) {
	var debug = document.querySelector('#debug');
	debug.selectedIndex = options['debug'];
	debug.addEventListener('change', onDebug);
});
