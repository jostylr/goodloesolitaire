<?php header('Content-type: text/xml'); 
 header("Access-Control-Allow-Origin: *");

$curdec = 0; #coopted to be in a row
$curmult = 0;
$score = 0;
$scoinc =50;
$base = 1.73; #this is the boost factor

$hand_ord_tv =  array ("5"=>10, "sf"=>9, "4"=>8, "fh"=>7, "f"=>6, "s"=>5,
              "3"=>4, "2p"=>3, "2"=>2, "1"=>1);

$hand_ord_vt = array_reverse(array ("5", "sf", "4", "fh", "f", "s",
                                 "3", "2p", "2", "1"));


$numb_ord_tv =  array ("A"=>12, "K"=>11, "Q"=>10, "J"=>9, "0"=>8, "9"=>7,
              "8"=>6, "7"=>5, "6"=>4, "5"=>3, "4"=>2, "3"=>1, "n"=>0);

$numb_ord_vt = array_reverse (array("A", "K", "Q", "J", "0", "9",
                                 "8", "7", "6", "5", "4", "3", "n")); 

$suits = array ("s", "h", "d", "c");

$cardListing = array("2c",  "2d",  "2h",  "2s",  "3c",  "3d",  "3h",  "3s",  "4c",  "4d",  "4h",  "4s",  "5c",  "5d",  "5h",  "5s",  "6c",  "6d",  "6h",  "6s",  "7c",  "7d",  "7h",  "7s",  "8c",  "8d",  "8h",  "8s",  "9c",  "9d",  "9h",  "9s",  "Tc",  "Td",  "Th",  "Ts",  "Jc",  "Jd",  "Jh",  "Js",  "Qc",  "Qd",  "Qh",  "Qs",  "Kc",  "Kd",  "Kh",  "Ks",  "Ac",  "Ad",  "Ah",  "As");

function cardImage ($card) {
    GLOBAL $cardListing; 
    $rank =''; 
    switch ($card[0]) {
    case "0": $rank = "T"; break;
    case "n": $rank = "2"; break;
        
    default : $rank = $card[0]; 
    };
    $suit = $card[1];
    $position = array_search($rank.$suit, $cardListing); 
    $column = ($position % 8)*86;
    $row = floor($position/8)*120; 
    return "-${column}px -${row}px"; 
}



#takes in hand, where to replace, and deck and changes hand, deck
function replace(&$hand, $del, &$deck) {
  if (count($del) >5) {print "Drop at most 5!\n"; return;};
  foreach ($del as $place) {
    if (($place >= 0)  && ($place <= 6)) {$hand[$place] = array_pop($deck); }; 
  };
    return; 
};

#takes in a hand and prints out a string
function strhand ($hand) {
    $str =''; 
    foreach ($hand as $card) {
        $str .= $card[0].$card[1].' ';
    }
    return $str; 
}

#prints hand and numbers it (not really needed in the end)
function phand ($hand) {
  print strhand($hand)."\n";
#  print "0  1  2  3  4 \n";
};

#checks for flush; if so, returns lowest value (val 8 is a 10)
function flushc ($hand, $ord) {
  $wilds = 0; 
  while ($hand[0][0] == "n") {
    $wilds++;
    array_shift($hand);
  };
  $lowcard = (array_shift($hand));
  $suit = $lowcard[1];
  foreach ($hand as $card) {
    if ($suit !=  $card[1]) {return 0;};
  };
  $value = $ord[$lowcard[0]]; 
  if ($value >= 8) {
    return 8;
  } else {
    return $value;
  };
}

#is it a straight? returns high card
function straight ($hand, $ord) { 
  $wilds = 0; 
  while ($hand[0][0] == "n") {
    $wilds++;
    array_shift($hand);
  };
  $highcard = (array_pop($hand));
  $value = $ord[$highcard[0]];
  foreach (array_reverse($hand) as $card) {
    $newvalue = $ord[$card[0]];
    $diff = $value - $newvalue-1;
    if ($diff <0) {return 0;}; #not a straight if next card is same value
    $wilds = $wilds - $diff; #use wilds to compensate for differences
    if ($wilds >= 0)  { 
      $value = $newvalue; 
    } else { #if negative, not enough wilds
      return 0;
        };
  };
  $value += 4;
  if ($value >12) {$value = 12;}; 
  return $value;
}


function sorting ($a, $b) {
  if ($b[1] > $a[1]) { return 1; }
  else if ($b[1] < $a[1]) {return -1;};

  if ($b[0] > $a[0]) { return 1; }
  else if ($b[0] < $a[0]) {return -1;};

  return 0; 
}

#hardest one; how to group this stuff
function group ($hand, $ord) {
    $wilds = 0; 
    while ($hand[0][0] == "n") {
        $wilds++;
        array_shift($hand);
    };
    $numcounts = array(); 
    $cards = array_reverse($hand);
    while (count($cards) > 0) {
      $card = array_shift($cards); 
      $curnum = $ord[$card[0]];
      $repnum = 1; 
      while ( (count($cards)>0) && ($ord[$cards[0][0]] == $curnum)) {
        array_shift($cards);
        $repnum++; 
      }
      $numcounts[] = array($curnum, $repnum); 
    };
    usort($numcounts, 'sorting');
    $numcounts[0][1] += $wilds;
    return $numcounts;
}


#what is the hand? 
function identify($hand) {
  global $numb_ord_tv; 
  $flushc = flushc($hand, $numb_ord_tv);
  $straight = straight($hand, $numb_ord_tv);
  $group = group($hand, $numb_ord_tv); 

  if ($group[0][1] == 5) {return array("5", array($group[0][0]));};
  if ($flushc && $straight) {return array("sf", array($straight));};
  if ($group[0][1] == 4) {return array("4", array($group[0][0], $group[1][0]));}; 
  if (($group[0][1] == 3) && ($group[1][1] == 2))
    {return array("fh", array($group[0][0], $group[1][0]));};
  if ($flushc) {return array("f", array($flushc));};
  if ($straight) {return array("s", array($straight));};
  if ($group[0][1] == 3) 
    {return array("3", array($group[0][0], $group[1][0], $group[2][0]));};
  if (($group[0][1] == 2) && ($group[1][1] == 2))
    {return array("2p", array($group[0][0], $group[1][0],  $group[2][0]));};
  if ($group[0][1] == 2)
    {return array("2", array($group[0][0], $group[1][0], $group[2][0],  $group[3][0] ));};
  return array("1", array($group[0][0], $group[1][0], $group[2][0],  $group[3][0],  $group[4][0] ));  
};

$ranks = array_reverse(array("Aces","Kings","Queens", "Jacks", "Tens", "Nines", "Eights","Sevens","Sixes","Fives",
    "Fours","Threes","Wilds"));


$rank = array_reverse(array("Ace","King","Queen", "Jack", "Ten", "Nine", "Eight","Seven","Six","Five",
    "Four","Three","Wild"));


function makecall($hand) {
    global $numb_ord_tv, $rank, $ranks; 
    $r = $hand[1];
    switch($hand[0]) {
    case "5": return "Five ".$ranks[$r[0]]; break;
    case "sf": return $rank[$r[0]]." High Straight Flush"; break;
    case "4":  return "Four ".$ranks[$r[0]]." and a ".$rank[$r[1]]." kicker"; break;
    case "fh":  return "Full House: ".$ranks[$r[0]]." over ".$ranks[$r[1]]; break;
    case "f": return $rank[$r[0]]." Low Flush"; break;
    case "s": return $rank[$r[0]]." High Straight"; break;
    case "3": return "Three ".$ranks[$r[0]]." and  ".$rank[$r[1]].", ".$rank[$r[2]]." kickers"; break;
    case "2p": return "Two pair: ".$ranks[$r[0]].", ".$ranks[$r[1]]." and a ".$rank[$r[2]]." kicker"; break;
    case "2":  return "Pair of ".$ranks[$r[0]]." with ".$rank[$r[1]].", ".$rank[$r[2]].", ".$rank[$r[3]]." kickers"; break;
    case "1":  return $rank[$r[0]]." high  and ".$rank[$r[1]].", ".$rank[$r[2]].", ".$rank[$r[3]].", ".$rank[$r[4]]." kickers"; break; 
    }
};

$numrank = array_reverse(array("A","K","Q", "J", "10", "9", "8","7","6","5",
    "4","3","W"));



function shortcall($hand) {
    global $numb_ord_tv, $numrank; 
    $ranks = $numrank;
    $rank = $numrank;
    $r = $hand[1];
    switch($hand[0]) {
    case "5": return "5: ".$ranks[$r[0]]; break;
    case "sf": return "SF: ".$rank[$r[0]]; break;
    case "4":  return "4: ".$ranks[$r[0]]."; ".$rank[$r[1]].""; break;
    case "fh":  return "FH: ".$ranks[$r[0]]."/".$ranks[$r[1]]; break;
    case "f": return "F: ".$rank[$r[0]].""; break;
    case "s": return "S: ".$rank[$r[0]].""; break;
    case "3": return "3: ".$ranks[$r[0]]."; ".$rank[$r[1]].", ".$rank[$r[2]].""; break;
    case "2p": return "2P: ".$ranks[$r[0]].", ".$ranks[$r[1]]."; ".$rank[$r[2]].""; break;
    case "2":  return "P: ".$ranks[$r[0]]."; ".$rank[$r[1]].", ".$rank[$r[2]].", ".$rank[$r[3]].""; break;
    case "1":  return $rank[$r[0]].", ".$rank[$r[1]].", ".$rank[$r[2]].", ".$rank[$r[3]].", ".$rank[$r[4]].""; break; 
    }
};

#returns a brief card description of hand As 2c ...
function handcall($hand, $drawcards) {
	$ret = '';
	foreach ($hand as $card) {
		$rank =''; 
	  switch ($card[0]) {
	  case "0": $rank = "T"; break;
	  case "n": $rank = "2"; break;

	  default : $rank = $card[0]; 
	  };
		switch ($card[1]) {
			case "c": $suit = "&#x2663;"; break;
			case "d": $suit = "&#x2666;"; break;
			case "h": $suit = "&#x2665;"; break;
			case "s": $suit = "&#x2660;"; break;
		}
		if (in_array($card, $drawcards)) {
			$ret = $ret." <strong>".$rank.$suit."</strong>";
		} else {
			$ret = $ret." ".$rank.$suit;
		}
	}
	return $ret;
}

#compares two hands
function compare ($new, $old) {
  GLOBAL $hand_ord_tv, $curmult, $scoinc, $curdec, $base, $typechange;        
    $newlvl = $hand_ord_tv[$new[0]];
    $oldlvl = $hand_ord_tv[$old[0]];
    $dif = $newlvl - $oldlvl;
		#add in curmult (delayed streak additive)
		#$curdec = $curdec + $curmult; 
		#using curmult to hold amount to add to next time as it is now available and storable
		$curmult = $dif;
#		if ($dif != 0) {
#			$curmult = $dif;
#		} else {
#			$curmult = 0; 
#		}
   if ($dif == 0) {
      $parts = count($new[1]);
      for ($level =0; $level < $parts; $level++) {
          $dif = $new[1][$level] - $old[1][$level];
          if ($dif != 0) {break;}
      };
    };
    if ($dif > 0) {  #use new level to boost positive
        if ($curdec >0) {
           $curdec++;
					$typechange = "up";
        } else {
          $curdec = 1;
					$typechange = "newup";
        }
    } else if ($dif<0) {
        if ($curdec <0) {
           $curdec--;
					$typechange = "down";
        } else {
          $curdec = -1;
					$typechange = "newdown";
        }
    } else { #same exact ranked hand
      $curmult = 1; #add 1 for next streak
			$typechange = "null";
      return 0; 
    };
		#sign of curdec *50 * 2^magnitude of curdec
		return $curdec/abs($curdec)*100*round(pow(2, abs($curdec)))*(abs($curmult)+1);  ##round(pow(2, abs($curdec)));
}

#order by value
function cmpval ($a, $b) {
  global $numb_ord_tv;
  if ($numb_ord_tv[$a[0]] > $numb_ord_tv[$b[0]]) {return 1;};
  if ($numb_ord_tv[$a[0]] < $numb_ord_tv[$b[0]]) {return -1;};
  return 0;
};


function rep_err ($mess) {
#     print ("<append select='#error'>".$mess."</append>");
}

function storeGame ($deck, $hand) {
        GLOBAL  $score, $curmult, $curdec;
try{
    $db = new PDO("sqlite:gsg.sqlite"); 
    $db-> beginTransaction();
$deck = $db->quote(serialize($deck));
$hand = $db->quote(serialize($hand)); 
$db->exec("INSERT into GAME (deck, hand, score, curmult, curdec) VALUES ($deck,$hand,$score, $curmult, $curdec);");
$gid = $db->lastInsertId(); 
$db->commit(); 
return $gid; 
} catch (PDOException $e) {
#  rep_err('Connection failed: '.$e->getMessage());
}
} 


function store_hand ($gid, $hand) {
        GLOBAL  $score, $curmult, $curdec;
try{
    $db = new PDO("sqlite:gsg.sqlite"); 
    $db-> beginTransaction();
    $hand = $db->quote(serialize($hand)); 
    #$gid += 0; 
    $gid = $db->quote($gid); 
$db->exec("UPDATE game SET hand=$hand, score=$score, curmult=$curmult, curdec=$curdec WHERE gid=$gid;");
$db->commit(); 
return 1; 
} catch (PDOException $e) {
 # rep_err('Connection failed: '.$e->getMessage());
}
} 



function load_game ($gid, &$deck, &$hand) { 
    GLOBAL  $score, $curmult, $curdec;
    $db = new PDO("sqlite:gsg.sqlite"); 
    #$gid += 0; 
    $gid = $db->quote($gid); 
    $rows = $db->query("SELECT * FROM game WHERE gid=$gid"); # as $row) { #deck, hand WHERE gid=$gid;") as $row) {
    if ($rows) {
        $row = $rows->fetch(); 
      $deck = unserialize($row['deck']);
      $hand = unserialize($row['hand']);
      $score = $row['score'];
      $curmult = $row['curmult'];
      $curdec =$row['curdec'];
      return true;
    } else {
  
        return false;
    };
}

function sendscores($func) {
      $db = new PDO("sqlite:gsg.sqlite"); 
      $hs = $db->query("SELECT * FROM scores ORDER BY score DESC LIMIT 10");
      #$ls = $db->query("SELECT * FROM scores ORDER BY score ASC LIMIT 10");
      if ($hs) { #(($hs) && ($ls)) {
          $hstab =''; #$lstab='';
        foreach ($hs as $row) {
            $hstab .= "<tr><td>".htmlentities($row['nam'])."</td><td>".$row['score']."</td></tr>";
        };
       # foreach ($ls as $row) {
       #     $lstab .= "<tr><td>".htmlentities($row['nam'])."</td><td>".$row['score']."</td></tr>";
       # };
        print ("<replaceContent select='#hs'>".$hstab."</replaceContent>");
        #print ("<replaceContent select='#ls'>".$lstab."</replaceContent>");
        print ("<eval> ${func}(); </eval>");
      } 
};

function insertscore($gid, $name) {
    $db = new PDO("sqlite:gsg.sqlite"); 
    #$gid += 0; 
    $gid = $db->quote($gid); 
    $rows = $db->query("SELECT score FROM game WHERE gid=$gid"); 
    if ($rows) {
      $row = $rows->fetch(); 
      $score = $row['score'];
      if ($score && $name) {
        $score = $db->quote($score); 
        $name = $db->quote($name); 
        $db->exec("INSERT INTO scores (score, nam) VALUES ($score,$name);");
      }
    } else {return false;}
};


function load_scores ($gid) { 
    $db = new PDO("sqlite:gsg.sqlite"); 
    $gid = $db->quote($gid); 
    $rows = $db->query("SELECT score FROM game WHERE gid=$gid"); 
    if ($rows) {
      $row = $rows->fetch(); 
      $score = $row['score'];
      $hs = $db->query("SELECT min(score) FROM (SELECT score FROM scores ORDER BY score DESC LIMIT 10)"); 
      #$ls = $db->query("SELECT max(score) FROM (SELECT score FROM scores ORDER BY score ASC LIMIT 10)"); 

      if ($hs) { # && $ls){
          $hs= $hs->fetch();
          #$ls = $ls->fetch();
          if($score > $hs[0]) {
             print ("<eval> namescore('high'); </eval>");
         # } else if ($score < $ls[0]) {
         #    print ("<eval> namescore('low'); </eval>");
          } else {
             sendscores('loadscorescleargame');
          };
      } else {
        return false;
      };
    } else {return false;}
}


?>

<taconite>

<?
if (isset($_POST['action'])) {
  switch ($_POST['action']) { 
  case 'shuffle': 
    $deck = array(); 
     foreach ($numb_ord_vt as $numb) {
      foreach ($suits as  $suit)  {
       $deck[] = array($numb, $suit);
      }
     }
    shuffle ($deck); 
    $drawcards = array(0,1,2,3,4);
    $cur = -1;
    foreach ($drawcards as $cardslot) {
       $cur++; 
       $place = $cardslot;
       $num_hand[$place] = $cur;  #the location in deck
       $hand[$place] =$deck[$cur]; #the card itself
    }

   $sorth = $hand; 
   usort($sorth,  "cmpval");
   $htype = identify($sorth);
   $lowesthand = array("1", array(6, 4, 3, 2, 1));  

   #compare and finish
   $delta = compare($htype, $lowesthand);
   $score = $delta;   

   $output = ''; $i = 1;
   foreach ($hand as $card) {
     $imgn = cardImage($card); 
     $output .= <<<EOT
<css select='#card$i' arg1='background-position' arg2='$imgn' /> 
EOT;
     $i++;
   }
   $numcards = 47; 
   $gid = storeGame($deck, $drawcards); 
   $handcall = makecall($htype); 
   #$histcall = shortcall($htype); 
	 $histcall = handcall($hand, $hand);
   $output.= <<<EOT
<replaceContent select="#togglegame"><a id="endgame">End Game</a></replaceContent>
<replace select="#history table">
<table><tbody><tr><td>1.</td><td>$score</td><td><span class='label success'>&#x25B2;$delta</span></td><td class="left">$histcall</td></tr></tbody></table>
</replace>
<replaceContent select='#handtext'>
 $handcall 
</replaceContent>
<replaceContent select='#score'>
 $score
</replaceContent>
<eval>inarow($curdec, $curmult, "newup")</eval>
<eval>scorepulse("scoreplus")</eval>
<replaceContent select='#delta'>
 &#x25B2;$delta
</replaceContent>
<removeClass select=".start" arg1="hide" />
<val select='#gid' arg1="$gid" />
<removeClass select="#hand li" arg1="hide" /> 
<replaceContent select="#numcards"> $numcards </replaceContent>
<attr select="#count" arg1="value" arg2="1" />
EOT;
  break;
  #end game 
  case 'endgame': 
    if ($_POST['gid']) {
        load_scores($_POST['gid']);
    }
   $output.= <<<EOT
<replaceContent select="#togglegame"><a id="newgame">Start Game</a></replaceContent>
EOT;
  break;

  #submitting new name for high/low score  
  case 'submitname':
    insertscore($_POST['gid'], $_POST['name']);
    sendscores('loadscorescleargame');  
  break;

  #view score request  
  case 'viewscores':  
    sendscores('loadscores');  
  break;

  #draw cards
  case 'drawcards': 
    #load variables
    $drawcards = $_POST['card'];
    $deck = array();
    $num_hand = array();
    load_game($_POST['gid'], $deck, $num_hand);
  
    #load old hand
    $hand = array();

    if ( (isset($num_hand[0])) && (isset($deck[0])) && ($drawcards[0]) ) {
      foreach ($num_hand as $cardplace) {
        $hand[] = $deck[$cardplace]; 
      }
    
      $oldsort= $hand; 
      usort($oldsort,  "cmpval");
      $oldtype = identify($oldsort);   
  
			#initialize array for new cards as cards
			$newcards = array();

      #load new hand
      #  $deck['current']=max($hand);
      $cur = max($num_hand);
      foreach ($drawcards as $cardslot) {
        $cur++; 
        if ($cur > 51) { 
            print ("<removeClass select='#nocards' arg1='hide' />"); 
            break;
        };
        $place = $cardslot-1;
        $num_hand[$place] = $cur;  #the location in deck
        $hand[$place] =$deck[$cur]; #the card itself
				$newcards[$place] = $deck[$cur];
      };
      $sorth = $hand; 
      usort($sorth,  "cmpval");
      $htype = identify($sorth);

      #compare and finish
      $delta = compare($htype, $oldtype);
      $score = $score+$delta;   
      $output = ''; 
      foreach ($drawcards as $card) {
        $imgn = cardImage($hand[$card-1]); 
        $output .= <<<EOT
<css select='#card$card' arg1='background-position' arg2='$imgn' /> 
EOT;
      };
      $numcards = 51-$cur;
      if ($numcards <0) {$numcards = 0;}
      store_hand($_POST['gid'], $num_hand); 
      $handcall = makecall($htype); 
      #$histcall = shortcall($htype); 
	 		$histcall = handcall($hand, $newcards);
      $count = $_POST['count']+1;
      if ($delta > 0) {
				 $maindelta = "&#x25B2;$delta";
         $deltacall = "class='label success'>&#x25B2;$delta";
				 $scoreclass = "'scoreplus'";
      } else if ($delta < 0) {
         $posdelta = -1*$delta;
				 $maindelta = "&#x25BC;$posdelta";
         $deltacall = "class='label important'>&#x25BC;$posdelta";
				 $scoreclass = "'scoreminus'";
      } else {
				 $maindelta = "▬";
         $deltacall = "class='label'>▬";
				 $scoreclass = "''";
      }

      $output.= <<<EOT
<replaceContent select='#handtext'>
 $handcall 
</replaceContent>
<prepend select="#history table tbody">
<tr><td>$count.</td><td>$score</td><td><span $deltacall</span></td><td class="left">$histcall</td></tr>
</prepend>
<replaceContent select='#score'>
 $score 
</replaceContent>
<eval> inarow($curdec, $curmult, '$typechange'); </eval> 
<eval>scorepulse($scoreclass)</eval>
<replaceContent select='#delta'>
 $maindelta
</replaceContent>
<replaceContent select="#numcards"> $numcards </replaceContent>
<attr select="#count" arg1="value" arg2="$count" />
EOT;

    };#arrays formed
  }; #end of switch
    
  print ($output);
} # end of if 'action' set
?>

</taconite>
