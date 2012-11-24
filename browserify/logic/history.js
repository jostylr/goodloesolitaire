/*globals $, module, console, require*/

var file = 'logic/history: ';



var a;

var cardutil = require('../utilities/cards');


module.exports = function (gcd) {
  gcd.install(file, a);  
};

a = {
  "zero history count" : function () {
    return {$set : { historycount : 1 } };
  },
  "negate oldhand" : function  () {
    return {$set : { oldhand : false, oldcall: false } }; // used in cards.js
  },
  "increment history count" : function () {
    return {$inc : { historycount : 1} };
  },
  "process row data" : [["hand", "oldhand", "call"],
    function (hand, oldhand, call) {
      var handdata = cardutil["generate short hand string"](hand, oldhand);
      return {$set : {
          oldhand: handdata[1],
          shorthand: handdata[0], 
          shortcall: cardutil["generate short version of call"](call)
        }, 
        $$emit: ["add history"]
      };
    }
  ] 
};
