import { range, ifExists, deepEquals } from "./utils";

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

type Color = "white" | "black";
type Piece = {
  type: PieceType;
  color: Color;
  x: number;
  y: number;
};

const pawnRow = (color: Color): Piece[] =>
  range(0, 8).map((x) => ({
    type: "pawn",
    color,
    x,
    y: color === "white" ? 6 : 1,
  }));

const pieceRow = (color: Color, types: PieceType[]): Piece[] =>
  types.map((type, x) => ({ type, color, x, y: color === "white" ? 7 : 0 }));

const kingRowPieceTypes = (color: Color): PieceType[] => [
  "rook",
  "knight",
  "bishop",
  color === "white" ? "queen" : "king",
  color === "white" ? "king" : "queen",
  "bishop",
  "knight",
  "rook",
];

const initWhiteKingRow = pieceRow("white", kingRowPieceTypes("white"));

const initBlackKingRow = pieceRow("black", kingRowPieceTypes("black"));

const initWhitePawnRow = pawnRow("white");

const initBlackPawnRow = pawnRow("black");

const initPieces = [
  initWhiteKingRow,
  initWhitePawnRow,
  initBlackPawnRow,
  initBlackKingRow,
].flat();

type GameState = { pieces: Piece[]; previousPieces: Piece[][] };

const newGame: GameState = { pieces: initPieces, previousPieces: [] };

const pieceToVisual = (piece: Piece): string =>
  piece.color === "white"
    ? piece.type[0].toUpperCase()
    : piece.type[0].toLowerCase();

const pieceAt = (pieces: Piece[], x: number, y: number): Piece | undefined =>
  pieces.find((piece) => piece.x === x && piece.y === y);

const charAtPos = (board: Piece[], x: number, y: number): string =>
  ifExists(pieceAt(board, x, y), pieceToVisual) || ".";

const boardToText = (board: Piece[]): string =>
  range(0, 8)
    .map((y) =>
      range(0, 8)
        .map((x) => charAtPos(board, x, y))
        .join(" ")
    )
    .join("\n");

const gameToText = (game: GameState): string => boardToText(game.pieces);

const turn = (game: GameState): "white" | "black" =>
  game.previousPieces.length % 2 === 0 ? "white" : "black";

const isFriendlyPieceAt = (game: GameState, pos: [number, number]): boolean =>
  pieceAt(game.pieces, ...pos)?.color === turn(game);

const isPositionOnBoard = (pos: [number, number]): boolean =>
  pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8;

type Move = {
  from: [number, number];
  to: [number, number];
};

const doesMoveLandOnBoard = (move: Move): boolean => isPositionOnBoard(move.to);

const pawnDir = (color: "white" | "black"): number =>
  color === "white" ? -1 : 1;

const pawnBasicMove = (piece: Piece): Move => ({
  from: [piece.x, piece.y],
  to: [piece.x, piece.y + pawnDir(piece.color)],
});

const pawnStartMove = (piece: Piece): Move => ({
  from: [piece.x, piece.y],
  to: [piece.x, piece.y + 2 * pawnDir(piece.color)],
});

const pawnAtStart = (piece: Piece): boolean =>
  piece.y === (piece.color === "white" ? 6 : 1);

const enemyAtPos = (game: GameState, pos: [number, number]): boolean =>
  ifExists(
    pieceAt(game.pieces, ...pos),
    (piece) => piece.color !== turn(game)
  ) || false;

const pawnAttackMoves = (game: GameState, piece: Piece): Move[] =>
  [
    [piece.x + 1, piece.y + pawnDir(piece.color)],
    [piece.x - 1, piece.y + pawnDir(piece.color)],
  ]
    .filter((pos) => enemyAtPos(game, [pos[0], pos[1]]))
    .map((pos) => ({ from: [piece.x, piece.y], to: [pos[0], pos[1]] }));

const pawnMoves = (game: GameState, piece: Piece): Move[] =>
  [
    pawnBasicMove(piece),
    pawnAtStart(piece) ? pawnStartMove(piece) : [],
    pawnAttackMoves(game, piece),
  ].flat();

// =================

const knightMoves = (game: GameState, piece: Piece): Move[] =>
  [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ].map(([dx, dy]) => ({
    from: [piece.x, piece.y],
    to: [piece.x + dx, piece.y + dy],
  }));

// TODO:
const rookMoves = (game: GameState, piece: Piece): Move[] => [];
const bishopMoves = (game: GameState, piece: Piece): Move[] => [];
const kingMoves = (game: GameState, piece: Piece): Move[] => [];
const queenMoves = (game: GameState, piece: Piece): Move[] =>
  [rookMoves(game, piece), bishopMoves(game, piece)].flat();

const piecePossibleMoves = (game: GameState, piece: Piece): Move[] =>
  ({
    pawn: pawnMoves,
    knight: knightMoves,
    rook: rookMoves,
    bishop: bishopMoves,
    king: kingMoves,
    queen: queenMoves,
  }[piece.type](game, piece));

const isPiecesTurn = (piece: Piece): boolean => piece.color === turn(newGame);

// returns legal and illegal moves
const possibleMoves = (game: GameState): Move[] =>
  game.pieces.map((piece) => piecePossibleMoves(game, piece)).flat();

const pieceAtPos = (piece: Piece, pos: [number, number]): boolean =>
  piece.x === pos[0] && piece.y === pos[1];

const commitMove = (game: GameState, move: Move, piece: Piece): GameState => ({
  ...game,
  pieces: [
    ...game.pieces
      .filter((p) => !pieceAtPos(p, move.to))
      .filter((p) => !pieceAtPos(p, move.from)),
    {
      ...piece,
      x: move.to[0],
      y: move.to[1],
    },
  ],
  previousPieces: [...game.previousPieces, game.pieces],
});

const isMoveLegal = (
  game: GameState,
  move: Move,
  piece: Piece | undefined
): boolean =>
  piece !== undefined &&
  isPiecesTurn(piece) &&
  !isFriendlyPieceAt(game, move.to) &&
  doesMoveLandOnBoard(move) &&
  possibleMoves(game).some((legalMove) => deepEquals(legalMove, move));

const legalMoves = (game: GameState): Move[] =>
  possibleMoves(game).filter((move) =>
    isMoveLegal(game, move, pieceAt(game.pieces, ...move.from))
  );

const attemptMoveWithPiece = (
  game: GameState,
  move: Move,
  piece: Piece
): GameState | undefined =>
  isMoveLegal(game, move, piece) ? commitMove(game, move, piece) : undefined;

const attemptMove = (game: GameState, move: Move): GameState | undefined =>
  ifExists(pieceAt(game.pieces, ...move.from), (piece) =>
    attemptMoveWithPiece(game, move, piece)
  );

// returns new game state if move is legal, otherwise returns old game state
const attemptMoveWithCoords = (
  game: GameState,
  from: [number, number],
  to: [number, number]
): GameState => attemptMove(game, { from, to }) || game;

const attemptMovesWithCoords = (
  game: GameState,
  moves: [number, number][]
): GameState | undefined => undefined;

export {
  gameToText,
  newGame,
  legalMoves,
  attemptMove,
  attemptMoveWithCoords,
  attemptMovesWithCoords,
};
