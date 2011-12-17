/*global $, console, submitScore, require */

var events = require('events');

var gcd = new events.EventEmitter(); 
var ui = new events.EventEmitter();

/*
var eventdebugger = function (evem) {
	var _emit = evem.emit;
	evem.emit = function () {
		console.log(JSON.stringify(arguments));
		_emit.apply(this, arguments);
	};
};

eventdebugger(gcd);
eventdebugger(ui);

$ = function (arg) {arg();};

console.log("running");
*/


require('./logic/history')(gcd, ui);
require('./ui/history')(gcd, ui);


$(function() { 
	ui.emit("ready");
	gcd.emit("ready");

});



/*		
	var uid = '0'; //set by server
	var gid = '0'; //set by server
	var type = 'basic'; //toggle options
	var scoredata = [];
	var name = false;
	var oldHighScores = false;
	
  var commands;
	
	var akeys; 
	
	//initial hiding
	$("#endgame").hide(); 
	
	//!!!! fading
	var fadelevel = 0.4;

	//initial screen faded
	$(".main").fadeTo(100, fadelevel);
*/

	


	
	var state; //for hail call




