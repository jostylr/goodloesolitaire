# To do

1. Animation for new deck, discard card, draw card
3. On End Game, screen state should save or reset. Currently it does a mix of both.
9. Add recent high scores in backend/frontend
8. Scoring: transparent, fun algorithm . get algorithms on client working.
    S = streak count  
    LC = level jump of current hand  
    LP = level jump of previous hand

    1. 100 * S
    2. 100 * (2^S)
    3. 100 * (S+LP)
    4. 100 * (2^S + LP)
    5. 100 * (2^S * LP)
    6. 100 * (2^(S+LP))
    7. 50 * (S + LP)^2
10. Add in a column for the hand type
13. 2.0 Feature: custom link to individual game replays/history
14. 2.0 Feature: Multiple game modes:

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