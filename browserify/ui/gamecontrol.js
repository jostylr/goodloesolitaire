/*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var a, b;

var fadelevel = 0.4;

var gcd; 

module.exports = function (gcde) {
  gcd = gcde;

  gcd.install(file, a);
  

};

b = { "hand key bindings": function (evnt) {
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
  
  "emit new game requested" : function me () {
    gcd.ret({ $$emit : "new game requested" }, file+"emit new game requested");
  },
   
  "emit draw cards requested" : function me () {
    gcd.ret({ $$emit : "draw cards requested" }, file+"emit draw cards requested");
  },
  
  "emit end game requested" : function me  () {
    gcd.ret({ $$emit : "end game requested" }, file+"emit end game requested");     
  },
  
  "emit retrieve game requested" : function me (event) {
    gcd.ret({ $set : {"requested gid" : $(event.target).parents("tr").attr("id") },
      $$emit : 'old game requested'
    }, file+"emit retrieve game requested");
  },

  "new gametype chosen" : function me (event) {
    var whichtype = $(event.target).attr("id");
    $('#modal-gametype').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  },
  
  "emit request for replay old game" : function me () {
    gcd.ret({$$emit : "replay game requested"}, file+"emit request for replay old game");
  },
  
  "show about" : function () {
    $('#modal-about').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  }

  
};


a = {
  "install endgame" : function () {
 //   $("#togglegame").html('<a id="endgame">End Game</a>');        
  },
  "install startgame": function () {
  //  $("#togglegame").html('<a id="newgame" >Start Game</a>');      
  },
  "remove main fade" : function  () {
    $(".main").fadeTo(200, 1);
  },
  "fade main" : function  me () {
    $(".main").fadeTo(600, fadelevel, function () {
      gcd.ret( { $emit : "main is faded" }, me.desc );
    });
  },
  

  //key clicks
  "bind hand keys" : function () {
    $('html').bind('keyup', b["hand key bindings"]);
  },
  "unbind hand keys" : function () {
    $('html').unbind('keyup', b["hand key bindings"]);
  },
  "listen for name entry" : function me () {
    gcd.ret({ $$on: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }}, me.desc);
  },
  "remove listen for name entry" : function me () {
    gcd.ret({ $$removeListener: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }}, me.desc);
  },
  
  "initialize game clicks, hide stuff" : function () {
    $("#newgame").live('click', b["emit new game requested"]);
    $("#drawcards").click(b["emit draw cards requested"]);
    $("#endgame").live('click', b["emit end game requested"]);
    $("#endgame").hide(); 
    $(".main").fadeTo(100, fadelevel);
    $("#hs").click(b["emit retrieve game requested"]);
    $("#about").click(b["show about"]);
    $("#oldreplay").click(b["emit request for replay old game"]);
    $("#gametypes a").click(b["new gametype chosen"]);
    
  }
  
};



/*
//gcd.once("name registered"                , a["skip name"]); // ui/gamecontrol: 
//Remove "end game", "emit check"; ON "end game" send end game

  "skip name" : function (data) {
    gcd.removeListener("end game", a["emit check"]);
    gcd.on("end game", a["send end game"] function (data) {
      gcd.emit("send end game", data);
    }); 
  },
  */
