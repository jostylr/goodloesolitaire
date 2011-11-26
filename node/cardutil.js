/*jslint node:true */
/*global exports */


var major = {"5" :9, "sf":8, "4":7, "fh":6, "f":5, "s":4, "3":3, "2p":2, "2":1, "1":0};
var rankings = {'2' :0, '3':1,'4':2, '5':3, '6':4,'7':5, '8': 6, '9':7, 'T':8, 'J':9, 'Q':10, 'K':11, 'A':12};

var wilds = function (card) {
	if (card[0] === '2') {
		return true;
	} else {
		return false;
	}
};

//higher ranks come first in sort list
var sortbyranks = function (a,b) {return rankings[b[0]] - rankings[a[0]];};

var analyzehand = function (hand, wilds) {
	var wildcount = 0;
	var flush, straight, grouping, calls;
	var r, s, rankcount, suitcount, subrc, low; 
	var suits = {'s' :0,'c' :0, 'd' :0,'h' :0};
	var ranks = {'2' :0, '3':0,'4':0, '5':0, '6':0,'7':0, '8': 0, '9':0, 'T':0, 'J':0, 'Q':0, 'K':0, 'A':0};
	//bin suits, ranks or wilds
	hand.forEach(function (val, ind, hand) {
		if (wilds(val)) {
			wildcount += 1; 
		} else {
			suits[val[1]] += 1; 
			ranks[val[0]] += 1; 
		}
	});
	//extract ranks and suit counts of relevant portions [["s", 2], ..] 
	rankcount = [];
	for (r in ranks) {
		if (ranks[r]) {
			rankcount.push([r, ranks[r]]);
		}
	}
	suitcount = [];
	for (s in suits) {
		if (suits[s]) {
			suitcount.push([s, suits[s]]);
		}
	}
	rankcount.sort(sortbyranks); //want highest ranks first so that wilds get added appropriately (sort is stable)
	rankcount.sort(function(a,b) {return b[1]-a[1];});
	//figure out grouping
	switch (rankcount.length) {
		case 1: //5k  (5)
			grouping = ["5", rankcount[0][0]];
		break;
		case 2:  //4k (4,1) or fh (3,2)
			if ( (rankcount[0][1] + wildcount) === 4 ) { //4k
				grouping = ["4", rankcount[0][0], rankcount[1][0]];
			} else { //fh
				grouping = ["fh", rankcount[0][0], rankcount[1][0]];				
			}
		break;
		case 3: // 3k (3, 1, 1) or 2p (2, 2, 1)
			if ( (rankcount[0][1] + wildcount) === 3) { //3k
				subrc = rankcount.slice(1).sort(sortbyranks);
				grouping = ["3", rankcount[0][0], subrc[1][0], subrc[2][0]];						
			} else { //2p
				subrc = rankcount.slice(0,2).sort(sortbyranks);
				grouping = ["2p", subrc[0][0], subrc[1][0], rankcount[2][0]];		
				
			}
		break;
		case 4: //pair (2, 1, 1, 1)
			subrc = rankcount.slice(1).sort(sortbyranks);
			grouping = ["2", rankcount[0][0], subrc[0][0], subrc[1][0], subrc[2][0]];		
		break;
		default: //all 5 different ranks (1,1,1,1,1)
			rankcount.sort(sortbyranks);
			grouping = ["1", rankcount[0][0], rankcount[1][0], rankcount[2][0], rankcount[3][0], rankcount[4][0]];
	}
	calls = [grouping];
	//check for straight 
	if ( (rankcount.length + wildcount === 5) ) {
		rankcount.sort(sortbyranks);
		if ((rankings[rankcount[0][0]] - rankings[rankcount[rankcount.length-1][0]] ) <= 5 ) {
			straight = ["s", rankcount[0][0]];
			calls.push(straight);
		}  else {
			//Aces can be low!
			rankings['A']  = -1;
			rankcount.sort(sortbyranks);
			if ((rankings[rankcount[0][0]] - rankings[rankcount[rankcount.length-1][0]] ) <= 5 ) {
				straight = ["s", rankcount[0][0]];
				calls.push(straight);
			} else {
				straight = false; 
			}
			rankings['A']  = 12;			
		}
	} else {
		straight = false;
	}
	//flush!
	if (suitcount.length === 1) {
		rankcount.sort(sortbyranks);
		//flushes are ranked by low card. 
		low =  rankcount[rankcount.length-1][0];
		//due to wilds, low card may be bigger than 10 but highest low is 10
		if (rankings[low] > 8) {low = 'T';}
		flush = ["f", low];
		calls.push(flush);
	} else {
		flush = false; 
	}
	if (straight && flush) {
		calls.push(["sf", straight[1]]);
	}
	calls.sort(function(a,b) {return major[b[0]] - major[a[0]];});
	return JSON.stringify( [calls[0], hand]); 
};

//testing
/*
console.log(analyzehand(["As", "Ad", "Ac", "Ah", "2s"], wilds)); 
console.log(analyzehand(["As", "Ad", "Ac", "Ah", "2s"], function(){return false;})); 
console.log(analyzehand(["As", "Ad", "Kc", "Kh", "2s"], wilds)); 
console.log(analyzehand(["As", "Kd", "Qc", "Jh", "2s"], wilds)); 
console.log(analyzehand(["As", "Ks", "Qs", "Js", "2d"], wilds)); 
console.log(analyzehand(["As", "3d", "4c", "5h", "2s"], wilds)); 
console.log(analyzehand(["As", "Ad", "Kc", "Kh", "4s"], wilds)); 
*/


exports.call = function (hand) {
	return ['TBD', Math.floor(Math.random()*(300))];
};