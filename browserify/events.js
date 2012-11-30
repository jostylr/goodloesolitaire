/*globals $, module, console, require*/

module.exports = function (gcd) {
  gcd.ret( { $$on : {
    "ready" : [
      "initialize values",  // logic/gamecontrol:
      "initialize score data", // logic/scores:
      "initialize game clicks, hide stuff", // ui/gamecontrol: 
      "initialize draw card click, hide hail, hand", // ui/hand:   
      'initialize name/score clicks, modals, high scores', // ui/scores:
      "check if old game" // logic/gamecontrol:
    ],
    "old game data successfully processed" : [
      //"Add brand new/replay/review buttons"
    ],
    "new game requested" : [                                    
      "start new game"  // logic/gamecontrol: "game started"
      
    ],
    "game started" : [
      "zero history count", // logic/history:
      "negate oldhand",   // logic/history:
      'empty history body', // ui/history:
      "reset hand state", // logic/hand: 
      "remove main fade", // ui/gamecontrol: 
      "clear streak", // ui/scores: 
      "load type", // logic/gamecontrol !!!!!  basic, ...  and wilds see cardutil "enable, disable"

      "note new hand", // logic/hand: 
      "analyze hand", //util/cardutil: hand analyzed
      "install endgame", // ui/gamecontrol: 
      "bind hand keys", // ui/gamecontrol: 
      "remove main fade", // ui/gamecontrol: 
      "load hand", // ui/hand: "hand loaded" 
      "update number of cards left" // ui/hand: 
      //"pulse positive score"// ui/scores: 
    ],
    "hand analyzed" : [
      "compare hands"  // util/cardutil: "hand compared"
    ],
    "hands compared" : [
      "compute score"  //logic/compute_score
    ],
    "score computed" : [
      "check delta",  //  logic/scores: "(negative OR positive OR no) change in score"
      "check for streak", // logic/scores: "streak" OR ""
      "update hash" // logic/gamecontrol
    ],
    "card clicked" : [
      "toggle draw cards" // ui/hand: "not enough cards left"
    ],
    "draw cards requested" : [
      "increment history count", // logic/history:
      "assemble drawn cards", // ui/hand: "no discarded cards"  OR "cards discarded"
      "clear streak" // ui/scores:       
    ],
    "cards drawn" : [
      "check for cards left" , // logic/hand:  // IF cards <=0, "no cards left to draw"
      "load hand", // ui/hand: 
      "update number of cards left", // ui/hand:
      "analyze hand"    //util/cardutil     
    ],
    "miagan" : [ 
      "display miagan" // ui/hand: 
    ],
    "hail mia" : [ 
      "display hail mia" // ui/hand: 
    ],
    "mulligan" : [ 
      "display mulligan" // ui/hand: 
    ],
    "hail mary" : [ 
      "display hail mary" // ui/hand: 
    ],
    "hail call checked" : [ 
      "note old hand" // logic/hand:
    ],
    "cards discarded" : [
      "draw cards",  // logic/gamecontrol: "server drew cards" OR "failed to draw cards"
      "check for a hail call", // logic/hand: "hail call checked" AND MAYBE "miagan", "mulligan", "hail mia", "hail mary"
      "use backing for discarded cards" // ui/hand:     
    ],
    "hand loaded" : [
      "restore cards", // ui/hand: 
      "make full hand call" // ui/hand: 
      //"show hand" // ui/hand: added by hide hand
    ],
    "no cards left to draw" : [
      "end the game", // logic/hand: 
      "remove deck" // ui/hand: 
    ],
    "negative change in score" : [ 
      "pulse negative score"// ui/scores: "score loaded"
    ],
    "positive change in score" : [ 
      "pulse positive score"  // ui/scores: "score loaded"
    ],
    "no change in score" : [ 
      "no score change"    // ui/scores: "score loaded"
    ],
    "score loaded" : [ 
      "process row data"  // logic/scores: "add history"
    ],
    "streak" : [ 
      "call streak" // ui/scores: 
    ],
    "add history" : [ 
      'add row to history' // ui/history: ""
    ],
    "end game requested" : [
      //"add listener to show high scores",// ui/scores: ONCE "high scores checked"
      "install startgame", // ui/gamecontrol: 
      "unbind hand keys", // ui/gamecontrol: 
      "remove listen for name entry", // ui/gamecontrol: REMOVE "name entry shown", REMOVE "name submitted"
      "fade main" // ui/gamecontrol: "main is faded"      
      //"check score/name"  // logic/scores: "name requested for high score" OR "no highscore at end of game"
        // above removed by 'remove score/name'
        //ON "end game requested", a["send end game"] // logic/gamecontrol: added by "attach end to request"
    ],
    "tweet requested" : [
      "send tweet" //ui/scores
    ],
    "replay game requested" : [
      "replay old game"
    ]
  } 
});

};