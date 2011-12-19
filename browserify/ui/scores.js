/*globals $, module, console, require*/

var file = 'ui/scores: ';

var gcd;

var a, install;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data); //for initializing click functions, mostly
  
  gcd.on("draw cards"            , a["clear streak"]);  
  gcd.on("streak"                ,  a["call streak"]);
  gcd.on(""                      , a["add score entry"]);
  gcd.on("high scores loaded"    , a["display high scores"]);
  gcd.on(""                      , a["pulse scores"]);
  gcd.on("name entry hidden"    , a["emit submit name" ]);
  gcd.on("name entry shown"     , a["focus into name modal"]);
  gcd.on("name submitted"       , a["get name value"]);
  gcd.on("name entry shown"      , a["bind name entry keys"]);
  gcd.on("name submitted"       , a["unbind name entry keys"]);

  gcd.on("ready", function () {
    $('#highscores')    .bind("click", a["retrieve high scores for viewing"]);
    $("#name")          .bind("click", a["name entry requested"]);
    $("#submitname")    .bind("click", a["hide name entry"]);
    $("#scoreentry")    .bind("hide" , a["emit name entry hidden"]);
    
    
    gcd.emit("high scores requested", data);
    
    a["install score entry"](data);
    a["initialize name"](data);
    
  });
  
};



a = {
  'clear streak' : function  (data) {
    $('#inarow').html("&nbsp;");
  }, 
  'call streak' : function  (data) {
    $('#inarow').html(data.streak+" in a row"+ (data.level ? " with a bonus of "+data.level+"!" : "!"));
  },
  'add score entry' : function (data) {
    $('#scoreentry').bind('hide', function self () {
      data.name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
      if (!data.name) {
        data.name = "___";
      }
      $('#scoreentry').unbind('hide', self); //self cleanup
      gcd.emit('send endgame');
    });
  },
  'display high scores' : function () {$('#modal-highscores').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  }, 
  "pulse scores" : function (data) {
    $('#score, #delta').removeClass("scoreminus scoreplus");
    setTimeout(function () {$('#score, #delta').addClass(data.scoreclass);}, 5);
  },
  
  
  "install score entry" : function  () {
    $('#scoreentry').modal({
      backdrop: "static",
      keyboard: true,
      show: true
    }); 
  },
  
  "focus into name modal" : function () {
    $("#namemodal").attr("tabindex", 1).focus().select(); 
  },
  
  "get name value" : function (data) {
    var name = $("#namemodal").val().replace(/\W/g, ''); 
    if (name) {
      $("#name a").html(name);
      data.name = name;
    }
  }, 
  
  "initialize name" : function (data) {
    data.name = '';
  }, 
  
  "bind name entry keys" : function (data) {
    $('html').bind('keyup', a["keys for name entry"]);
  },
  
  "unbind name entry keys" : function (data) {
    $('html').unbind('keyup', a["keys for name entry"]);
  }
  
};

install = function (data) {
  a["emit submit name"] = function () {
      gcd.emit("name submitted", data);
  };

  a["retrieve high scores for viewing"] = function () {
    gcd.once("server sent high scores", a["display high scores"]);
    gcd.emit("high scores requested", data);
  };
  
  a["name entry requested"] = function () {
    $('#scoreentry').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    gcd.emit("name entry displayed", data);
  };
  
  a["hide name entry"] = function () {
    $("#scoreentry").modal('hide');
  };
  
  a["emit name entry hidden"] = function () {
    gcd.emit("name entry hidden", data);
  };
  
  a["keys for name entry"] = function  (evnt) {
    if (evnt.keyCode === 13) {
      a["hide name entry"]();
      return false;
    } 
  };
  
  var fname; 
  for (fname in a) {
    a[fname].desc = file+fname;
  }

};

