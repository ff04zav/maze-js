var MAZE;
const PLAYER_START = { row: 1, col: 1 };
var GOAL;

let playerPos = { ...PLAYER_START };
let gameWon = false;

// Initialize Game
function initGame() {
  MAZE = generateMaze(13, 9);
  GOAL = findFarthestCell(MAZE, PLAYER_START);
  const cols = MAZE[0].length;
  const container = document.getElementById("maze-container");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  // Generate Maze Grid
  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[0].length; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${row}-${col}`;

      if (MAZE[row][col] === 1) {
        cell.classList.add("wall");
      } else if (row === GOAL.row && col === GOAL.col) {
        const goal = document.createElement("div");
        goal.className = "goal";
        cell.appendChild(goal);
      }

      container.appendChild(cell);
    }
  }

  // Place Player
  updatePlayerPosition();
}

function generateMaze(width, height) {
  // Initialize maze with all walls (1)
  let maze = Array(height)
    .fill()
    .map(() => Array(width).fill(1));

  // Carve paths (0) using Recursive Backtracking
  function carve(x, y) {
    maze[y][x] = 0; // Mark current cell as path

    // Define directions in random order
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx * 2,
        ny = y + dy * 2;

      // Check if next cell is within bounds and a wall
      if (nx > 0 && nx < width && ny > 0 && ny < height && maze[ny][nx] === 1) {
        maze[y + dy][x + dx] = 0; // Break the wall between cells
        carve(nx, ny); // Recursively carve next cell
      }
    }
  }

  carve(1, 1); // Start carving from (1, 1)
  return maze;
}

function findFarthestCell(maze, playerStart) {
  const { row, col } = playerStart;
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));
  const queue = [{ row: row, col: col, dist: 0 }];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  let farthestCells = [{ row: row, col: col, dist: 0 }];

  visited[row][col] = true;

  while (queue.length > 0) {
    const current = queue.shift();

    // Update farthest cells
    if (current.dist > farthestCells[0].dist) {
      farthestCells = [current];
    } else if (current.dist === farthestCells[0].dist) {
      farthestCells.push(current);
    }

    // Explore neighbors
    for (const [dr, dc] of directions) {
      const newRow = current.row + dr;
      const newCol = current.col + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        queue.push({ row: newRow, col: newCol, dist: current.dist + 1 });
      }
    }
  }

  // Pick the bottom-leftmost cell among farthest positions
  farthestCells.sort((a, b) => b.row - a.row || a.col - b.col);
  return farthestCells[0];
}

// Move Player with Arrow Keys
document.addEventListener("keydown", (e) => {
  if (gameWon) return;

  const key = e.key;
  let newRow = playerPos.row;
  let newCol = playerPos.col;

  switch (key) {
    case "ArrowUp":
      newRow--;
      break;
    case "ArrowDown":
      newRow++;
      break;
    case "ArrowLeft":
      newCol--;
      break;
    case "ArrowRight":
      newCol++;
      break;
    default:
      return;
  }

  // Check valid move
  if (
    newRow >= 0 &&
    newRow < MAZE.length &&
    newCol >= 0 &&
    newCol < MAZE[0].length &&
    MAZE[newRow][newCol] !== 1
  ) {
    playerPos = { row: newRow, col: newCol };
    updatePlayerPosition();
    checkWin();
  }
});

// Add event listeners for mobile buttons
["up", "left", "down", "right"].forEach((dir) => {
  document.getElementById(`${dir}-btn`).addEventListener("click", () => {
    const event = new KeyboardEvent("keydown", {
      key: `Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}`,
    });
    document.dispatchEvent(event);
  });
});

// Update Player Position in UI
function updatePlayerPosition() {
  // Remove player from all cells
  document.querySelectorAll(".player").forEach((el) => el.remove());

  // Add player to current position
  const playerCell = document.getElementById(
    `cell-${playerPos.row}-${playerPos.col}`
  );
  const playerEl = document.createElement("div");
  playerEl.className = "player";
  playerCell.appendChild(playerEl);
}

// Check Win Condition
function checkWin() {
  if (playerPos.row === GOAL.row && playerPos.col === GOAL.col) {
    gameWon = true;
    document.getElementById("message").textContent = "You Win!";
  }
}

document.getElementById("restart-btn").addEventListener("click", () => {
  playerPos = { ...PLAYER_START };
  gameWon = false;
  document.getElementById("message").textContent = "";
  initGame();
});

// Start the game when page loads
window.onload = initGame;
