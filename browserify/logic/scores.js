/*globals $, module, console, require*/

var file = 'logic/score: ';

var gcd;

var a;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  gcd.on("ready", function (data) {
    data.score = 0;
    data.highscores = [];
    data["old high scores"] = false;
  })
    
  
};

a = {
  
  'check score/name' : function (data) {
    if (!name && score >= highscores[0].score) {
      gcd.emit("name requested for high score", data)
      submitScore();  //shows modal
    } else {
      gcde.emit("send endgame");    
  },
  
  'compute in a row' : function (data) {
    
  },
  
  
  
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}


var inarow = function (data) { //streak, level, typechange) {
  
  //change data.level
  if (typechange > 2) {
    ui.emit("call streak", data)
  } 
}; 


var loadScore = function (data) {
  score = data.gamedata.score;
  $("#score").html(data.gamedata.score);
  var delta = data.delta;
  if (delta > 0) {
     $("#delta").html("&#x25B2;"+delta);
     gcd.emit("prep for add history", {
      score:data.gamedata.score, 
      deltalabel : "class='label success'>&#x25B2;"+delta, 
      hand: data.hand,
      call: data.call
    });
     scorepulse('scoreplus');
    inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
  } else if (delta < 0) {
     $("#delta").html("&#x25BC;"+(-1*delta));
     gcd.emit("prep for add history", {
      score:data.gamedata.score, 
      deltalabel : "class='label important'>&#x25BC;"+(-1*delta),
      hand: data.hand,
      call: data.call
    });
     scorepulse('scoreminus');
    inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
  } else {
     $("#delta").html("▬");
     gcd.emit("prep for add history", {
      score:data.gamedata.score, 
      deltalabel : "class='label' >▬",
      hand: data.hand,
      call: data.call
    });
     scorepulse('');
    inarow(data.gamedata.streak, data.gamedata.level, 0);  
  }
};

var loadHighScores = function (serverscores) {
  var i, n, row, date, tempOldHighScores, rowClass; 
  highscores = serverscores; 
  n = serverscores.length;
  tempOldHighScores = {};
  var htmltablebody = '';
  for (i = 0; i<n; i += 1) {
    row = serverscores[n-1-i];
    date = new Date (row.date);
    date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
    if (gid === row._id) {
      rowClass = 'class = "newHighScore"';
    } else if (oldHighScores && !(oldHighScores.hasOwnProperty(row._id)) ) {
      //new high scores from others added
      rowClass = 'class = "otherNewHighScores"';
    } else {
      rowClass = "";
    }
    htmltablebody += '<tr '+rowClass+' id="'+row._id+'"><td>'+(i+1)+'.</td><td>'+row.name+'</td><td>'+row.score+'</td><td>'+date+'</td></tr>';
    tempOldHighScores[row._id] = true;
  }    
  oldHighScores = tempOldHighScores;
  $("#hs").html(htmltablebody);
};

//game ended?
gcd.emit("load high scores", data, server[2]);

