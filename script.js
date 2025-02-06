class Game {
      constructor(boardId, statusId, resetId) {
        this.board = document.getElementById(boardId);
        this.status = document.getElementById(statusId);
        this.resetButton = document.getElementById(resetId);
        this.gameMode = '2player';
        this.difficulty = 'easy';
        
        if (!this.board || !this.status || !this.resetButton) {
          console.error('Game elements not found');
          return;
        }

        this.cells = this.board.querySelectorAll('[data-cell]');
        this.currentPlayer = 'X';
        this.gameBoard = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.npcMoveDelay = 500; // Simulate thinking time
      }

      init() {
        if (!this.cells) {
          console.error('Game cells not found');
          return;
        }

        this.cells.forEach((cell, index) => {
          cell.addEventListener('click', (e) => this.handleClick(e, index));
        });
        
        if (this.resetButton) {
          this.resetButton.addEventListener('click', () => this.resetGame());
        }

        document.getElementById('gameMode').addEventListener('change', (e) => {
          this.gameMode = e.target.value;
          document.querySelector('.npc-only').style.display = 
            this.gameMode === 'npc' ? 'block' : 'none';
          this.resetGame();
        });

        document.getElementById('difficulty').addEventListener('change', (e) => {
          this.difficulty = e.target.value;
          this.resetGame();
        });
      }

      handleClick(e, index) {
        if (this.gameMode === 'npc' && this.currentPlayer === 'O') return;
        
        const cell = e.target;
        if (cell.textContent !== '' || !this.gameActive) return;

        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        this.gameBoard[index] = this.currentPlayer;

        if (this.checkWin()) {
          this.status.textContent = `Player ${this.currentPlayer} wins!`;
          this.gameActive = false;
          this.highlightWinningCombination();
          return;
        }

        if (this.checkDraw()) {
          this.status.textContent = "Game ended in a draw!";
          this.gameActive = false;
          return;
        }

        if (this.gameMode === '2player') {
          this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
          this.status.textContent = `Player ${this.currentPlayer}'s turn`;
        } else {
          this.status.textContent = "NPC's turn...";
          setTimeout(() => this.npcMove(), this.npcMoveDelay);
        }
      }

      npcMove() {
        if (!this.gameActive) return;

        let index;
        switch(this.difficulty) {
          case 'hard':
            index = this.getBestMove();
            break;
          case 'medium':
            index = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
            break;
          default: // easy
            index = this.getRandomMove();
        }

        const cell = this.cells[index];
        cell.textContent = 'O';
        cell.classList.add('o');
        this.gameBoard[index] = 'O';

        if (this.checkWin()) {
          this.status.textContent = "NPC wins!";
          this.gameActive = false;
          this.highlightWinningCombination();
          return;
        }

        if (this.checkDraw()) {
          this.status.textContent = "Game ended in a draw!";
          this.gameActive = false;
          return;
        }

        this.currentPlayer = 'X';
        this.status.textContent = `Player ${this.currentPlayer}'s turn`;
      }

      getRandomMove() {
        const availableMoves = this.gameBoard
          .map((cell, index) => cell === '' ? index : null)
          .filter(cell => cell !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }

      getBestMove() {
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < 9; i++) {
          if (this.gameBoard[i] === '') {
            this.gameBoard[i] = 'O';
            const score = this.minimax(this.gameBoard, 0, false);
            this.gameBoard[i] = '';
            if (score > bestScore) {
              bestScore = score;
              bestMove = i;
            }
          }
        }
        return bestMove;
      }

      minimax(board, depth, isMaximizing) {
        if (this.checkWinForMinimax('O')) return 1;
        if (this.checkDraw()) return 0;
        if (isMaximizing) {
          let bestScore = -Infinity;
          for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
              board[i] = 'O';
              const score = this.minimax(board, depth + 1, false);
              board[i] = '';
              bestScore = Math.max(score, bestScore);
            }
          }
          return bestScore;
        } else {
          let bestScore = Infinity;
          for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
              board[i] = 'X';
              const score = this.minimax(board, depth + 1, true);
              board[i] = '';
              bestScore = Math.min(score, bestScore);
            }
          }
          return bestScore;
        }
      }

      checkWinForMinimax(player) {
        return winningCombinations.some(combination => {
          return combination.every(index => this.gameBoard[index] === player);
        });
      }

      checkWin() {
        return winningCombinations.some(combination => {
          return combination.every(index => this.gameBoard[index] === this.currentPlayer);
        });
      }

      checkDraw() {
        return this.gameBoard.every(cell => cell !== '');
      }

      resetGame() {
        this.gameBoard = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.status.textContent = `Player ${this.currentPlayer}'s turn`;
        this.cells.forEach(cell => {
          cell.textContent = '';
          cell.classList.remove('x', 'o', 'winning');
        });
      }

      highlightWinningCombination() {
        winningCombinations.forEach(combination => {
          if (combination.every(index => this.gameBoard[index] === this.currentPlayer)) {
            combination.forEach(index => {
              this.cells[index].classList.add('winning');
            });
          }
        });
      }
    }

    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    // Initialize game
    const game = new Game('board1', 'status1', 'reset1');
    game.init();
