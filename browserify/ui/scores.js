/*globals $, module, console, require, humaneDate*/

var file = 'ui/scores: ';

var gcd;

var a, install;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data); //for initializing click functions, mostly
  
  gcd.on("draw cards requested"   , a["clear streak"]); //
  gcd.on("new game requested"     , a["clear streak"]);
  gcd.on("streak"                 , a["call streak"]); //
  gcd.on("name entry shown"       , a["get name"]); //send endgame
  gcd.on("end game requested"     , a["add listener to show high scores"]);
//  gcd.on("high scores checked"    , a["display high scores"]);//
  gcd.on("server started new game" , a["pulse positive score"]);
  gcd.on("negative change in score", a["pulse negative score"]);
  gcd.on("positive change in score", a["pulse positive score"]);  
  gcd.on("no change in score"     , a["no score change"]);    
  //gcd.on("name entry hidden"      , a["emit submit name" ]);
  gcd.on("name entry shown"       , a["focus into name modal"]);
 // gcd.on("name submitted"         , a["get name value"]);
  gcd.on("name entry shown"       , a["bind name entry keys"]);
  gcd.on("name submitted"         , a["unbind name entry keys"]);

  gcd.on("name requested for high score", a["name entry requested"]);


  gcd.on("ready"                  , a['initialize name/score clicks, modals, high scores']);
  
};



a = {
  'clear streak' : function  (data) {
    $('#inarow').html("&nbsp;");
  }, 
  'call streak' : function  (data) {
    $('#inarow').html(data.streak+" in a row"+ (data.level ? " with a bonus of "+data.level+"!" : "!"));
  },
  'get name' : function (data) {
    $('#scoreentry').bind('hide', function self () {
      data.name = encodeURI($('#namemodal').val().replace(/[^ a-zA-Z0-9_]/g, ''));
      if (!data.name) {
        data.name = "___";
      } else {
        $("#name a").html(data.name);
      }
      $('#scoreentry').unbind('hide', self); //self cleanup
      gcd.emit('name submitted', data);
    });
  },
  "add listener to show high scores" : function (data) {
    gcd.once("high scores checked", a["display high scores"]);
  },
  'display high scores' : function (data) {
    var row, rowclass, n, i, date;
    n = data.highscores.length;
    var htmltablebody = '';
    for (i = 0; i<n; i += 1) {
      row = data.highscores[n-1-i];
      date = humaneDate(new Date (row.date));
//      date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
      if (row.ownscore) {
        rowclass = 'class="newHighScore"';
      }
      if (row.externalnewscore) {
        rowclass = 'class="otherNewHighScore"';
      }
      htmltablebody += '<tr '+rowclass+' id="'+row._id+'"><td>'+(i+1)+'.</td><td>'+row.name+'</td><td>'+row.score+'</td><td>'+date+'</td></tr>';
    }    
    $("#hs").html(htmltablebody);    
    
    $('#modal-highscores').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
  }, 
  "pulse negative score" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("&#x25BC;"+(-1*data.delta));
    $('#score, #delta').removeClass("scoreminus scoreplus");
    setTimeout(function () {$('#score, #delta').addClass("scoreminus");}, 5);
    gcd.emit("score loaded", data);
  },
  "pulse positive score" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("&#x25B2;"+data.delta);
    $('#score, #delta').removeClass("scoreminus scoreplus");
    setTimeout(function () {$('#score, #delta').addClass("scoreplus");}, 5);
    gcd.emit("score loaded", data);
  },
  "no score change" : function (data) {
    $("#score").html(data.score);
    $("#delta").html("▬");
    $('#score, #delta').removeClass("scoreminus scoreplus");
    gcd.emit("score loaded", data);
  },
  
  
  "install score entry" : function  () {
    $('#scoreentry').modal({
      backdrop: "static",
      keyboard: true,
      show: false
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
  a['initialize name/score clicks, modals, high scores'] = function () {
    $('#highscores')    .bind("click", a["retrieve high scores for viewing"]);
    $("#name")          .bind("click", a["name entry requested"]);
    $("#submitname")    .bind("click", a["hide name entry"]);
    $("#scoreentry")    .bind("hide" , a["emit name entry hidden"]);
    
    
    gcd.emit("high scores requested", data);
    
    a["install score entry"](data);
    a["initialize name"](data);
    
  };
  
  /*
  a["emit submit name"] = function () {
      gcd.emit("name submitted", data);
  };*/

  a["retrieve high scores for viewing"] = function () {
    gcd.once("high scores checked", a["display high scores"]);
    gcd.emit("high scores requested", data);
  };
  
  a["name entry requested"] = function () {
    $('#scoreentry').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    gcd.emit("name entry shown", data);
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

