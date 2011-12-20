/*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var gcd;

var a, install;

var fadelevel = 0.4;


module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
  
  gcd.on("new game requested" , a["remove main fade"]);
  
  gcd.on("server started new game", a["install endgame"]);
  gcd.on("server started new game", a["bind hand keys"]);
  gcd.on("server started new game", a["listen for name entry"]);
  gcd.on("server started new game", a["remove main fade"]);
  
  gcd.on("server ended game"      , a["install startgame"]);
  gcd.on("server ended game"      , a["unbind hand keys"]);
  gcd.on("server ended game"      , a["remove listen for name entry"]);
  gcd.on("server ended game"      , a["fade main"]);
  

  gcd.on("end game requested" , a["emit check score/name"]);
  
  gcd.once("name registered"  , a["skip name"]);
  
  
  gcd.on("ready"              , a["initialize game clicks, hide stuff"]);
  

};


a = {
  "install endgame" : function () {
    $("#togglegame").html('<a id="endgame">End Game</a>');        
  },
  "install startgame": function () {
    $("#togglegame").html('<a id="newgame">Start Game</a>');      
  },
  "skip name" : function (data) {
    gcd.removeListener("end game", a["emit check"]);
    gcd.on("end game", function (data) {
      gcd.emit("send end game", data);
    }); 
  },
  "remove main fade" : function  (data) {
    $(".main").fadeTo(200, 1);
  },
  "fade main" : function  (data) {
    $(".main").fadeTo(600, fadelevel, function () {
      gcd.emit("main is faded", data);
    });
  },
  

  "emit check score/name" : function (data) {
    gcd.emit("check score and name", data); //removed after usage
  },
  "show about" : function () {
    $('#modal-about').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  },

  //key clicks
  "hand key bindings": function (evnt) {
         var key = evnt.keyCode; 
         switch (key) {
          case 49: $('#hand li:nth-child(1)').click(); break;//1 card as visible
          case 50: $('#hand li:nth-child(2)').click(); break;
          case 51: $('#hand li:nth-child(3)').click(); break;
          case 52: $('#hand li:nth-child(4)').click(); break;
          case 53: $('#hand li:nth-child(5)').click(); break;
          case 13: $('#drawcards').click(); return false; //enter drawcards
         }
  },
  "bind hand keys" : function () {
    $('html').bind('keyup', a["hand key bindings"]);
  },
  "unbind hand keys" : function () {
    $('html').unbind('keyup', a["hand key bindings"]);
  },
  "listen for name entry" : function () {
    gcd.on("name entry shown"      , a["bind hand keys"]);
    gcd.on("name submitted"       , a["unbind hand keys"]);
  },
  "remove listen for name entry" : function () {
    gcd.removeListener("name entry shown", a["bind hand keys"]);
    gcd.removeListener("name submitted"  , a["unbind hand keys"]);
  }
  
};

install = function (data) {
   a["initialize game clicks, hide stuff"] = function () {
    $("#newgame").live('click', a["emit new game"]);
    $("#drawcards").click(a["emit draw cards"]);
    $("#endgame").live('click', a["emit end game"]);
    $("#endgame").hide(); 
    $(".main").fadeTo(100, fadelevel);
    $("#hs").click(a["emit retrieve game"]);
    $("#about").click(a["show about"]);
  
    
  };
  
  a["emit new game"] = function () {
    gcd.emit("new game requested", data);
  };
   
  a["emit draw cards"] = function () {
    gcd.emit("draw cards requested", data);
  };
  
  a["emit end game"] = function  () {
    gcd.emit("end game requested", data);      
  };
  
  a["emit retrieve game"] = function (event) {
    data.requestedgid = $(event.target).parents("tr").attr("id");
    gcd.emit('old game requested', data);
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }
  
};