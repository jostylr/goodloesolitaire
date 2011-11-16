$(function() {  
        //setup 
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
     $(domid).removeClass('hide');
     setTimeout(function(){$(domid).addClass('hide')}, 1000);
     }; 
$('#hail >span').addClass('hide'); 


scoreentrysubmit = function  (evnt) {
 if (evnt.keycode == 13) {
     console.log(evnt.keycode);
     ajsub('submitname');
     return false;
 }; 
}

 //end game  
namescore = function (type) {
   $('#scoreentry').removeClass('hide'); 
   if (type =='low') 
        {$('#lows').removeClass('hide');}
   else {$('#high').removeClass('hide');}
   $('html').unbind('keyup', akeys); 
   $('html').bind('keyup', scoreentrysubmit); 
   keyun = true; 
   $('input[name=name]').focus(); 
 };


inarow = function (streak, level) {
  if (streak >= 1) { $('#inarow-container').html("<span id='inarow'>Streaking Power: "+ streak+" Level Change: "+level+"</span");}
  if (streak <= -1) { 
//      var txt = 'D\'oh!';
//      for (var i=-1; i>num; i-- ) {txt += 'D\'oh!';}
      $('#inarow-container').html("<span id='inarow'>Point Drain: "+streak+" Level Change: "+level+"</span>");
  };
 // setTimeout(function(){$('#inarow').empty()}, 1000);
 scoredata.push([streak, level]);
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
		//streak, level
		if (i== 0) {
			prelevel = 0;
		} else {
			prelevel = scoredata[i-1][1];
		}
		deltas.push(f(scoredata[i][0], scoredata[i][1], prelevel, i, n, store));
		score += f(scoredata[i][0], scoredata[i][1], prelevel, i, n, store);
	}
	return JSON.stringify([score, deltas]);
}

scorepulse = function (scoreclass) {
	$('#score, #delta').removeClass("scoreminus scoreplus");
	setTimeout(function () {$('#score, #delta').addClass(scoreclass)}, 5);
}


loadscorescleargame = function () {
   // $('#scoreentry').remove(); 
    $('.s').removeClass('hide');
    $('input[name=gid]').val('');
   $('#hand li').addClass('hide');
   // $('.start').addClass('hide');
    $('#nocards').addClass('hide');
		
    $('#nonscore').addClass('fade'); 
    $('body').one('click',function (){ 
            $('#nonscore').removeClass('fade'); 
            $('.s').addClass('hide'); 
            });
   // $('#numcards').remove(); 
    if (keyun) {$('html').bind('keyup', akeys); keyun=false;};
 };

loadscores = function () {
    $('.s').removeClass('hide');
    $('#nonscore').addClass('fade'); 
    $('body').one('click',function (){ 
            $('#nonscore').removeClass('fade'); 
            $('.s').addClass('hide'); 
            });
 };

//switching their order
switchcards = function (card) {
    var a = ($('.tomove'))[0]
    if (!(a)) {      
       $('#hand li:nth-child('+card+')').addClass('tomove'); 
    } else {
      current = $('#hand li').index(a) +1;
      cardcur = card; 
      if (card < current) {
        $(a).removeClass('tomove').insertBefore('#hand li:nth-child('+card+')');
      } else {
        $(a).removeClass('tomove').insertAfter('#hand li:nth-child('+card+')');
      }
    };
  };


$('#gs').ajaxForm({});  

//removes block on completion of previous submission
completesub = function() {
  block = false; 
  $('input[name=action]').val('none');
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
           $('.s').addClass('hide');
           $('#nocards').addClass('hide');
           dosub('shuffle');
           $("#hand li").children('input').clearFields().end().removeClass('draw');
           $('.tomove').removeClass('tomove'); 
					//clear old score info or initialize. see inarow and scorefun
					scoredata =[];
    break; 
    case 'drawcards':
                 //if viewing scores do not draw cards
                 if ($('#nonscore').filter('.fade').size() > 0)  {block=false; return false;} 
                 if ($('#numcards').text() ==0) {$('#nocards').removeClass('hide'); block=false; return false;}
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
                  $("#hand li").children('input').attr('checked', false).end().removeClass('draw');
                  $('.tomove').removeClass('tomove'); 
    break; 
    case 'endgame': 
           if (($('#nonscore').filter('.fade').size() > 0) ||($('input[name=gid]').val()=='')) {block=false; return false;}
           dosub('endgame'); 
    break; 
    case 'viewscores':
          dosub('viewscores'); 
    break;                 
    case 'submitname':
          if (($('#scoreentry').filter('.hide').size() > 0) ||($('input[name=gid]').val()=='')) {block=false; return false;}
          dosub('submitname'); 
          if (keyun) {
            $('html').bind('keyup', akeys); 
            $('html').unbind('keyup', scoreentrysubmit); 
            keyun = false; 
          };
          $('#scoreentry').addClass('hide'); 
          $('#lows').addClass('hide');
          $('#high').addClass('hide');
    break;                   

  };
 }   

};

//assign click functionality to all of these buttons
$.each(['shuffle', 'drawcards', 'endgame', 'viewscores', 'submitname'], 
        function (key,value) {
          $('input[name='+value+']').click(function () {console.log(value); ajsub(value); return false;});
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
        case 54: switchcards(1); break;//visible 1 card to be moved                 
        case 55: switchcards(2); break;//visible 2 card to be moved                 
        case 56: switchcards(3); break;//visible 3 card to be moved                                  
        case 57: switchcards(4); break;//visible 4 card to be moved                                  
        case 48: switchcards(5); break;//visible 5 card to be moved                                                   
        case 27: $('body').click(); break; //esc clicks on the body                 
        case 72: $('#history >h1').click(); break;//h history         
        case 83: ajsub('shuffle'); break;//s shuffle
        case 32: ajsub('drawcards'); return false; break; //space drawcards
        case 77: ajsub('drawcards'); break; //m drawcards
        case 69: ajsub('endgame'); break; //e end game
        case 86: ajsub('viewscores'); break; //v view scores                 
       };

};

var keyun = false; 
$('html').bind('keyup', akeys);


}); //end ready function 
