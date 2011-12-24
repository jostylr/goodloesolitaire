/*globals $, module, console, require*/

var file = 'logic/scores: ';

var a;

module.exports = function (gcd) {
  
  gcd.install(file, a);    
  
};

a = {
  "initialize score data" : function () {
     return {$set: {
       score: 0,
       highscores : [],
       "old high scores" : false
     }};
  },
  
  'check score/name' : [ ["name", "score", "highscores"],
    function (name, score, highscores) {
      
      if (!name && (score >= (highscores[highscores.length-1].score) || ( score >= highscores[0].score) ) ) {
        return { $$emit: "name requested for high score" };
      } else {
        return { $$emit : "no highscore at end of game" };    
      }
    }
  ],
  
  'remove score/name' : function () {
    return {$$removeListener : { "end game requested" : 'check score/name' }};
  },
  
  
  "check delta" : [["delta"], 
    function  (delta) {
      if (delta < 0) {
        return {$$emit : "negative change in score"};
      } else if (delta > 0) {
        return {$$emit : "positive change in score"};
      } else {
        return {$$emit : "no change in score"};
      }
    }
  ],
  
  "check for streak" : [ [ "streak", "delta" ], 
    function  (streak, delta) {
      if ((streak >2) && (delta >0)) {
        return {$$emit : "streak"};
      }
    }
  ],
  
  "look for new high scores" : [ [ "highscores", "oldHighScores", "gid" ],
    function  (highscores, oldHighScores, gid) {
      var i, n, row, date, tempOldHighScores, rowClass;
      n = highscores.length;
      tempOldHighScores = {};
      for (i = 0; i<n; i += 1) {
        row = highscores[i];
        if (gid === row._id) {
          row.ownscore = true;
        } else if (oldHighScores && !(oldHighScores.hasOwnProperty(row._id)) ) {
          //new high scores from others added
          row.externalnewscore = true;
        }
        tempOldHighScores[row._id] = true;
      }    
      return { $set: {oldHighScores: tempOldHighScores},
          $$emit : "high scores checked"
      };
    }
  ]
  
};