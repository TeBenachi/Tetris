const ctx = document.getElementById('tetris').getContext('2d')
const message = document.getElementById('message')
const scoreElement = document.getElementById('score')

const ROW = 15
const COL = COLUMN = 10
const SQ = squareSize = 30 // px
const VACANT = "#172a45"

// Drawing a square
drawSquare = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "#172a45";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Creating a board
let board = [];
for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = VACANT; // Initially all cells are empty 
    }
}

// Drawing a board
drawBoard = () => {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();

// Pieces and colors
const PIECES = [
    [Z, "#3eea3d"],
    [S, "#00baff"],
    [T, "#00B0DB"],
    [O, "#ea3daf"],
    [L, "#ffde37"],
    [I, "#bc8cff"],
    [J, "#00EDFF"]
];

// Generate a random piece
function randomPiece() {
    let r = randomN = Math.floor(Math.random() * PIECES.length)
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

// Object Piece
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // Piece cordinate position
    this.x = 3;
    this.y = -2;
}

// Fill function 
Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// Drawing a piece to the board
Piece.prototype.draw = function () {
    this.fill(this.color);
}

// Undraw a piece
Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

//Move down 
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        // Lock the piece and generate a new piece
        this.lock();
        p = randomPiece();
    }
}

//Move Right
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//Move Left 
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

//Rotate a piece
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    // When hitting right or left wall, move back one space
    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            kick = -1;
        } else {
            kick = 1;
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function () {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // Skip the vacan squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            // Game over when pieces reach the top wall
            if (this.y + r < 0) {
                message.innerHTML = `<div class="alert">Game Over</div>`;
                gameOver = true;
                break;
            }
            // 
            board[this.y + r][this.x + c] = this.color;
        }
    }

    // Removing a completed row
    for (r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if (isRowFull) {
            // Move above rows down after removing completed row
            for (y = r; y > 1; y--) {
                for (c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for (c = 0; c < COL; c++) {
                board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    drawBoard();

    // update the score
    scoreElement.innerHTML = score;
}

// Collision function 
Piece.prototype.collision = function (x, y, piece) {
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {
            // Skip if the square is empty
            if (!piece[r][c]) {
                continue;
            }
            // Cordinate after moving
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // Prevent a piece goes outside of board
            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            // Check to see if there are already locked pieces
            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}



// Controlling a piece
document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        p.moveLeft();
        dropStart = Date.now();  // Prevent moving down while controlling
    } else if (event.keyCode == 38) {
        p.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) {
        p.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) {
        p.moveDown();
    }
}

// Drop every 1 second 
let dropStart = Date.now();
let gameOver = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

drop();