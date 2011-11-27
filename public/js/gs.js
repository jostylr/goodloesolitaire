/*global $, console */

$(function() {
	
	//!!!! initial values
	var server = 'http://127.0.0.1:3000/';	
	var uid = '0'; //set by server
	var gid = '0'; //set by server
	var type = 'basic'; //toggle options
	var scoredata = [];
	
	//!!!! fading
	var fadelevel = 0.4;

	//initial screen faded
	$(".main").fadeTo(100, fadelevel);
	
	
	//remove fade
	var removeFade =  function  () {
		$(".main").fadeTo(200, 1);
	};
	
	
	//!!!! history
	var clearHistory = function () {
		$('#history table').empty();
	};
  
	var addHistory = function (data, deltalabel) {
		
	};
	
  
	
	//!!!! card management
	//clicking cards
  $('#hand li').click(function (event) {
			var this$ = $(this);
      this$.toggleClass('draw');
   });
	
	
	var deck = ["2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  
					"6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s", 
				  "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks", 
				  "Ac",  "Ad",  "Ah",  "As"
				];
	
	//computes card image given card
	var computeCard = function (card) {
		var i;
		for (i = 0; i<52; i+=1) {
			if (card === deck[i]) {
				return [(i % 8)*86, Math.floor(i/8)*120];
			}
		}
		console.log("card not found", card);
		return [0, 0];
	};
		
	var clearCards = function () {
		$('#hand li').
			removeClass('draw').
			removeClass('backing')
		;
	};
		
	var showHand = function () {
		$("#hand").show(); 
	};
		
	var hideHand = function () {
		$("#hand").hide(); 
	};
	
	//----  no hand view on startup
	hideHand(); 
	
	
	//cards get hand
	var loadHand = function (hand) {
		$('#hand li').each(function () {
			var cardnum = this.id[4]-1;
			var pos = computeCard(hand[cardnum]);
			$(this).
				css("background-position", "-"+pos[0]+"px -"+pos[1]+"px").
				removeClass('draw').
				removeClass('backing')
			;
		});
	};
	
	//!!!! scoreManagement	
	var inarow = function (streak, level, typechange) {
		var streaktext;
		if (typechange === 1) {
			scoredata.push([1, streak, level, typechange]);
			streaktext = "&nbsp;";			
		} else if (typechange > 1) {
			scoredata.push([scoredata[scoredata.length-1][0]+1, streak, level, typechange]);
			streaktext = streak+" in a row"+ (level ? " with a bonus of "+level+"!" : "!");			
		} else if (typechange === -1) {
			scoredata.push([-1, streak, level, typechange]);
			streaktext = "&nbsp;";			
		} else if (typechange < -1) {
			scoredata.push([scoredata[scoredata.length-1][0]-1, streak, level,typechange]);
			streaktext = "&nbsp;";			
		} else if (typechange === 0) {
			scoredata.push([scoredata[scoredata.length-1][0], streak, level,typechange]);
			streaktext = "&nbsp;";			
		}
	  $('#inarow').html(streaktext);
	}; 

	var scorepulse = function (scoreclass) {
		$('#score, #delta').removeClass("scoreminus scoreplus");
		setTimeout(function () {$('#score, #delta').addClass(scoreclass);}, 5);
	};

	var loadScore = function (data) {
		$("#score").html(data.gamedata.score);
		var delta = data.delta;
    if (delta > 0) {
			 $("#delta").html("&#x25B2;"+delta);
			 addHistory(data, "class='label success'>&#x25B2;"+delta);
			 scorepulse('scoreplus');
			inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
    } else if (delta < 0) {
			 $("#delta").html("&#x25BC;"+(-1*delta));
			 addHistory(data, "class='label important'>&#x25BC;"+(-1*delta));
			 scorepulse('scoreminus');
			inarow(data.gamedata.streak, data.gamedata.level, data.gamedata.streak);
    } else {
			 $("#delta").html("▬");
			 addHistory(data, "class='label'>▬");
			 scorepulse('');
			inarow(data.gamedata.streak, data.gamedata.level, 0);	
		}
	};

	
	
		
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

	
	var commands = {
		'shuffle' : function () {
			 clearHistory(); 
			 removeFade();
			//presend
			get('shuffle/'+uid+'/'+type, function (data) {
				//postsend
				console.log(JSON.stringify(data));
				gid = data.gid;
				loadHand(data.hand);
				showHand(); 
				loadScore(data);
	      
			});
		},
		'drawcards' : function () {
			//get draws
			var draws = '';
			var nocards = true;
			$("#hand li").each(function (){
				if ($(this).hasClass('draw')) {
					draws += '1';
					nocards = false;
				} else {
					draws += '0';
				}
			});
			if (nocards) {
				console.log("no cards selected."); 
				clearCards(); 
				return false;
			}
			get('drawcards/'+uid+'/'+gid+'/'+draws, function (data){
				if (data.error) {
					console.log(data.error); 
					clearCards(); 
					return false;
				}
				console.log(JSON.stringify(data));
				loadHand(data.hand);
				loadScore(data);
				
			});	
		}, 
		'endgame' : function () {
			get('endgame/'+uid+"/"+gid, {}, function (data){
				console.log(JSON.stringify(data));
			});
		},
		'retrievegame' : function (gid) {
			get('retrievegame/'+gid,  function (data){				
				console.log(JSON.stringify(data));
			});			
		},
		'viewscores' : function () {
			get('viewscores', function (data) {
				console.log(JSON.stringify(data));				
			});
		}
		
	};
	
	
	
	
	//clicking events:




	//effects: 
	
	//hail call
	makecall= function (domid){  
     $(domid).fadeIn(600).fadeOut(600); 
	};

	$('#hail >span').hide(); 


	//not needed in future
	scoreentrysubmit = function  (evnt) {
 		if (evnt.keyCode == 13) {
		 	$("input[name=submitname]").click(); 
     	return false;
 		} 
	};

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

$("#newgame").click(commands.shuffle);
$("#highscores").click(function() {$('input[name=viewscores]').click(); });
$("#drawcards").click(commands.drawcards);
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
