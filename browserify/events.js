/*globals $, module, console, require*/

module.exports = function (gcd) {
  var a = gcd.a;
  
  gcd.on("ready"                          , a["initialize values"]);  // logic/gamecontrol:
  gcd.on("ready"                          , a["initialize score data"]); // logic/scores:
                                          
                                          
  gcd.on("new game requested"             , a["zero history count"]); // logic/history:
  gcd.on("new game requested"             , a["negate oldhand"]);   // logic/history:
  gcd.on("new game requested"             , a['empty history body']); // ui/history:
  gcd.on('new game requested'             , a["send new game"]);  // logic/gamecontrol: "server started new game" OR "new game denied"
  gcd.on("new game requested"             , a["reset hand state"]); // logic/hand: 
  
  gcd.on("server started new game"        , a["note new hand"]); // logic/hand: 
  
                                          
  gcd.on("draw cards requested"           , a["increment history count"]); // logic/history:
  gcd.on("server drew cards"              , a["check for cards left" ]); // logic/hand:  // IF cards <=0, "no cards left to draw"
  gcd.on("hail call checked"              , a["note old hand"]); // logic/hand: 
  
  gcd.on('cards discarded'                , a["send draw cards"]);  // logic/gamecontrol: "server drew cards" OR "failed to draw cards"
  gcd.on("cards discarded"                , a["check for a hail call"]); // logic/hand: "hail call checked" AND MAYBE "miagan", "mulligan", "hail mia", "hail mary"



  gcd.on("server drew cards"              , a["check delta"]);  //  logic/scores: "(negative OR positive OR no) change in score"
  gcd.on("server drew cards"              , a["check for streak"]); // logic/scores: "streak" OR ""
                             
  gcd.on("no cards left to draw"          , a["end the game"]); // logic/hand: 
                                          
                                          
  gcd.on("score loaded"                   , a["process row data"]);  // logic/scores: "add history"
  gcd.on("add history"                    , a['add row to history']); // ui/history: 
  
  gcd.on("end game requested"             , a["check score/name"]);  // logic/scores: "name requested for high score" OR "no highscore at end of game"
  // above removed by 'remove score/name'
  //ON "end game requested", a["send end game"] // logic/gamecontrol: added by "attach end to request"
  
  gcd.on("server ended game"              , a["look for new high scores"]); // logic/scores:  "high scores checked"

  gcd.on('name requested for high score'  , a["watch name to send end game"]); // logic/scores: once

  gcd.on("name submitted"                 , a["attach end to request"]); // logic/gamecontrol: removeListerner, on
  gcd.on("name submitted"                 , a["remove score/name"]); // logic/scores: removeListener
  // ONCE "name submitted", a["send end game"]  // logic/gamecontrol: added by "watch name to send end game"
  
  
  gcd.on('no highscore at end of game'    , a["send end game"]); // logic/gamecontrol: "server ended game" OR "end game denied"
  //above removed by "attach end to request" 

  gcd.on('high scores requested'          , a["send view scores"]); // logic/gamecontrol: "server sent high scores" OR "view scores denied"
  
  gcd.on("server sent high scores"        , a["look for new high scores"]);  // logic/scores: "high scores checked"
  
  
};
  
