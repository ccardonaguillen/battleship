# BATTLESHIP

Web-based implementation of the Battleship boardgame to practice TDD

## FEATURES

Main game logic has been programmed following TDD. Tests for all the game main components are provided.
DOM manipulation has been done separately.

## TODO

-   Implement AI for computer smart attacks (target tiles around attack hit and follow direction until ship is sunk)
-   Log error in info-box when tile has already been selected. Previous attempt (promise-->reject) pass player's turn

## KNOWN ISSUES

-   Resetting the game before computer's move breaks game because it does not stop game loop
