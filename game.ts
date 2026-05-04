// Types

type Player = 'X' | 'O';
type Cell = Player | null;
type Mode = 'ai' | 'human';

interface WinResult {
  type: 'win';
  player: Player;
}

interface TieResult {
  type: 'tie';
}

type GameResult = WinResult | TieResult;

interface Scores {
  X: number;
  O: number;
  T: number;
}

// Constants

const WINS: readonly [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

// State

let board: Cell[] = Array(9).fill(null);
let current: Player = 'X';
let gameOver: boolean = false;
let mode: Mode = 'ai';
let scores: Scores = { X: 0, O: 0, T: 0 };

// DOM helpers

// Get an element by ID, throwing if it doesn't exist
function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

// Mode Switch

// Switch between AI and 2 player mode
function setMode(m: Mode): void {
  mode = m;
  getEl('vs-ai-btn').classList.toggle('active', m === 'ai');
  getEl('vs-human-btn').classList.toggle('active', m === 'human');
  getEl('x-label').textContent = m === 'ai' ? 'You (X)' : 'Player X';
  getEl('o-label').textContent = m === 'ai' ? 'CPU (O)' : 'Player O';
  newGame();
}

// Human

// Handle a click at board index `i`
function handleClick(i: number): void {
  if (gameOver || board[i]) return;
  if (mode === 'ai' && current === 'O') return; // block clicks during AI turn
  makeMove(i, current);
  if (!gameOver && mode === 'ai' && current === 'O') {
    aiMove();
  }
}

// Logic behind move

// Place a mark for `player` at board index `i`, then check for a result
function makeMove(i: number, player: Player): void {
  board[i] = player;

  const boardEl = getEl('board');
  const cell = boardEl.children[i] as HTMLElement;
  const mark = getEl('c' + i);

  cell.classList.add('taken', player === 'X' ? 'x-cell' : 'o-cell');
  mark.textContent = player;

  const result = checkResult();
  if (result) {
    endGame(result);
  } else {
    current = current === 'X' ? 'O' : 'X';
    updateTurnUI();
  }
}

// AI Behavior

// Trigger the AI to pick and play a move after a short delay
function aiMove(): void {
  const thinking = getEl('thinking');
  const indicator = getEl<HTMLElement>('turn-indicator');

  thinking.classList.add('show');
  indicator.style.opacity = '0';

  const delay: number = 400 + Math.random() * 300;

  setTimeout(() => {
    thinking.classList.remove('show');
    indicator.style.opacity = '1';
    if (gameOver) return;
    const move = getBestMove();
    if (move !== -1) makeMove(move, 'O');
  }, delay);
}

/**
 * Choose the best available cell for the AI (O):
 * 1. Win immediately if possible
 * 2. Block the human from winning
 * 3. Take the center
 * 4. Take a random corner
 * 5. Take a random edge
 * @returns Board index, or -1 if no move is available.
 */
function getBestMove(): number {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      if (checkWinner() === 'O') { board[i] = null; return i; }
      board[i] = null;
    }
  }
  // Block X from winning
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'X';
      if (checkWinner() === 'X') { board[i] = null; return i; }
      board[i] = null;
    }
  }
  // Take center
  if (!board[4]) return 4;
  // Take a random corner
  const corners: number[] = [0, 2, 6, 8].filter(c => !board[c]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Take any edge
  const edges: number[] = [1, 3, 5, 7].filter(e => !board[e]);
  if (edges.length) return edges[Math.floor(Math.random() * edges.length)];
  return -1;
}

// Detects a win or tie

// Return the winning player, or null if nobody has won yet
function checkWinner(): Player | null {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
}

// Return a result object if the game is over, otherwise null
function checkResult(): GameResult | null {
  const winner = checkWinner();
  if (winner) return { type: 'win', player: winner };
  if (board.every(c => c !== null)) return { type: 'tie' };
  return null;
}

// End of the game

// Finalise the game, update scores, highlight winning cells, show outcome
function endGame(result: GameResult): void {
  gameOver = true;

  const msg = getEl('outcome-msg');
  const sub = getEl('outcome-sub');
  const indicator = getEl<HTMLElement>('turn-indicator');
  indicator.style.opacity = '0';

  if (result.type === 'win') {
    const p: Player = result.player;
    scores[p]++;
    getEl(p === 'X' ? 'x-score' : 'o-score').textContent = String(scores[p]);

    // Highlight winning cells
    for (const [a, b, c] of WINS) {
      if (board[a] === p && board[b] === p && board[c] === p) {
        const boardEl = getEl('board');
        [a, b, c].forEach(i => {
          (boardEl.children[i] as HTMLElement).classList.add('winner-cell');
        });
      }
    }

    if (mode === 'ai') {
      msg.textContent = p === 'X' ? 'You Win!' : 'CPU Wins!';
      sub.textContent = p === 'X' ? 'Impressive, human.' : 'Not even Zach could grade that.';
    } else {
      msg.textContent = `Player ${p} Wins!`;
      sub.textContent = 'Well played.';
    }
    msg.className = `outcome-msg visible ${p === 'X' ? 'x-wins' : 'o-wins'}`;
  } else {
    scores.T++;
    getEl('tie-score').textContent = String(scores.T);
    msg.textContent = "It's a Tie!";
    msg.className = 'outcome-msg visible tie';
    sub.textContent = 'Great minds think alike.';
  }

  sub.classList.add('visible');
}

// UI Helpers

// Refreshes the turn indicator and score box highlights
function updateTurnUI(): void {
  const indicator = getEl('turn-indicator');
  const xBox = getEl('x-score-box');
  const oBox = getEl('o-score-box');

  if (current === 'X') {
    indicator.innerHTML = `<span class="x-text">X</span>'s turn`;
    xBox.classList.add('active-turn');
    oBox.classList.remove('active-turn');
  } else {
    indicator.innerHTML = `<span class="o-text">O</span>'s turn`;
    oBox.classList.add('active-turn');
    xBox.classList.remove('active-turn');
  }
}

// Reset the board while keeping scores
function newGame(): void {
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;

  const boardEl = getEl('board');
  for (let i = 0; i < 9; i++) {
    const cell = boardEl.children[i] as HTMLElement;
    cell.className = 'cell';
    cell.setAttribute('onclick', `handleClick(${i})`);
    getEl('c' + i).textContent = '';
  }

  getEl('outcome-msg').className = 'outcome-msg';
  getEl('outcome-sub').className = 'outcome-sub';
  getEl<HTMLElement>('turn-indicator').style.opacity = '1';
  getEl('thinking').classList.remove('show');
  updateTurnUI();
}

// Init
updateTurnUI();