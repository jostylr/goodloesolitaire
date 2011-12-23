/*globals $, module, console, require*/

module.exports = function (gcd) {
  var a = gcd.a;
  
  gcd.on("new game requested", a['empty history body']); //

  gcd.on("add history", a['add row to history']); //
  
  
};

