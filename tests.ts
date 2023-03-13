import {
  newGame,
  legalMoves,
  gameToText,
  attemptMoveWithCoords,
} from "./chess";

import { assert } from "./utils";

const tests = [
  assert("new game has 32 pieces", 32, newGame.pieces.length),
  assert("20 possible starting moves", 20, legalMoves(newGame).length),
  assert(
    "can do e4",
    `r k b k q b k r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . P . . .
. . . . . . . .
P P P P . P P P
R K B Q K B K R`,
    gameToText(attemptMoveWithCoords(newGame, [4, 6], [4, 4]))
  ),
  assert(
    "can't move black pawn first",
    gameToText(newGame),
    gameToText(attemptMoveWithCoords(newGame, [4, 1], [4, 3]))
  ),
  assert(
    "can't move pawn three spaces",
    gameToText(newGame),
    gameToText(attemptMoveWithCoords(newGame, [4, 6], [4, 3]))
  ),
];

const result = tests.every((t) => t.success)
  ? "🎉 all tests passed!"
  : `❌ ${tests.filter((t) => !t.success).length} tests failed`;
