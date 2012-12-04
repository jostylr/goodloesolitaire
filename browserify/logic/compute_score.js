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
  "compute score" : [["call", "type", "diff", "typedata", "wilds"], 
    function me (call, type, diff, data, wilds) {
      var ret = scoring[type](call, diff, data);
      if (wilds === "no") {
        ret.delta *=2;
        ret.score *= 2; 
      }
      gcd.ret({$set : ret, $$emit: "score computed"}, me.desc);
    }
  ],

  "load type" : [["type", "wilds"],
    function me (type, wilds) {
      type = type || "basic";
      wilds = wilds || "yes";
      var typedata = types[type]();
      gcd.ret({$set : {type : type, wilds : wilds, score : typedata.score, typedata : typedata}, $$emit : "type loaded"}, me.desc);
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

var targettranslate = function (type) {

  switch (type) {
    case "5":  return "5K";
    case "sf": return "SF";
    case "4":  return "4K";
    case "fh": return "FH";
    case "f":  return "Fl";
    case "s":  return "St";
    case "3":  return "3K";
    case "2p": return "2P";
    case "2":  return "1P";
    case "1":  return "▬" ;
  }

};

types = {
  "basic" : function () {return {streak: 0, score: 0, level : 0, delta:0};},
  "mount" : function () {return {score:52};}, // subtract 1 point for each hand; once the high hand is reached, then the score is multiplied by 1000
  "target" : function () {
    var targets = ["5", "sf", "4", "fh", "f", "s", "3"]; //, "2p", "2", "1"];
    var target = targets[Math.floor(Math.random()*7)];
    $("#targethand a").text(targettranslate(target)).removeClass("hide");
    return {target : target, delta :0, score:0, oldlevel:"1", rounds:0};}, // target gets chosen. compare the differences to previous hand and current hand
  "measured" : function () {return {level:0, score:0, delta:0};}, 
  "alive" : function () { return {score : 0, oldlevel:"1", delta:0, done:false};},
  "rent" : function () {return { score:100, rent:0};},
  "powerlevel" : function () {return {streak: 0, score: 0, level : 0, delta:0};},
  "streakpower" : function () {return {streak: 0, score: 0, level : 0, delta:0};}
};


var major = {"5" :9, "sf":8, "4":7, "fh":6, "f":5, "s":4, "3":3, "2p":2, "2":1, "1":0};

var hardness = {"5" :9, "sf":8, "4":3, "fh":6, "f":7, "s":6, "3":2, "2p":4, "2":1, "1":0};

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
  },

  "mount" : function (call, diff, data) {
    var level = call[0];
    if ((level === "5") || (level === "sf")) {
      // win
      gcd.ret({$$emit:"game done"});
      var score = data.score-1;
      if (level ==="5") {
        return {delta : (score*score*10), score : (score*score*10+score)};
      } else { //straight flush is harder
        return {delta : (score*score*20), score : (score*score*20+score)};
      }
    } else {
      return {typedata: {score: (data.score-1)} , delta : -1, score : (data.score-1)};      
    }
  },

  "target" : function (call, diff, data) {
    console.log(data);
    var target = data.target;
    var olddiff = Math.abs( major[data.oldlevel || "1"] - major[target]);
    var newdiff = Math.abs(major[call[0]] - major[target]);
    var delta = (7-newdiff)*hardness[target]*100;
    console.log(delta, target, olddiff, newdiff);
    if (newdiff < olddiff) {
      //closer, great!
    } else if (newdiff > olddiff ) {
      console.log("closer");
      delta = -delta;
    } else {
      delta = 0;
    }
    if (newdiff === 0) {
      delta += (50-data.rounds)*100;
      gcd.ret({$$emit:"game done"});
    }
    return {typedata: {rounds: (data.rounds+1), oldlevel : call[0], target : target, delta :delta, score:(data.score+delta)}, delta :delta, score:(data.score+delta)};
  }, // target gets chosen. compare the differences to previous hand and current hand

  "measured" : function (call, diff, data) {
    var delta = 0;
    var level = major[call[0]];
    if (diff[0] === 1) { // positive change
      if (diff[1] === 1) {
        delta = 500;
      } else {
        delta = -10;
      }
    } else if (diff[0] ===  0) { // same level
      delta = 10;
    } else if (diff[0] === -1) { // negative change
      if (diff[1] === -1) {
        delta = 10;
      } else {
        delta = -500;
      }
    }
    delta *= level; 
    return {streak: 0, score: (data.score + delta), delta:delta, 
      typedata : {streak: 0, score: (data.score + delta), delta:delta}
    };
  }, 

  "alive" : function (call, diff, data) { 
    if (data.done === true) {
      return {typedata:data, score:data.score, delta : 0};
    }
    var oldlvl = data.oldlevel || "1";
    if (diff[0] >= 0) {
      var delta = 1000*hardness[oldlvl];
      return {typedata:{score:data.score+delta, delta:delta, oldlevel:call[0], done:false}, score:data.score+delta, delta : delta}; 
    } else {
      data.done  = true;
      gcd.ret({$$emit:"game done"});
      return {typedata:data, score:data.score, delta : 0};      
    }
    return {score : 0};},


  "rent" : function (call, diff, data) {
    var streak = data.streak;
    var draws = gcd.data.draws || "00000"; //I cheat here
    var count = 0;
    for (var i = 0; i < 5; i+= 1) {
      if (draws[i] === "1") {
        count += 1;
      }
    }
    var cost = count*count*5; //each card draw costs more and more
    cost += major[call[0]]*data.rent; //rent for level

    var pot = 0;
    var rent = data.rent;
    //give a pot of money for level attainment
    if (diff[0] === 1) {
      pot = major[call[0]]*100;
      rent = 0;
    } else if (diff[0] === -1) { 
      cost += diff[1]*100; // penalty for loss
      rent = 0;
    } else {
      rent += 1;
    }

    var money = data.score;

    //compute streak
    if (diff[0] === 0) { // level stays the same
      if (streak > 0 ) {
        streak += 1; 
      } else {
        streak -= 1;
      }
    } else if (diff[0] > 0) { 
      if (streak >0) {
        //streak continues
        streak += 1;
      } else {
        streak = 1;
      }
    } else {
      if (streak < 0) {
        //losing streak continues
        streak -= 1;
      } else {
        streak = -1;
      }
    }

    var interest = money*0.02*streak; //interest, can be negative;

    var delta = Math.floor(cost + pot +interest);
    money = money + delta; 
    if (money <= 0) {
     gcd.ret({$$emit:"game done"});
      return {score:0};
    } else {
      return {typedata: {rent: rent, score: money, streak : streak}, streak: streak, delta:delta, score:money};
    }
  },

  "powerlevel" : function (call, diff, data) {
    var streak = data.streak;
    var delta = 0;
    var lvl = 0;
    var actuallevel = major[call[0]];
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
      delta = 1*Math.pow(streak, actuallevel);
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
      delta = -1*Math.pow(Math.abs(streak), actuallevel);
      if (diff[0] === 1) { //major change
        delta *= diff[1];
        lvl = diff[1];
      }
    }
    return {streak: streak, score: (data.score + delta), level : lvl, delta:delta, 
      typedata : {streak: streak, score: (data.score + delta), level : lvl, delta:delta}
    };
  },

  "streakpower" : function (call, diff, data) {
    var streak = data.streak;
    var delta = 0;
    var lvl = 0;
    var actuallevel = major[call[0]];
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
      delta = 1*Math.pow(actuallevel, streak);
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
      delta = -1*Math.pow(actuallevel, Math.abs(streak));
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