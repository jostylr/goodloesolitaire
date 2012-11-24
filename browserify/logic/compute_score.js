/*globals $, module, console, require*/

var file = 'logic/compute_score: ';

var gcd;

var a;

var scoring, types;

module.exports = function (gcde) {
  gcd = gcde;
  gcd.install(file, a);  
};

a = {
  "compute score" : [["call", "type", "diff", "typedata"], 
    function me (call, type, diff, data) {
      gcd.ret({$set : scoring[type](call, diff, data), $$emit: "score computed"}, me.desc);
    }
  ],

  "load type" : [["type", "wilds"],
    function me (type, wilds) {
      type = type || "basic";
      wilds = wilds || "yes";
      var typedata = types[type];
      gcd.ret({$set : {type : type, wilds : wilds, typedata : typedata}, $$emit : "type loaded"}, me.desc);
    }
  ]
  
};



types = {
  "basic" : {streak: 0, score: 0, level : 0, delta:0}

};

//scoring functions take in a diff and a game. mainly diff
//diff is of the form [type of diff, level change]
scoring = {
  "basic" : function (call, diff, data) {
    var streak = data.streak;
    var delta = 0;
    var lvl = 0;
    //no change, streak grows, not score
    if (diff[0] === 0) {
      if (streak > 0 ) {
        streak += 1; 
        delta = 0;
      } else {
        streak -= 1;
        delta = 0;
      }
    } else if (diff[0] > 0) { 
      if (streak >0) {
        //streak continues
        streak += 1;
      } else {
        streak = 1;
      }
      delta = 100*streak*streak;
      if (diff[0] === 1) { //major change
        delta *= diff[1];
        lvl = diff[1];
      }
    } else {
      if (streak < 0) {
        //losing streak continues
        streak -= 1;
      } else {
        streak = -1;
      }
      delta = -100*streak*streak;
      if (diff[0] === 1) { //major change
        delta *= diff[1];
        lvl = diff[1];
      }
    }
    return {streak: streak, score: (data.score + delta), level : lvl, delta:delta, 
      typedata : {streak: streak, score: (data.score + delta), level : lvl, delta:delta}
    };
  }
};