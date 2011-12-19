/*globals $, module, console, require*/

var file = 'logic/history: ';

var gcd;

var a;

var cardutil = require('../utilities/cards');


module.exports = function (gcde, data) {
  gcd = gcde;
  gcd.on("new game requested"    , a["zero history count"]);
  gcd.on("draw cards requested"  , a["increment history count"]);
  gcd.on("score loaded"          , a["process row data"]);
};

a = {
  "zero history count" : function (data) {
    data.historyCount = 0;
  }, 
  "increment history count" : function (data) {
    data.historyCount += 1;
  },
  "process row data" : function (data) {
    data.shorthand = cardutil["generate short hand string"](data.hand);
    data.shortcall = cardutil["generate short version of call"](data.call);
    gcd.emit("add history", data); 
  } 
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}