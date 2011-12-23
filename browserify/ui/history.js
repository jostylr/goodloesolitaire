/*globals $, module, console, require*/

var file = 'ui/history: ';

var a, b;


module.exports = function (gcd) {
  gcd.install(file, a);  
};


b = {
  "assemble the hand's short call" :  function (hand) {
    var i, n, c, shc; 
    n = hand.length; 
    shc = '';
    for (i= 0; i <n; i += 1) {
      c = hand[i];
      if (c[0] === "new") {
        shc += " <strong>"+c[1][0] +c[1][1]+"</strong> ";          
      } else {
        shc += " " + c[1][0] + c[1][1] + " ";                
      }
    }
    return shc; 
  },
  
  'generate delta label' : function (delta) {
    if (delta > 0) {
      return "class='label success'>&#x25B2;"+delta;
    } else if (delta <0 ) {
      return "class='label important'>&#x25BC;"+(-1*delta);
    } else {
      return "class='label' >▬";
    }
  }
  
};


a = {
  'empty history body' :  function () {
    $('#history table tbody').empty();
  },
  
  
  'add row to history' :  [ ["historycount", "score", "shortcall",
                              {$$transform: [b['generate delta label'], "delta"]},
                              {$$transform: [b["assemble the hand's short call"],  "shorthand"]}],  
    function (historycount, score, shortcall, deltalabel, shorthand) {
      $('#history table tbody').prepend(
        "<tr><td>" + historycount + ".</td><td>" +
        score + "</td><td><span " + deltalabel + "</span></td><td class='left'>" +
        shorthand + "</td><td>" + shortcall + "</td></tr>"
        );    
    }] 
  
};



