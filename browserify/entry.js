/*global $, console, submitScore, require*/

var events = require('events');

var gcd = new events.EventEmitter(); 


require('./utilities/debugging')(gcd);
require('./utilities/inventory')(gcd, true);

var data = gcd.data;

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

require('./events.js')(gcd);

$(function() { 
  gcd.emit("ready", data);
});



  




