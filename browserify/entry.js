/*global $, console, submitScore, require, process*/

var events = require('events');

gcd = new events.EventEmitter(); 


//require('./utilities/debugging')(gcd);
require('eventingfunctions/inventory')(gcd, true);

/*
gcd.emit = (function (gcd) {
  var _emit = gcd.emit;
  var self = gcd;
  return function () {
    var args = arguments;
    process.nextTick(function () {_emit.apply(self, args);});
  };
}(gcd));
*/

var data = gcd.data;

//$ = function (arg) {arg();};

console.log("running");



require('./logic/gamecontrol'  )(gcd);
require('./logic/history'      )(gcd);
require('./logic/hand'         )(gcd);
require('./logic/scores'       )(gcd);

require('./ui/gamecontrol'    )(gcd);
require('./ui/history'        )(gcd);
require('./ui/hand'           )(gcd);
require('./ui/scores'         )(gcd);

require('./events.js')(gcd);

$(function() { 
  gcd.emit("ready");
});



  




