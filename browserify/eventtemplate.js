/*globals $, module, console, require*/

var file = 'type/name: ';

var gcd;

var a, install;

module.exports = function (gcde, data) {
  gcd = gcde;
  
  install(data);
  
};

a = {
  
};


install = function (data) {
  
  var fname; 

  for (fname in a) {
    a[fname].desc = file+fname;
  }  
};

