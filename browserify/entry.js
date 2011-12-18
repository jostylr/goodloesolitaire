/*global $, console, submitScore, require */

var events = require('events');

var gcd = new events.EventEmitter(); 
var ui = new events.EventEmitter();

var data = {};

/*
var eventdebugger = function (evem) {
	var _emit = evem.emit;
	evem.emit = function (ev, arg) {
		console.log(ev, JSON.stringify(arg));
		_emit.apply(this, arguments);
		var list = evem.listeners(ev);
		for (i = 0; i < n; i += 1) {
			if (list[i].hasOwnProperty("desc")) {
				console.log("listener", list[i].desc);
			} else {
				console.log("listener with no description");
			}
		}
	};
};

eventdebugger(gcd);
eventdebugger(ui);

$ = function (arg) {arg();};

console.log("running");
*/


require('./logic/history')(gcd, ui, data);
require('./ui/history')(gcd, ui, data);


$(function() { 
	ui.emit("ready");
	gcd.emit("ready");

});



	




