/*global $, console, submitScore, require */

var events = require('events');

var gcd = new events.EventEmitter(); 

var data = {};


var eventdebugger = function (evem) {
  var _emit = evem.emit;
  evem.emit = function (ev, data) {
    console.log(ev, JSON.stringify(data));
    var list = evem.listeners(ev);
    console.log("list"+list)
    var i, n; 
    for (i = 0; i < n; i += 1) {
      if (list[i].hasOwnProperty("desc")) {
        console.log("listener: ", list[i].desc);
      } else {
        console.log("listener with no description");
      }
    }
    _emit.apply(this, arguments);
  };
};

eventdebugger(gcd);

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
  console.log("hi")
  gcd.emit("ready", data);
});



  




