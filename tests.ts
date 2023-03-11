import { newGame, possibleMoves, gameToText } from "./index";
import { testResultsToString } from "./utils";

const tests = [
  {
    description: "new game has 32 pieces",
    test: newGame.pieces.length,
    expected: 32,
  },
  {
    description: "20 possible starting moves",
    test: possibleMoves(newGame).length,
    expected: 20,
  },
  {
    description: "starting board text is correct",
    test: gameToText(newGame),
    expected: `r k b k q b k r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
P P P P P P P P
R K B Q K B K R`,
  },
];

const results = testResultsToString(tests);

console.log(results);
