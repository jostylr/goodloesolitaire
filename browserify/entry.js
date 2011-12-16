/*global $, console, submitScore, require */

var events = require('events');

var gcd = new events.EventEmitter(); 
var ui = new events.EventEmitter();

require('./logic/history')(gcd, ui);
require('./ui/history')(gcd, ui);


$(function() {
	
		
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
	

	


	
	var state; //for hail call
	
	commands = {






}); //end ready function 
