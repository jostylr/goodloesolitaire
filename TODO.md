# To do

## 1.5

5. BUG: inarow streak text is not correct.
5. inarow text should be changed to something more friendly and intuitive. Like:

    2 in a row!  
    3 in a row + 1 bonus!

    Negative plays could perhaps be left blank here. Or:  
    Yikes! 2 in a row!

6. BUG: On the second game started, the "Start Game" text changes to "New Game". Keep it "Start Game".
7. REQ: Submit name, allow submit by typing "Enter"
8. BUG: After you submit a new name, the hand saves state in a transparent form. But you never see this anywhere else. Perhaps this should always be the view when a game is ended or not active (such as on first load).
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

## 2.0

1. Animation for new deck, discard card, draw card
9. Add recent high scores in backend/frontend
10. Add in a column for the hand type
13. Feature: custom link to individual game replays/history
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