import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, XCircle } from "lucide-react";

type Board = (number | null)[][];
type GameStatus = "playing" | "won" | "lost";

const GRID_SIZE = 4;
const WIN_VALUE = 2048;

// Timing constants for animation storyboard
const TILE_MOVE_DURATION = 150;
const TILE_SPAWN_DELAY = 100;
const TILE_MERGE_SCALE = 1.1;

function Game2048() {
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [lastMove, setLastMove] = useState<number>(0);

  // Initialize empty board
  function initializeBoard(): Board {
    const newBoard: Board = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
    // Add two random tiles to start
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  // Add a random tile (2 or 4) to an empty cell
  function addRandomTile(board: Board): boolean {
    const emptyCells: [number, number][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === null) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) return false;

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  // Deep clone board
  function cloneBoard(board: Board): Board {
    return board.map((row) => [...row]);
  }

  // Move and merge logic for a single row (left direction)
  function moveRowLeft(row: (number | null)[]): { row: (number | null)[]; scoreGained: number } {
    // Filter out nulls
    const filtered = row.filter((cell) => cell !== null) as number[];
    const newRow: (number | null)[] = Array(GRID_SIZE).fill(null);
    let scoreGained = 0;
    let writeIndex = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        // Merge
        const mergedValue = filtered[i] * 2;
        newRow[writeIndex] = mergedValue;
        scoreGained += mergedValue;
        writeIndex++;
        i++; // Skip next tile as it was merged
      } else {
        // Move without merging
        newRow[writeIndex] = filtered[i];
        writeIndex++;
      }
    }

    return { row: newRow, scoreGained };
  }

  // Rotate board 90 degrees clockwise
  function rotateClockwise(board: Board): Board {
    const rotated: Board = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        rotated[col][GRID_SIZE - 1 - row] = board[row][col];
      }
    }
    return rotated;
  }

  // Rotate board 90 degrees counter-clockwise
  function rotateCounterClockwise(board: Board): Board {
    const rotated: Board = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        rotated[GRID_SIZE - 1 - col][row] = board[row][col];
      }
    }
    return rotated;
  }

  // Move board in any direction
  function moveBoard(board: Board, direction: "left" | "right" | "up" | "down"): { board: Board; scoreGained: number } {
    let workingBoard = cloneBoard(board);
    let totalScoreGained = 0;

    // Rotate board to make all directions work like "left"
    if (direction === "right") {
      workingBoard = rotateClockwise(rotateClockwise(workingBoard));
    } else if (direction === "up") {
      workingBoard = rotateCounterClockwise(workingBoard);
    } else if (direction === "down") {
      workingBoard = rotateClockwise(workingBoard);
    }

    // Apply left movement to each row
    for (let row = 0; row < GRID_SIZE; row++) {
      const { row: newRow, scoreGained } = moveRowLeft(workingBoard[row]);
      workingBoard[row] = newRow;
      totalScoreGained += scoreGained;
    }

    // Rotate back
    if (direction === "right") {
      workingBoard = rotateClockwise(rotateClockwise(workingBoard));
    } else if (direction === "up") {
      workingBoard = rotateClockwise(workingBoard);
    } else if (direction === "down") {
      workingBoard = rotateCounterClockwise(workingBoard);
    }

    return { board: workingBoard, scoreGained: totalScoreGained };
  }

  // Check if two boards are equal
  function boardsEqual(board1: Board, board2: Board): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board1[row][col] !== board2[row][col]) return false;
      }
    }
    return true;
  }

  // Check if player has won
  function checkWin(board: Board): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === WIN_VALUE) return true;
      }
    }
    return false;
  }

  // Check if any moves are possible
  function canMove(board: Board): boolean {
    // Check for empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === null) return true;
      }
    }

    // Check for possible merges horizontally
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (board[row][col] === board[row][col + 1]) return true;
      }
    }

    // Check for possible merges vertically
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === board[row + 1][col]) return true;
      }
    }

    return false;
  }

  // Handle move in a direction
  const handleMove = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (gameStatus !== "playing") return;

      const { board: newBoard, scoreGained } = moveBoard(board, direction);

      // Check if board actually changed
      if (boardsEqual(board, newBoard)) return;

      // Add random tile
      addRandomTile(newBoard);

      // Update state
      setBoard(newBoard);
      setScore((prev) => prev + scoreGained);
      setLastMove(Date.now());

      // Check win condition
      if (checkWin(newBoard)) {
        setGameStatus("won");
        return;
      }

      // Check lose condition
      if (!canMove(newBoard)) {
        setGameStatus("lost");
      }
    },
    [board, gameStatus]
  );

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (gameStatus !== "playing") return;

      const keyMap: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };

      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, gameStatus]);

  // Reset game
  function resetGame() {
    setBoard(initializeBoard());
    setScore(0);
    setGameStatus("playing");
    setLastMove(Date.now());
  }

  // Get tile color based on value
  function getTileColor(value: number): string {
    const colorMap: Record<number, string> = {
      2: "bg-tile-2",
      4: "bg-tile-4",
      8: "bg-tile-8",
      16: "bg-tile-16",
      32: "bg-tile-32",
      64: "bg-tile-64",
      128: "bg-tile-128",
      256: "bg-tile-256",
      512: "bg-tile-512",
      1024: "bg-tile-1024",
      2048: "bg-tile-2048",
    };
    return colorMap[value] || "bg-card";
  }

  // Get text size based on value length
  function getTextSize(value: number): string {
    const digits = value.toString().length;
    if (digits <= 2) return "text-5xl";
    if (digits === 3) return "text-4xl";
    return "text-3xl";
  }

  // Get glow effect for high-value tiles
  function getGlowEffect(value: number): string {
    if (value >= 2048) return "shadow-glow-strong";
    if (value >= 512) return "shadow-glow";
    return "";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Atmospheric background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,200,255,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            2048
          </h1>
          <p className="text-muted-foreground text-sm">Combina fichas para alcanzar 2048</p>
        </header>

        {/* Score and Controls */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="bg-card border border-border rounded-lg px-6 py-3 flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Puntuación</div>
            <div className="text-3xl font-bold font-mono text-primary">{score}</div>
          </div>
          <Button onClick={resetGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow">
            <RotateCcw className="mr-2 h-5 w-5" />
            Reiniciar
          </Button>
        </div>

        {/* Game Board */}
        <div className="bg-card border-2 border-border rounded-xl p-4 shadow-2xl relative">
          <div className="grid grid-cols-4 gap-3">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}-${cell}-${lastMove}`;
                return (
                  <div
                    key={key}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center font-mono font-bold
                      transition-all duration-${TILE_MOVE_DURATION}
                      ${cell === null ? "bg-muted/30" : `${getTileColor(cell)} ${getGlowEffect(cell)}`}
                      ${cell !== null ? "scale-100 hover:scale-105" : ""}
                    `}
                    style={{
                      transitionProperty: "transform, background-color, box-shadow",
                    }}
                  >
                    {cell !== null && <span className={`${getTextSize(cell)} text-foreground drop-shadow-lg`}>{cell}</span>}
                  </div>
                );
              })
            )}
          </div>

          {/* Game Over Overlay */}
          {gameStatus !== "playing" && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
              {gameStatus === "won" ? (
                <>
                  <div className="text-center">
                    <Trophy className="h-20 w-20 text-tile-2048 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-4xl font-bold text-primary mb-2">¡Victoria!</h2>
                    <p className="text-muted-foreground">Has alcanzado 2048</p>
                    <p className="text-2xl font-mono font-bold text-accent mt-2">{score} puntos</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
                    <h2 className="text-4xl font-bold text-destructive mb-2">Game Over</h2>
                    <p className="text-muted-foreground">No hay movimientos posibles</p>
                    <p className="text-2xl font-mono font-bold text-accent mt-2">{score} puntos</p>
                  </div>
                </>
              )}
              <Button onClick={resetGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow">
                <RotateCcw className="mr-2 h-5 w-5" />
                Jugar de nuevo
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Usa las teclas de flecha ← → ↑ ↓ para mover las fichas</p>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            © 2026. Hecho con amor usando{" "}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Game2048;
