# To do

1. Animation for new deck, discard card, draw card
2. Make Start Game / End Game buttons toggleable
9. Add recent high score in backend/frontend
10. Apply .scoreplus and .scoreminus to #delta too
13. History: Change title labels to data attributes so they don't show when hovered. See <http://ejohn.org/blog/html-5-data-attributes/>
8. Scoring: transparent, fun algorithm  
    S = streak count  
    LC = level jump of current hand  
    LP = level jump of previous hand

    1. 100 * S
    2. 100 * (2^S)
    3. 100 * (S+LP)
    4. 100 * (2^S + LP)
    5. 100 * (2^S * LP)
    6. 100 * (2^(S+LP))

13. 2.0 Feature: custom link to individual game replays/history
14. 2.0 Feature: Multiple games:

	1. Streaking
		This is what we are doing now.
	2. Climb the Mountain
		Goal is to reach highest hand in fewest turns.
	3. Target Practice
		A target hand type is given. Motion towards it is rewarded. Motion away, penalized.
	4. Measured pace
		Points achieved for each hand type in order. 
	5. Leveling
		Maintain or improve current hand type, but ranking in it is of no consequence. Points for different hand types are not by ordering, but on perceived difficulty. 
		
		