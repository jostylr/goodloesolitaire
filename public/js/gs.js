/*global $, console */

$(function() {  
	
	var server = 'http://127.0.0.1:3000/';
	
	var uid = '0';
	var gid = '0';
	
	var put = function (command, data, callback) {
		$.ajax(server + command, {
			type: 'POST',
			data: JSON.stringify(data),
			contentType: 'application/json',
			dataType: "json",
			success: callback || function (data, status) {console.log(command, data, status);},
			error  : function() { console.log("error response"); }
		});
	};
	
	var get = function (command, callback) {
		$.ajax(server + command, {
			type: 'GET',
			contentType: 'application/json',
			dataType: "json",
			success: callback || function (data, status) {console.log(command, data, status);},
			error  : function() { console.log("error response"); }
		});
	};

	//testing
	var dc = ["01000",
	      "01100",
	      "11111",
	      "01000",
				"00110"];
	
	
	
	var commands = {
		'shuffle' : function (type) {
			//presend
			get('shuffle/'+uid+'/'+type, function (data) {
				//postsend
				console.log(JSON.stringify(data));
				gid = data.gid;
				if (dc.length) {commands.drawcards(dc.pop());}
			});
		},
		'drawcards' : function (draws) {
			get('drawcards/'+uid+'/'+gid+'/'+draws, function (data){				
				if (dc.length) {
					commands.drawcards(dc.pop());
				} else {
					commands.retrievegame(gid);
				}
				console.log(JSON.stringify(data));
			});	
		}, 
		'endgame' : function () {
			get('endgame/'+uid+"/"+gid, {}, function (data){
				console.log(JSON.stringify(data));
				commands.viewscores(); 
			});
		},
		'retrievegame' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
				commands.endgame();
			});			
		},
		'viewscores' : function () {
			get('viewscores', function (data) {
				console.log(JSON.stringify(data));				
			})
		}
		
	};

	
	commands.shuffle('basic'); 
	commands.viewscores(); 
	
        //setup 
	var fadelevel = 0.4;

	$(".main").fadeTo(100, fadelevel);	

   $("#history").children('h1').click(function() {$(this).siblings('table').toggleClass('hide')});     

   $('#hand li ').live('click', function (event) {
			var this$ = $(this);
      this$.toggleClass('draw')
			var inp$ = this$.children('input'); 
			inp$.attr('checked', !inp$.attr('checked'));
       }).addClass('hide');
//  $('#hand').sortable();

//  stuff to show after game starts
  $('.start').addClass('hide'); 

  //scores  
  $('.s').addClass('hide');

  $('#nocards').addClass('hide');

//hailsetup  
makecall= function (domid){  
     $(domid).fadeIn(600).fadeOut(600); 
};
 
$('#hail >span').hide(); 


scoreentrysubmit = function  (evnt) {
 if (evnt.keyCode == 13) {
		 $("input[name=submitname]").click(); 
     return false;
 }; 
}

 //end game  
namescore = function (type) {
		submitScore(); 
		$(".main").fadeTo(200, fadelevel);
	 //$('#scoreentry').removeClass('hide');
   $('html').unbind('keyup', akeys); 
   $('html').bind('keyup', scoreentrysubmit); 
   keyun = true; 
   $('input[name=name]').focus(); 
 };

inarow = function (streak, level, typechange) {
	var streaktext;
 switch (typechange) {
	case 'newup':
		scoredata.push([1, streak, level, typechange]);
		streaktext = "&nbsp;";
	break;
	case 'up' :
		scoredata.push([scoredata[scoredata.length-1][0]+1, streak, level, typechange]);
		streaktext = streak+" in a row"+ (level ? " with a bonus of "+level+"!" : "!");
	break;
	case 'newdown':
		scoredata.push([-1, streak, level, typechange]);
		streaktext = "&nbsp;";
	break;
	case 'down':
		scoredata.push([scoredata[scoredata.length-1][0]-1, streak, level,typechange]);
		streaktext = "&nbsp;";
	break;
	case 'null' :
		scoredata.push([scoredata[scoredata.length-1][0], streak, level,typechange]);
		streaktext = "&nbsp;";
	break;
 }
 $('#inarow').html(streaktext);
}; 

//pass in a function f that has its second and third arguments the streak and level. 
scorefun = function (f) {
	var i;
	var n = scoredata.length; 
	var deltas = [];
	var score =0;
	var store = {}; 
	var prelevel; 
	for (i = 0; i<n; i += 1) {
		deltas.push(f(scoredata[i], i, n, store));
		score += f(scoredata[i], i, n, store);
	}
	return JSON.stringify([score, deltas]);
}


//data consists of [runlength, "streak", level, typechange]
runscorefun = function (mult) {
	mult = mult || 100;
	var funs = {
	"100 * S" : function (data) {
		if (data[3] === "null") {return 0;}
		return mult*data[0];
 	},
	"100 * S^2" : function (data) {
		if (data[3] === "null") {return 0;}
		var s = data[0];
		return mult*s*s*s/Math.abs(s);
 	},
	"100 * (2^S)": function (data) {
		if (data[3] === "null") {return 0;}
		return mult*Math.pow(2, data[0]);
 	},
	"100 * (S+LP)": function (data) {
		if (data[3] === "null") {return 0;}
		return mult*data[1];
 	},

	"100 * (2^S + LC)": function (data) {
		if (data[3] === "null") {return 0;}
		if ((data[3] === "newup") || (data[3] === "newdown")) {
			return mult*Math.pow(data[0], 2); 
		}
		return mult*Math.pow(data[0], 2)+data[2];
 	},

	"100 * (2^S * LC)": function (data) {
		if (data[3] === "null") {return 0;}
		if ((data[3] === "newup") || (data[3] === "newdown")) {
			return mult*Math.pow(data[0], 2); 
		}
		return mult*Math.pow(data[0], 2)*data[1];
 	},
 "100 * (2^(S+LP))"	: function (data) {
		if (data[3] === "null") {return 0;}
		return mult*Math.pow(2, data[1]);
 	},

	"100 * (S + LP)^2": function (data) {
		if (data[3] === "null") {return 0;}
		return mult*data[0]/Math.abs(data[0])*data[1]*data[1];
 	}
};
	var lab;
	for (lab in funs) {
		console.log(lab, scorefun(funs[lab]));
	}
};

scorepulse = function (scoreclass) {
	$('#score, #delta').removeClass("scoreminus scoreplus");
	setTimeout(function () {$('#score, #delta').addClass(scoreclass)}, 5);
}


loadscorescleargame = function () {
		$(".main").fadeTo(600, fadelevel, function () {$('#modal-highscores').modal({
			backdrop: true,
			keyboard: true,
			show: true
		});}); 
    $('input[name=gid]').val('');
    $('#nocards').addClass('hide');
    if (keyun) {$('html').bind('keyup', akeys); keyun=false;};
 };

loadscores = function () {
	//$("#highscores").click(); 
}

/*
loadscores = function () {
    $('.s').removeClass('hide');
    $('#nonscore').addClass('fade'); 
    $('body').one('click',function (){ 
            $('#nonscore').removeClass('fade'); 
            $('.s').addClass('hide'); 
            });
 };
*/



$('#gs').ajaxForm({});  

//removes block on completion of previous submission
completesub = function() {
  block = false; 
  $('input[name=action]').val('none');
  $('.backing').removeClass('backing');	
};

dosub = function (subtype) {
           $('input[name=action]').val(subtype);
           $('#gs').ajaxSubmit({complete: completesub}) 

};

block=false; 

//handles submission 
ajsub = function (subtype) {
 if (!block) {
  block=true;    
  switch (subtype) {
    case 'shuffle': 
           //if viewing scores do not load new game
           if ($('#nonscore').filter('.fade').size() > 0) {block=false; return false;}
           //clear old game id
           $('input[name=gid]').val('');
           $('#history table').empty();
					 $(".main").fadeTo(200, 1);
           $('.s').addClass('hide');
           $('#nocards').addClass('hide');
           dosub('shuffle');
           $("#hand li").children('input').clearFields().end().removeClass('draw').removeClass('backing');
           $('.tomove').removeClass('tomove'); 
					//clear old score info or initialize. see inarow and scorefun
					scoredata =[];
    break; 
    case 'drawcards':
                 //if viewing scores do not draw cards
//                 if ($('#nonscore').filter('.fade').size() > 0)  {block=false; return false;} 
                // if ($('#numcards').text() ==0) {$('#nocards').removeClass('hide'); block=false; return false;}
							 //do hail mia stuff; committed to submitting
							  switch ( ($("li > input").fieldValue()).length) {
							    case 4: 
							     if ($("#count").val() >1) 
							         {makecall('#dr4');}
							    else {makecall('#m4');}
							   break;
							   case 5: 
							     if ($("#count").val() >1) 
							         {makecall('#dr5');}
							    else {makecall('#m5');}
							   break;
							  };
                 //submit form using trash for action designation
                 dosub('drawcards'); 
								$(".draw").addClass('backing');	
                  $("#hand li").children('input').attr('checked', false); //.end().removeClass('draw');
    break; 
    case 'endgame': 
           //if (($('#nonscore').filter('.fade').size() > 0) ||($('input[name=gid]').val()=='')) {block=false; return false;}
           dosub('endgame'); 
           $("#hand li").removeClass('draw').removeClass('backing');
    break; 
    case 'viewscores':
          dosub('viewscores'); 
    break;                 
    case 'submitname':
          if ($('input[name=gid]').val()=='') {block=false; return false;}
					$('input[name=name]').val($('input[name=namemodal]').val());
          dosub('submitname'); 
					$('#scoreentry .close').click();
          if (keyun) {
            $('html').bind('keyup', akeys); 
            $('html').unbind('keyup', scoreentrysubmit); 
            keyun = false; 
          };
    break;                   

  };
 }   

};

runoutofcards = function () {
	setTimeout(function () {$('input[name=endgame]').click()}, 800);
}

//assign click functionality to all of these buttons
$.each(['shuffle', 'drawcards', 'endgame', 'viewscores', 'submitname'], 
        function (key,value) {
          $('input[name='+value+']').click(function () {ajsub(value); return false;});
          }
      ); 

$("#newgame").live('click', function() {$('input[name=shuffle]').click(); });
$("#highscores").click(function() {$('input[name=viewscores]').click(); });
$("#drawcards").click(function() {$('input[name=drawcards]').click(); });
$("#endgame").live('click', function() {$('input[name=endgame]').click(); });

akeys = function (evnt) {
        var key = evnt.keyCode; 
       switch (key) {
        case 49: $('#hand li:nth-child(1)').click(); break;//1 card as visible
        case 50: $('#hand li:nth-child(2)').click(); break;
        case 51: $('#hand li:nth-child(3)').click(); break;
        case 52: $('#hand li:nth-child(4)').click(); break;
        case 53: $('#hand li:nth-child(5)').click(); break;
        case 13: $('#drawcards').click(); return false; break; //space drawcards
       };

};

var keyun = false; 
$('html').bind('keyup', akeys);


}); //end ready function 
