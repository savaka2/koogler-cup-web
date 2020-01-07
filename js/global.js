'use strict';

const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1;
const mqStandalone = window.matchMedia('(display-mode: standalone)');

/*
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('serviceWorker.js');
	});
}
*/

$(document).ready(function() {
	// tell desktop from mobile for hover
	watchForHover();
	// never keep buttons focused
	$('button').on('click', function(e) {
		$(this).blur();
	});
	// three ways to close a modal
	$('#modalShade').on('click', function(e) {
		if ($(e.target).is($(this))) {closeModal();}
	});
	$('.modalClose').on('click', function(e) {
		closeModal();
	});
	$(document).on('keydown', function(e) {
		if (e.which == 27) {closeModal();}
	});
	// close toast on click
	$('body').on('click', '.toast', function(e) {
		$(this).remove();
	});
	// use expand links
	$('body').on('click', '.expandLink', function(e) {
		let hidden = $(this).parents($(this).attr('data-container-selector')).find('.hidden');
		if (hidden.is(':visible')) {
			hidden.slideUp(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-down"></i> ' + $(this).attr('data-default-text'));
		} else {
			hidden.slideDown(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-up"></i> ' + $(this).attr('data-shown-text'));
		}
	});
});

function openModal(selector, callback) {
	// close any expandables in modal
	$(selector).find('.expandLink').each(function() {
		$(this).html('<i class="fas fa-chevron-down"></i> ' + $(this).attr('data-default-text'));
	});
	$(selector).find('.hidden').hide();
	
	if ($('.modal:visible').length > 0) {
		closeModal(function() {openModalInternal(selector, callback)}, true);
	} else {
		openModalInternal(selector, callback)
	}
}

function openModalInternal(selector, callback) {
	$('#modalShade').fadeIn(uiAnimTime);
	$(selector).css('opacity', 0).slideDown(uiAnimTime).animate({opacity: 1}, {
		queue: false,
		duration: uiAnimTime
	});
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function closeModal(callback, noUndim) {
	if (!noUndim) {$('#modalShade:visible').fadeOut(uiAnimTime);}
	$('.modal:visible').slideUp(uiAnimTime).animate({opacity: 0}, {
		queue: false,
		duration: uiAnimTime
	});
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function toast(message, toastTime) {
	if ($('.toast').length > 0) {
		$('.toast').remove();
	}
	let popup = $('<div></div>').html(message).addClass('toast');
	$('body').append(popup);
	popup.fadeIn(animTime, function() {
		setTimeout(function() {
			popup.fadeOut(animTime, function() {
				popup.remove();
			});
		}, toastTime);
	});
}

function generateExpandLink(defaultText, shownText, containerSelector) {
	return $('<a href="javascript:void(0)"></a>').html('<i class="fas fa-chevron-down"></i> ' + defaultText).addClass('expandLink').attr('data-container-selector', containerSelector).attr('data-default-text', defaultText).attr('data-shown-text', shownText);
}

// local storage

function lsGet(key, fallback) {
	if (window.localStorage) {
		let item = localStorage.getItem('kcs_' + key);
		if (typeof item == 'string') {
			return item;
		} else {
			return fallback.toString();
		}
	} else {
		console.log('lsGet failed because localStorage is not available');
		return fallback.toString();
	}
}

function lsSet(key, value) {
	if (window.localStorage) {
		localStorage.setItem('kcs_' + key, value.toString());
	} else {
		console.log('lsSet failed because localStorage is not available');
	}
}

// if currentVer > storedVer
function isNewerVer(currentVer, storedVer) {
	let currentArr = splitVer(currentVer);
	let storedArr = splitVer(storedVer);
	for (let i in currentArr) {
		let storedNum = 0;
		if (typeof storedArr[i] == 'number') {storedNum = storedArr[i];} 
		if (currentArr[i] > storedNum) {
			return true;
		} else if (currentArr[i] < storedNum) {
			return false;
		}
	}
	return false;
}

// split by . and cast to number
function splitVer(ver) {
	let verArr = ver.split('.');
	verArr.forEach(function(str, i) {
		verArr[i] = Number(str);
	});
	return verArr;
}

function asBoolean(string) {
	return string.toLowerCase() == 'true';
}

function logUsage(type, text) {
	if (window.location.protocol != 'file:' && !asBoolean(lsGet('nonstandardUsage', 'false'))) {
		let userAgent = navigator.userAgent;
		let viewportWidth = window.innerWidth;
		let displayType;
		if (viewportWidth >= 1024) {
			displayType = 'Large';
		} else if (viewportWidth >= 481) {
			displayType = 'Medium';
		} else {
			displayType = 'Small';
		}
		let pwaStatus = mqStandalone.matches ? 'Yes' : 'No';
		$.ajax({
			url: window.atob('aHR0cHM6Ly9tYWtlci5pZnR0dC5jb20vdHJpZ2dlci9rY3NfbG9nL3dpdGgva2V5L2NhYlAwd0EydlM2WVRERGtadkxrR0g='),
			data: {
				value1: type + ',' + displayType + ',' + pwaStatus + ',' + version,
				value2: text,
				value3: userAgent
			},
			type: 'post'
		});
	}
}