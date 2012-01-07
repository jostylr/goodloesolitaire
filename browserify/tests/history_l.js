/*globals require, exports */

var ev = require('events');

var gcd = new ev.EventEmitter();
var ui = new ev.EventEmitter();

require('../logic/history.js')(gcd, ui);

exports.history = function(test) {
  test.expect(2);
  ui.on('add history', function (info) {
    test.equal("hi", "hi");
    test.deepEqual(info, { num: 1,
      score: 230,
      deltalablel: undefined,
      hand: 
       [ 'old',
         [ 'T', '&#x2666;' ],
         'old',
         [ 'K', '&#x2666;' ],
         'old',
         [ '2', '&#x2663;' ],
         'old',
         [ '9', '&#x2666;' ],
         'old',
         [ 'J', '&#x2666;' ] ],
      call: 'SF' }, 'add history emitted');
    test.done(); 
  });
  
  gcd.emit('clear history');
  gcd.emit('prep for add history', {
    score: 230, 
    deltalablel: "t",
    hand: ["Td", "Kd", "2c", "9d", "Jd"], 
    call: ["sf", "K"]
  });
};

