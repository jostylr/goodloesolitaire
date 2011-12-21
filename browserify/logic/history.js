/*globals $, module, console, require*/

var file = 'logic/history: ';

var gcd;

var a;

var cardutil = require('../utilities/cards');


module.exports = function (gcde, data) {
  gcd = gcde;
  gcd.on("new game requested"    , a["zero history count"]);
  gcd.on("new game requested"    , a["negate oldhand"]);  
  gcd.on("draw cards requested"  , a["increment history count"]);
  gcd.on("score loaded"          , a["process row data"]);
};

a = {
  "zero history count" : function (data) {
    data.historycount = 1;
  },
  "negate oldhand" : function  (data) {
    data.oldhand = false;  //used in cards.js
  },
  "increment history count" : function (data) {
    data.historycount += 1;
  },
  "process row data" : function (data) {
    data.shorthand = cardutil["generate short hand string"](data);
    data.shortcall = cardutil["generate short version of call"](data.call);
    gcd.emit("add history", data); 
  } 
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}