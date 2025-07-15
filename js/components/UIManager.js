// UI Manager - Handles all UI operations
class UIManager {
    constructor() {
        this.elements = this.getElements();
        this.setupStorageElements();
    }

    setupStorageElements() {
        this.resumeSection = document.getElementById('resumeGameSection');
        this.resumeGameBtn = document.getElementById('resumeGameBtn');
        this.resumeGameDate = document.getElementById('resumeGameDate');
        this.resumeGameMoves = document.getElementById('resumeGameMoves');
        this.lastSaveTime = document.getElementById('lastSaveTime');
        this.saveStatus = document.getElementById('saveStatus');

        this.lastMove = null;
        this.legalMoveHighlights = [];
    }

    getElements() {
        return {
            mainMenu: document.getElementById('mainMenu'),
            gameInterface: document.getElementById('gameInterface'),
            createRoomModal: document.getElementById('createRoomModal'),
            joinRoomModal: document.getElementById('joinRoomModal'),
            urlPlayModal: document.getElementById('urlPlayModal'),
            shareGameModal: document.getElementById('shareGameModal'),
            gameStatus: document.getElementById('gameStatus'),
            gameMessage: document.getElementById('gameMessage'),
            gameModeDisplay: document.getElementById('gameModeDisplay'),
            connectionStatus: document.getElementById('connectionStatus'),
            connectionStatusDisplay: document.getElementById('connectionStatusDisplay'),
            playerWhite: document.getElementById('playerWhite'),
            playerBlack: document.getElementById('playerBlack'),
            movesList: document.getElementById('movesList'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            roomCodeInput: document.getElementById('roomCodeInput'),
            gameUrlInput: document.getElementById('gameUrlInput'),
            shareUrlDisplay: document.getElementById('shareUrlDisplay'),
            currentRoomCode: document.getElementById('currentRoomCode'),
            roomStatus: document.getElementById('roomStatus'),
            joinStatus: document.getElementById('joinStatus'),
            moveSound: document.getElementById('moveSound'),
            checkSound: document.getElementById('checkSound'),
            checkmateSound: document.getElementById('checkmateSound'),
        };
    }

    showMainMenu() {
        this.show('mainMenu');
        this.hide('gameInterface');
        this.hideAllModals();
    }

    showGameInterface() {
        this.hide('mainMenu');
        this.show('gameInterface');
        this.hideAllModals();
    }

    show(elementKey) {
        const element = this.elements[elementKey];
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hide(elementKey) {
        const element = this.elements[elementKey];
        if (element) {
            element.classList.add('hidden');
        }
    }

    hideAllModals() {
        ['createRoomModal', 'joinRoomModal', 'urlPlayModal', 'shareGameModal'].forEach(modal => {
            this.hide(modal);
        });
    }

    showModal(modalType) {
        this.hideAllModals();
        const modalMap = {
            'createRoom': 'createRoomModal',
            'joinRoom': 'joinRoomModal',
            'urlPlay': 'urlPlayModal',
            'shareGame': 'shareGameModal'
        };

        const modalKey = modalMap[modalType];
        if (modalKey) {
            this.show(modalKey);

            // Focus input fields
            if (modalType === 'joinRoom' && this.elements.roomCodeInput) {
                setTimeout(() => this.elements.roomCodeInput.focus(), 100);
            }
            if (modalType === 'urlPlay' && this.elements.gameUrlInput) {
                setTimeout(() => this.elements.gameUrlInput.focus(), 100);
            }
        }
    }

    updateGameStatus(gameState) {
        if (!this.elements.gameStatus) return;

        let status = '';
        let message = '';
        let statusClass = 'status--info';

        if (gameState.isCheckmate) {
            const winner = gameState.turn === 'w' ? 'Black' : 'White';
            status = `${winner} wins by checkmate!`;
            statusClass = 'status--success';

            this.playSound(this.elements.checkmateSound);
        } else if (gameState.isStalemate) {
            status = 'Stalemate - Draw!';
            statusClass = 'status--warning';
        } else if (gameState.isDraw) {
            status = 'Draw!';
            statusClass = 'status--warning';
        } else {
            const turn = gameState.turn === 'w' ? 'White' : 'Black';
            status = `${turn}'s turn`;

            if (gameState.isCheck) {
                message = `${turn} is in check!`;
                statusClass = 'status--error';

                this.playSound(this.elements.checkSound);
            } else {
                this.playSound(this.elements.moveSound);
            }
        }

        this.elements.gameStatus.className = `status ${statusClass}`;
        this.elements.gameStatus.textContent = status;

        if (this.elements.gameMessage) {
            this.elements.gameMessage.textContent = message;
        }

        this.updatePlayerIndicators(gameState);
    }

    updatePlayerIndicators(gameState) {
        if (this.elements.playerWhite) {
            this.elements.playerWhite.classList.toggle('player--active', gameState.turn === 'w');
        }
        if (this.elements.playerBlack) {
            this.elements.playerBlack.classList.toggle('player--active', gameState.turn === 'b');
        }
    }

    updateMoveHistoryUI(moveHistory) {
        if (!this.elements.movesList) return;

        this.elements.movesList.innerHTML = '';

        for (let i = 0; i < moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moveHistory[i] || '';
            const blackMove = moveHistory[i + 1] || '';

            const movePair = document.createElement('div');
            movePair.className = 'move-pair';
            movePair.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span class="move-white">${whiteMove}</span>
                <span class="move-black">${blackMove}</span>
            `;
            this.elements.movesList.appendChild(movePair);
        }

        this.elements.movesList.scrollTop = this.elements.movesList.scrollHeight;
    }

    updateGameModeDisplay(mode) {
        if (this.elements.gameModeDisplay) {
            this.elements.gameModeDisplay.textContent = mode;
        }
    }

    updateConnectionStatus(status, type) {
        if (this.elements.connectionStatusDisplay) {
            this.elements.connectionStatusDisplay.className = `status status--${type}`;
            this.elements.connectionStatusDisplay.textContent = status;
        }
    }

    updateStatus(elementKey, message, type) {
        const element = this.elements[elementKey];
        if (element) {
            element.className = `status status--${type}`;
            element.textContent = message;
        }
    }

    setRoomCodeDisplay(roomCode) {
        if (this.elements.roomCodeDisplay) {
            this.elements.roomCodeDisplay.value = roomCode;
        }
        if (this.elements.currentRoomCode) {
            this.elements.currentRoomCode.textContent = roomCode;
        }
    }

    setShareUrlDisplay(url) {
        if (this.elements.shareUrlDisplay) {
            this.elements.shareUrlDisplay.value = url;
        }
    }

    getRoomCodeInput() {
        return this.elements.roomCodeInput ? this.elements.roomCodeInput.value.trim() : '';
    }

    getGameUrlInput() {
        return this.elements.gameUrlInput ? this.elements.gameUrlInput.value.trim() : '';
    }

    showConnectionStatus() {
        this.show('connectionStatus');
    }

    hideConnectionStatus() {
        this.hide('connectionStatus');
    }

    updatePlayerStatus(playerColor, isOnlineGame) {
        const whiteStatus = this.elements.playerWhite?.querySelector('.player-status');
        const blackStatus = this.elements.playerBlack?.querySelector('.player-status');

        if (whiteStatus && blackStatus) {
            if (isOnlineGame) {
                whiteStatus.textContent = playerColor === 'white' ? 'You' : 'Opponent';
                blackStatus.textContent = playerColor === 'black' ? 'You' : 'Opponent';
            } else {
                whiteStatus.textContent = '';
                blackStatus.textContent = '';
            }
        }
    }

    // --- Resume Game UI ---
    showResumeGameOption(savedGame) {
        if (!savedGame) return;
        this.resumeSection.classList.remove('hidden');
        this.resumeGameDate.textContent = new Date(savedGame.timestamp).toLocaleString();
        this.resumeGameMoves.textContent = savedGame.moveHistory ? savedGame.moveHistory.length : 0;
    }
    hideResumeGameOption() {
        this.resumeSection.classList.add('hidden');
    }

    async copyToClipboard(text, buttonId) {
        try {
            await navigator.clipboard.writeText(text);
            const button = document.getElementById(buttonId);
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    // --- Moves Behavior UI ---
    // Legal move highlighting methods
    highlightLegalMoves(legalMoves, moves) {
        
        this.clearLegalMoveHighlights();

        if (moves.length === 0) return;

        // Highlight the source square
        this.highlightSquare(legalMoves, 'legal-move-source');

        // Highlight all possible target squares
        moves.forEach(move => {
            this.highlightSquare(move.to, 'legal-move-target');
        });

        this.legalMoveHighlights = [legalMoves, ...moves.map(m => m.to)];
    }

    clearLegalMoveHighlights() {
        this.legalMoveHighlights.forEach(square => {
            this.removeHighlight(square, 'legal-move-source');
            this.removeHighlight(square, 'legal-move-target');
        });
        this.legalMoveHighlights = [];
    }

    // Last move highlighting methods
    highlightLastMove(move) {
        // Clear previous last move highlights
        this.clearLastMoveHighlights();

        if (move) {
            // Highlight from and to squares
            this.highlightSquare(move.from, 'last-move-from');
            this.highlightSquare(move.to, 'last-move-to');
        }

        this.lastMove = move;
    }

    clearLastMoveHighlights() {
        if (this.lastMove) {
            this.removeHighlight(this.lastMove.from, 'last-move-from');
            this.removeHighlight(this.lastMove.to, 'last-move-to');
        }
    }

    // Utility highlighting methods
    highlightSquare(square, className) {
        const $square = this.getSquareElement(square);
        if ($square) {
            $square.addClass(className);
        }
    }

    removeHighlight(square, className) {
        const $square = this.getSquareElement(square);
        if ($square) {
            $square.removeClass(className);
        }
    }

    getSquareElement(square) {
        // This works with the standard chessboard.js CSS classes
        return $('#chessboard').find('.square-' + square);
    }

    playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }
}