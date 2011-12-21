/*global $, console, submitScore, require*/

var events = require('events');

var gcd = new events.EventEmitter(); 

var data = {};

require('./debugging')(gcd);

//$ = function (arg) {arg();};

console.log("running");



require('./logic/gamecontrol'  )(gcd, data);
require('./logic/history'      )(gcd, data);
require('./logic/hand'         )(gcd, data);
require('./logic/scores'       )(gcd, data);

require('./ui/gamecontrol'    )(gcd, data);
require('./ui/history'        )(gcd, data);
require('./ui/hand'           )(gcd, data);
require('./ui/scores'         )(gcd, data);


$(function() { 
  gcd.emit("ready", data);
});



  




