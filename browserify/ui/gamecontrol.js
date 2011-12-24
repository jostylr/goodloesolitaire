/*globals $, module, console, require*/

var file = 'ui/gamecontrol: ';

var a, b;

var fadelevel = 0.4;

var ret; 

module.exports = function (gcd) {
  
  ret = gcd.ret;
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
  
  "emit new game requested" : function () {
    ret({ $$emit : "new game requested" });
  },
   
  "emit draw cards requested" : function () {
    ret({ $$emit : "draw cards requested" });
  },
  
  "emit end game requested" : function  () {
    ret({ $$emit : "end game requested" });     
  },
  
  "emit retrieve game requested" : function (event) {
    ret({ $set : {"requested gid" : $(event.target).parents("tr").attr("id") },
      $$emit : 'old game requested'
    });
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
    $("#togglegame").html('<a id="endgame">End Game</a>');        
  },
  "install startgame": function () {
    $("#togglegame").html('<a id="newgame">Start Game</a>');      
  },
  "remove main fade" : function  () {
    $(".main").fadeTo(200, 1);
  },
  "fade main" : function  () {
    $(".main").fadeTo(600, fadelevel, function () {
      ret( { $emit : "main is faded" } );
    });
  },
  

  //key clicks
  "bind hand keys" : function () {
    $('html').bind('keyup', b["hand key bindings"]);
  },
  "unbind hand keys" : function () {
    $('html').unbind('keyup', b["hand key bindings"]);
  },
  "listen for name entry" : function () {
    ret({ $$on: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }});
  },
  "remove listen for name entry" : function () {
    ret({ $$removeListener: {
      "name entry shown" : "unbind hand keys",
      "name submitted" : "bind hand keys"
    }});
  },
  
  "initialize game clicks, hide stuff" : function () {
    $("#newgame").live('click', b["emit new game requested"]);
    $("#drawcards").click(b["emit draw cards requested"]);
    $("#endgame").live('click', b["emit end game requested"]);
    $("#endgame").hide(); 
    $(".main").fadeTo(100, fadelevel);
    $("#hs").click(b["emit retrieve game requested"]);
    $("#about").click(b["show about"]);
  
    
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
