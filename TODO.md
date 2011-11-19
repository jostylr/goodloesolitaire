# To do

## 1.5

REQ: Bring back Hail Mia, etc., call. Envisioning the Text pulsing out over the deck and fading out. Or sliding in/out. One of the simple jQuery effects. Text is in div #hail, the function makeCall (line25 ish) handles the behavior.

CHECK: When all cards drawn, is behavior of ending appropriate or does there need to be another stage/warning? 

REQ: Make toppage index look nice. 

REQ: When deck is used up, hide the deck.

REQ: When deck is used up, game automatically ends, and high score modal pops up, it's easy to unintentionally click outside of that region (as if you were still playing), losing your chance to input your high score name. Clicking outside the modal should not dismiss it in this case. There should be a "No thanks" button instead.

## 2.0

1. Animation for new deck, discard card, draw card
9. Add recent high scores in backend/frontend
10. Add date for high scores?
11. Detect twitter name or add link (riskier) for high score: give people a way to link back to their identity.
10. Add in a column for the hand type
13. Feature: custom link to individual game history
14. Feature: custom link to individual game review (watch)
15. Feature: custom link to individual game replay (play)
14. Feature: Multiple game modes:

	1. Streaking
		This is what we are doing now.
	2. Climb the Mountain
		Goal is to reach highest hand in fewest turns.
	3. Target Practice
		A target hand type is given. Motion towards it is rewarded. Motion away, penalized.
	4. Measured pace
		Points achieved for each hand type in order. 
	5. Staying Alive
		Maintain or improve current hand type, but ranking in it is of no consequence. Points for different hand types are not by ordering, but on perceived difficulty. One downturn is the end game.
	6. Paying the Rent	
		Pot of money. Each card draw costs money. Levels cost money for rent. Level gains give a pot of money. Rent increases as level stays the same. Interest accrues on pot of money each turn with streaks increasing interest. Level loss loses money.
	10. Maybe different scoring rules too. Such as Current Major Level as base and the streak at that level as power. 