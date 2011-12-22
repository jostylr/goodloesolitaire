/*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var servercalls = require('../utilities/server');

var gcd;

var a, install;

var process;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
  
  gcd.on('new game requested'   , a["send new game"]);
  gcd.on('cards discarded'      , a["send draw cards"]);  
  
  gcd.on('no highscore at end of game'  , a["send end game"]);
  gcd.on('name requested for high score', a["watch name to send end game"]);
  gcd.on("name submitted"       , a["attach end to request"]);
  
  //gcd.on('end game requested'   , a["send end game"]);
  gcd.on('high scores requested', a["send view scores"]);

  gcd.on("ready"                , a["initialize values"]);  
  
};

a = {
  
  "watch name to send end game" : function (data) {
    gcd.once("name submitted", a["send end game"]);
  },
  
  "attach end to request" : function (data) {
    gcd.removeListener("no highscore at end of game", a["send end game"]);
    gcd.on("end game requested", a["send end game"]);
  },
  
  //server calls
  
  "send new game": function (data) {
    servercalls.get('shuffle/'+data.uid+'/'+data.type, function (server) {
      if (server.error) {
        gcd.emit("new game denied", data, server);
        return false;
      }
      process(data, server);
      gcd.emit("server started new game", data);
    });
  },
  
  "send draw cards" : function (data) {
    servercalls.get('drawcards/'+data.uid+'/'+data.gid+'/'+data.draws, function (server){
      if (server.error) {
        gcd.emit("failed to draw cards", data, server);
        return false;
      }
      process(data, server);
      gcd.emit("server drew cards", data);
      if (data.cardsleft <= 0) {
        gcd.emit("no cards left to draw", data);
      }
      
    });  
  },
  
  
  "send end game" : function (data) {
    var name;
    if (data.hasOwnProperty("name") && data.name) {
      name = data.name;
    } else {
      name = "___";
    }
    servercalls.get('endgame/'+data.uid+"/"+data.gid+"/"+name, function (server){
      if (server.error) {
        gcd.emit("end game denied", data, server);
        return false;
      }
      data.highscores = server.highscores.sort(function (a,b) {return b.score - a.score;});
      gcd.emit("server ended game", data);
    });
  },
  
  
  "send view scores" : function (data) {
    servercalls.get('viewscores', function (server) {
      if (server.error) {
        gcd.emit("view scores denied", data, server);
        return false;
      }
      data.highscores = server.highscores; 
      gcd.emit("server sent high scores", data);
    });
  },

  'send game review' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },

  'send game history' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    },
    
  'send game replay' : function (gid) {
      servercalls.get('retrievegame/'+gid,  function (data){        
        console.log(JSON.stringify(data));
      });      
    }
  
};

install = function (data) {
  a["initialize values"] = function (data) {
    data.uid = '0'; //set by server
    data.gid = '0'; //set by server
    data.type = 'basic'; //toggle options
    data.name = false;    
  };
  
  var fname; 

  for (fname in a) {
    a[fname].desc = file+fname;
  }  
};


process = function (data, server) {
  if (server.hasOwnProperty("gid")) {
    data.gid  = server.gid;
  }
  data.hand = server.hand;
  data.call = server.call;
  data.cardsleft  = server.cardsleft;
  switch (data.type) {
    case "basic" :
      data.streak = server.gamedata.streak;
      data.score = server.gamedata.score;
      data.delta = server.delta;
      data.level = server.gamedata.level;
    break;
    default : 
    break;
  }
};

    
