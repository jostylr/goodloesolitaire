/*globals $, module, console, require*/

var file = 'logic/score: ';

var gcd;

var a;

module.exports = function (gcde, data) {
  gcd = gcde;

  gcd.on("server drew cards"        , a["check delta"]);  // (negative OR positive OR no) change in score
  gcd.on("server drew cards"        , a["check for streak"]); // streak OR nothing
  
  gcd.on("server sent high scores"  , a["look for new high scores"]);  // high scores checked
  
  gcd.on("ready", function (data) {
    data.score = 0;
    data.highscores = [];
    data["old high scores"] = false;
  });
    
  
};

a = {
  
  'check score/name' : function (data) {
    if (!data.name && data.score >= data.highscores[0].score) {
      gcd.emit("name requested for high score", data);
      // submitScore();  //shows modal
    } else {
      gcd.emit("send endgame");    
    }
  },
  
  
  "check delta" : function  (data) {
    var delta = data.delta;
    if (delta < 0) {
      gcd.emit("negative change in score", data);
    } else if (delta > 0) {
      gcd.emit("positive change in score", data);
    } else {
      gcd.emit("no change in score", data);
    }
  },
  "check for streak" : function  (data) {
    if ((data.streak >2) && (data.delta >0)) {
      gcd.emit("streak", data);
    }
  },
  
  "look for new high scores" : function  (data) {
    var i, n, row, date, tempOldHighScores, rowClass, highscores;
    highscores = data.highscores; 
    n = highscores.length;
    tempOldHighScores = {};
    for (i = 0; i<n; i += 1) {
      row = highscores[n-1-i];
      if (data.gid === row._id) {
        row.ownscore = true;
      } else if (data.oldHighScores && !(data.oldHighScores.hasOwnProperty(row._id)) ) {
        //new high scores from others added
        row.externalnewscore = true;
      }
      tempOldHighScores[row._id] = true;
    }    
    data.oldHighScores = tempOldHighScores;
    gcd.emit("high scores checked");
  }
  
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}

