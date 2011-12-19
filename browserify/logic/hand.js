/*globals $, module, console*/

var file = 'logic/hand: ';

var gcd;

var a;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  gcd.on("new game requested"      , a["reset hand state"]);

  gcd.on("server started new game", a["load hand"]);
  gcd.on("server started new game", a["make call"]);
  gcd.on("server started new game", a["note new hand"]);
  

  gcd.on("cards discarded"        , a["check for a hail call"]);
  
  gcd.on("no cards left to draw" , a["end the game"]);
};

a = {
  'reset hand state' : function (data) {
    data.state = 'newhand';
  },
  'load hand' : function  (data) {
    
    gcd.emit("hand data processed", data);
  },
  'make call' : function  (data) {
    
  },
  "end the game" : function (data) {
    gcd.emit("end game requested", data);
  },
  "note new hand" : function (data) {
    data.newhand = true;
  },
  "check for a hail call" : function  (data) {
    var newhand = data.newhand;
    var count = data.drawcount;
    if (count === 4) {
      if (newhand) {
        gcd.emit("miagan", data);
      } else {
        gcd.emit('hail mia', data);
      }
    } else if (count === 5) {
      if (newhand) {
        gcd.emit("mulligan", data);
      } else {
        gcd.emit('hail mar', data);
      }      
    }    
  }
  
};

var fname; 

for (fname in a) {
  a[fname].desc = file+fname;
}


