import { range, ifExists } from "./utils";

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

const kingRowPieceTypes = (color: Color) =>
  [
    "rook",
    "knight",
    "bishop",
    color === "white" ? "queen" : "king",
    color === "white" ? "king" : "queen",
    "bishop",
    "knight",
    "rook",
  ] as PieceType[];

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

const pieceAt = (board: Piece[], x: number, y: number): Piece | undefined =>
  board.find((piece) => piece.x === x && piece.y === y);

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

type BasicMove = { type: "basic"; piece: Piece; to: [number, number] };

type EnpassantMove = {
  type: "enpassant";
  piece: Piece & { type: "pawn" };
  to: [number, number];
};

type CastlingMove = {
  type: "castling";
  piece: Piece & { type: "king" };
  kingSide: boolean;
};

type PromotionMove =
  | {
      type: "promotion";
      piece: Piece & { type: "pawn"; white: true };
      to: [number, 0];
      promoteTo: PieceType;
    }
  | {
      type: "promotion";
      piece: Piece & { type: "pawn"; white: false };
      to: [number, 7];
      promoteTo: PieceType;
    };

type Move = BasicMove | EnpassantMove | CastlingMove | PromotionMove;

const isFriendlyPieceAt = (game: GameState, pos: [number, number]): boolean =>
  pieceAt(game.pieces, ...pos)?.color === turn(game);

const pawnDir = (color: "white" | "black"): number =>
  color === "white" ? -1 : 1;

const pawnMovement = (color: "white" | "black"): [number, number][] => [
  [0, pawnDir(color)],
  [0, 2 * pawnDir(color)],
];

const pawnAttackMovement = (color: "white" | "black"): [number, number][] => [
  [1, pawnDir(color)],
  [-1, pawnDir(color)],
];

const positionOnBoard = (pos: [number, number]): boolean =>
  pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8;

const basicMoveLandsOnBoard = (move: BasicMove): boolean =>
  positionOnBoard(move.to);

const movementToBasicMoves = (
  movement: [number, number][],
  piece: Piece
): BasicMove[] =>
  movement.map(
    ([dx, dy]): BasicMove => ({
      type: "basic",
      piece,
      to: [piece.x + dx, piece.y + dy],
    })
  );

const isBasicMoveLegal = (game: GameState, move: BasicMove): boolean =>
  !isFriendlyPieceAt(game, move.to) && basicMoveLandsOnBoard(move);

const pawnMoves = (game: GameState, piece: Piece): Move[] =>
  movementToBasicMoves(pawnMovement(piece.color), piece).filter((move) =>
    isBasicMoveLegal(game, move)
  );

const knightMovement: [number, number][] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const knightMoves = (game: GameState, piece: Piece): Move[] =>
  movementToBasicMoves(knightMovement, piece).filter((move) =>
    isBasicMoveLegal(game, move)
  );

// TODO:
const rookMoves = (game: GameState, piece: Piece): Move[] => [];
const bishopMoves = (game: GameState, piece: Piece): Move[] => [];
const kingMoves = (game: GameState, piece: Piece): Move[] => [];
const queenMoves = (game: GameState, piece: Piece): Move[] =>
  [rookMoves(game, piece), bishopMoves(game, piece)].flat();

const piecesMoves = (game: GameState, piece: Piece): Move[] =>
  ({
    pawn: pawnMoves,
    rook: rookMoves,
    knight: knightMoves,
    bishop: bishopMoves,
    queen: queenMoves,
    king: kingMoves,
  }[piece.type](game, piece));

const isPiecesTurn = (piece: Piece): boolean => piece.color === turn(newGame);

const possibleMoves = (game: GameState): Move[] =>
  game.pieces
    .filter(isPiecesTurn)
    .map((piece) => piecesMoves(game, piece))
    .flat();

export { gameToText, newGame, possibleMoves };
