const gridSize = 10;
const numMines = 25;
let grid = [];
let currentPlayer = '○';
let gameOver = false;
let firstClick = true;

function startGame() {
    grid = [];
    currentPlayer = '○';
    gameOver = false;
    firstClick = true;
    document.getElementById('status').textContent = '';
    document.getElementById('restart-button').style.display = 'none';
    createGrid();
    renderGrid();
}

function createGrid() {
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = {
                mine: false,
                clicked: false,
                mark: '',
                adjacentMines: 0
            };
        }
    }
}

function placeMines(excludeRow, excludeCol) {
    let placedMines = 0;
    while (placedMines < numMines) {
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        if (!grid[row][col].mine && !isNearExclude(row, col, excludeRow, excludeCol)) {
            grid[row][col].mine = true;
            placedMines++;
        }
    }
    calculateAdjacentMines();
}

function isNearExclude(row, col, excludeRow, excludeCol) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (row === excludeRow + i && col === excludeCol + j) {
                return true;
            }
        }
    }
    return false;
}

function calculateAdjacentMines() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (!grid[row][col].mine) {
                grid[row][col].adjacentMines = countAdjacentMines(row, col);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (isValidCell(row + i, col + j) && grid[row + i][col + j].mine) {
                count++;
            }
        }
    }
    return count;
}

function isValidCell(row, col) {
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

function renderGrid() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (grid[i][j].clicked) {
                cell.classList.add('clicked');
                if (grid[i][j].mine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else {
                    const number = document.createElement('span');
                    number.className = 'number';
                    number.textContent = grid[i][j].adjacentMines > 0 ? grid[i][j].adjacentMines : '';
                    cell.appendChild(number);
                    cell.innerHTML += grid[i][j].mark;
                }
            }
            cell.addEventListener('click', () => handleClick(i, j));
            board.appendChild(cell);
        }
    }
}

function handleClick(row, col) {
    if (gameOver) return;
    if (firstClick) {
        placeMines(row, col);
        firstClick = false;
    }
    if (grid[row][col].mine && !grid[row][col].clicked) {
        grid[row][col].clicked = true;
        gameOver = true;
        document.getElementById('status').textContent = `${currentPlayer}の負け！`;
        document.getElementById('restart-button').style.display = 'block';
        revealMines();
    } else {
        if (!grid[row][col].clicked) {
            revealSafeArea(row, col);
        }
        grid[row][col].clicked = true;
        grid[row][col].mark = currentPlayer;
        if (checkWin()) {
            gameOver = true;
            document.getElementById('status').textContent = `${currentPlayer}の勝ち！`;
            document.getElementById('restart-button').style.display = 'block';
        } else {
            currentPlayer = currentPlayer === '○' ? '×' : '○';
        }
    }
    renderGrid();
}

function revealSafeArea(row, col) {
    if (!isValidCell(row, col) || grid[row][col].clicked || grid[row][col].mine) return;
    grid[row][col].clicked = true;
    if (grid[row][col].adjacentMines === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealSafeArea(row + i, col + j);
            }
        }
    }
}

function revealMines() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j].mine) {
                grid[i][j].clicked = true;
            }
        }
    }
    renderGrid();
}

function checkWin() {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j].mark === currentPlayer) {
                for (let [dx, dy] of directions) {
                    if (checkLine(i, j, dx, dy)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function checkLine(x, y, dx, dy) {
    let count = 0;
    while (isValidCell(x, y) && grid[x][y].mark === currentPlayer) {
        count++;
        if (count === 5) {
            return true;
        }
        x += dx;
        y += dy;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
