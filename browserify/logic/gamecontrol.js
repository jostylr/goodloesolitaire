/*globals $, module, console, require*/

var file = 'logic/gamecontrol: ';

var servercalls = require('../utilities/server');

var ret, gcd;

var a;

var process;

module.exports = function (gcd) {
  ret = gcd.ret;
  gcd.install(file, a);  
};

a = {
  "initialize values" : function () {
    return {$set : {
      uid : 0, //set by server
      gid : 0, //set by server
      type : 'basic' //toggle options
    }};
  },
  
  
  "watch name to send end game" : function () {
    return { $$once: { "name submitted" : "send end game" } };
  },
  
  "attach end to request" : function () {
    return { $$removeListener : { "no highscore at end of game" : "send end game" }, 
             $$on : { "end game requested" : "send end game" }
    };
  },
  
  //server calls
  
  "send new game": [[ "uid", "type" ],
    function me (uid, type) {
      servercalls.get('shuffle/'+uid+'/'+type, function (server) {
        var build;
        if (server.error) {
          ret({$$emit: [["new game denied", server]]}, me.desc);
          return false;
        }
        build = process(type, server);
        build.$$emit = "server started new game";
        ret(build, me.desc);
      });
    }
  ],
  
  "send draw cards" : [["uid", "gid", "draws", "type", "cardsleft"],
    function me (uid, gid, draws, type) {
      servercalls.get('drawcards/'+uid+'/'+gid+'/'+draws, function (server){
        var build;
        if (server.error) {
          ret({$$emit: [["failed to draw cards", server]]}, me.desc);
          return false;
        }
        build = process(type, server);
        build.$$emit = "server drew cards";      
        ret(build, me.desc);
      });  
  }],
  
  
  "send end game" : [ ["uid", "gid", {$$get : "name", $$default :"___"} ],
    function me (uid, gid, name) {
      servercalls.get('endgame/'+uid+"/"+gid+"/"+name, function (server){
        var build;
        if (server.error) {
          ret({$$emit: [["end game denied", server]]}, me.desc);
          return false;
        }
        ret({$set : { highscores: server.highscores.sort(function (a,b) {return b.score - a.score;})  },
            $$emit : "server ended game"
        }, me.desc);
      });
    }
  ],
  
  
  "send view scores" : function me () {
    servercalls.get('viewscores', function (server) {
      if (server.error) {
        ret({$$emit: [["view scores denied", server]]}, me.desc);
        return false;
      }
    ret({$set : {highscores: server.highscores},
          $$emit : "server sent high scores"
        }, me.desc);
    });
  }

/*
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
  */
  
};

process = function (type, server) {
  var build = {$set : {}};
  var data = build.$set;
  if (server.hasOwnProperty("gid")) {
     data.gid = server.gid;
  }
  data.hand = server.hand;
  data.call = server.call;
  data.cardsleft  = server.cardsleft;
  switch (type) {
    case "basic" :
      data.streak = server.gamedata.streak;
      data.score = server.gamedata.score;
      data.delta = server.delta;
      data.level = server.gamedata.level;
    break;
    default : 
    break;
  }
  return build;
};

    
