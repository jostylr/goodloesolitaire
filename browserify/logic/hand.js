/*globals $, module, console*/

var file = 'logic/hand: ';

var a;

module.exports = function (gcd) {

  gcd.install(file, a);
  
};

a = {
  'reset hand state' : function () {
    return { $set: { state : 'newhand' } };
  },
  "end the game" : function () {
    return { $$emit : "end game requested" };
  },
  "note new hand" : function () {
    return { $set: { newhand : true } };
  },
  "note old hand" : function () {
    return { $set : { newhand : false } };
  },
  "check for a hail call" : [ [ "newhand", "drawcount" ], 
    function  (newhand, count) {
      var build = { $$emit : [ ] };
      var em = build.$$emit;
      if (count === 4) {
        if (newhand) {
          em.push("miagan");
        } else {
          em.push('hail mia');
        }
      } else if (count === 5) {
        if (newhand) {
          em.push("mulligan");
        } else {
          em.push('hail mary');
        }      
      }
      em.push("hail call checked");
      return(build);
    }
  ],
  "check for cards left" : [ [ "cardsleft" ], 
    function (cardsleft) {
      if (cardsleft <= 0) {
        return { $$emit : "no cards left to draw" };
      }
    }
  ]
  
  
};
