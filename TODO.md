# To do

1. Animation for new deck, discard card, draw card
2. Make Start Game / End Game buttons toggleable
9. Add recent high score in backend/frontend
10. Apply .scoreplus and .scoreminus to #delta too
11. History table: can use html codes for suits instead of lowercase: &spades; &clubs; &diams; &hearts;
12. Make mousedown for draw work only on the card back image (#drawcards), not the whole div (#dc). 
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