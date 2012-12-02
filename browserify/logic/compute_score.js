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

/*
1. Streaking
    This is what we are doing now.
  2. Climb the Mountain
    Goal is to reach highest hand in fewest turns.
  3. Target Practice
    A target hand type is given. Motion towards it is rewarded. Motion away, penalized.
  4. Measured pace
    Points achieved for each hand type in order. 
  5. Staying Alive
    Maintain or improve current hand type, but ranking in it is of no consequence. Points for different hand types are not by ordering, but on perceived difficulty. One downturn is the end game.
  6. Paying the Rent  
    Pot of money. Each card draw costs money. Levels cost money for rent. Level gains give a pot of money. Rent increases as level stays the same. Interest accrues on pot of money each turn with streaks increasing interest. Level loss loses money.
  10. Maybe different scoring rules too. Such as Current Major Level as base and the streak at that level as power. 
  */

types = {
  "basic" : {streak: 0, score: 0, level : 0, delta:0},
  "climb the mountain" : {score:52}, // subtract 1 point for each hand; once the high hand is reached, then the score is multiplied by 1000
  "target practice" : {target : "5", delta :0, score:0}, // target gets chosen. compare the differences to previous hand and current hand
  "measured pace" : {level:0, score:0}, 
  "staying alive" : { score : 0},
  "paying rent" : { score:0, level:0},
  "power leveling" : {streak: 0, score: 0, level : 0, delta:0},
  "streak power" : {streak: 0, score: 0, level : 0, delta:0}
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