/*globals $, module, console, require, humaneDate, window*/

var file = 'ui/scores: ';

var gcd;

var a;

module.exports = function (gcde) {
  gcd = gcde;
  gcd.install(file, a);   
};



a = {
  'clear streak' : function  () {
    $('#inarow').html("&nbsp;");
  }, 
  'call streak' : [ [ "streak", "level" ], 
    function  (streak, level) {
      $('#inarow').html(streak + " in a row" + (level ? " with a bonus of "+ level + "!" : "!"));
    }
  ],
  'display high scores' : [ [ "highscores" ],
    function (highscores) {
      var row, rowclass, n, i, date;
      n = highscores.length;
      highscores.sort(function (a,b) {return b.score -a.score;});
      var htmltablebody = '';
      for (i = 0; i<n; i += 1) {
        row = highscores[i];
        date = humaneDate(new Date (row.date)).toLowerCase();
  //      date = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
        rowclass = '';
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
    }
  ], 
  "pulse negative score" : [ [ "score", "delta" ],
     function (score, delta) {
      $("#score").html(score);
      $("#delta").html("&#x25BC;"+(-1*delta));
      $('#score, #delta').removeClass("scoreminus scoreplus");
      setTimeout(function () {$('#score, #delta').addClass("scoreminus");}, 5);
      return {$$emit : "score loaded" };
    }
  ],
  "pulse positive score" :   [ [ "score", "delta" ],
    function (score, delta) {
      $("#score").html(score);
      $("#delta").html("&#x25B2;" + delta);
      $('#score, #delta').removeClass("scoreminus scoreplus");
      setTimeout(function () {$('#score, #delta').addClass("scoreplus");}, 5);
      return {$$emit : "score loaded" };
    }
  ],
  "no score change" : [ [ "score", "delta" ],
     function (score, delta) {
      $("#score").html(score);
      $("#delta").html("▬");
      $('#score, #delta').removeClass("scoreminus scoreplus");
      return {$$emit : "score loaded" };
    }
  ],
  
  
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
  
  "get name value" : function () {
    var name = $("#namemodal").val().replace(/\W/g, ''); 
    if (name) {
      $("#name a").html(name);
      return {$set : { name : name }};
    }
  }, 
  
 /* "initialize name" : function (data) {
    data.name = '';
  }, */
  
  "bind name entry keys" : function () {  
    $('html').bind('keyup', a["keys for name entry"]);
  },
  
  "unbind name entry keys" : function () {
    $('html').unbind('keyup', a["keys for name entry"]);
  },
  
  'initialize name/score clicks, modals, high scores' : function () {
    $('#showtweets')    .bind("click", a["show tweets"]);
    $('#sendtweet')     .bind("click", a["request tweet"]);
    $("#name")          .bind("click", a["name entry requested"]);
    $("#submitname")    .bind("click", a["hide name entry"]);
    $("#scoreentry")    .bind("hide" , a["emit name entry hidden"]);
  
    a["install score entry"]();
    
    return { $$emit : "high scores requested" };
    
    //a["initialize name"](data);
    
  },
  
  /*
  a["emit submit name"] = function () {
      gcd.emit("name submitted", data);
  };*/

  "show tweets" : function () {
    $('#modal-tweet').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    gcd.ret({$$emit : "tweets shown"});
  },



  "request tweet" : function() {
    gcd.ret({$$emit : "tweet requested"});
  },

   "send tweet" : [["deck", "score", "type", "wilds"], 
    function me (deck, score, type, wilds) {
      console.log("tweet clicked");
      var gameurl = encodeURI("http://goodloesolitaire.com/")+encodeURIComponent("?"+
          "seed="+deck.seed+
          "&moves="+deck.moves.join("")+ //deck.movesList()
          "&type="+type+
          "&wilds="+wilds);
      var text = encodeURIComponent("Scored "+score+" playing "+type); 
      var twitterurl = "https://twitter.com/intent/tweet?screen_name=gsolitaire&text="+text+"&url="+gameurl;
    //     var newwindow= window.open(twitterurl,'name','height=200,width=150');
   //   if (window.focus) {newwindow.focus();}
      var width  = 575,
          height = 400,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1' +
                   ',width='  + width  +
                   ',height=' + height +
                   ',top='    + top    +
                   ',left='   + left;
      var twitterwindow = window.open(twitterurl, 'twitter', opts);
      if ((twitterwindow === null) || (twitterwindow.closed) ) {
        //popup not open
        $("#tweetgamelink").attr("href", twitterurl).click();
      }
 
      return false;

    }
  ],

  "retrieve high scores for viewing" : function () {
    gcd.ret({$$once : { "high scores checked" : "display high scores" }, 
      $$emit : "high scores requested" });
  },
  
  "name entry requested" : function () {
    $('#scoreentry').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });
    gcd.ret({$$emit : "name entry shown"});
  },
  
  "hide name entry" : function () {
    $("#scoreentry").modal('hide');
  },
  
  "emit name entry hidden" : function () {
    gcd.ret({ $$emit : "name entry hidden" });
  },
  
  "keys for name entry" : function  (evnt) {
    if (evnt.keyCode === 13) {
      a["hide name entry"]();
      return false;
    } 
  }
  
};

