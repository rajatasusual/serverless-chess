// GameController.js
// Main Game Controller - Handles component coordination and game flow
class GameController {
    constructor() {
        this.gameEngine = new GameEngine();
        this.uiManager = new UIManager();
        this.networkManager = new NetworkManager();
        this.urlManager = new URLManager();
        this.eventManager = new EventManager(this);
        this.storageManager = new GameStorageManager();
        this.currentMode = 'local';

        this.setupComponentEvents();
        this.initialize();
    }

    setupComponentEvents() {
        // Game engine events
        this.gameEngine.on('gameStateChanged', (gameState) => {
            this.uiManager.updateGameStatus(gameState);
            this.uiManager.updateMoveHistoryUI(gameState.moveHistory);

            // Save current game
            if (gameState.moveHistory.length > 0) {
                this.storageManager.saveCurrentGame(gameState);
            }

            if (this.currentMode === 'url') {
                this.urlManager.updateUrl(gameState.fen);
            }
        });

        this.gameEngine.on('moveMade', (data) => {
            if (this.currentMode === 'online') {
                this.networkManager.sendMove(data.move);
            }
        });

        // Network events
        this.networkManager.on('roomCreated', (data) => {
            this.uiManager.setRoomCodeDisplay(data.roomCode);
            this.uiManager.updateStatus('roomStatus', 'Waiting for opponent...', 'info');
        });

        this.networkManager.on('connecting', () => {
            this.uiManager.updateStatus('joinStatus', 'Connecting...', 'info');
        });

        this.networkManager.on('connected', () => {
            this.uiManager.hideAllModals();
            this.startOnlineGame();
        });

        this.networkManager.on('playerConnected', () => {
            this.uiManager.hideAllModals();
            this.startOnlineGame();
        });

        this.networkManager.on('connectionError', () => {
            this.uiManager.updateStatus('joinStatus', 'Failed to connect', 'error');
            this.uiManager.updateStatus('roomStatus', 'Connection error', 'error');
        });

        this.networkManager.on('disconnected', () => {
            this.uiManager.updateConnectionStatus('Disconnected', 'error');
        });

        this.networkManager.on('opponentMove', (move) => {
            this.gameEngine.makeMove(move);
        });

        this.networkManager.on('undoRequest', () => {
            this.gameEngine.undoMove();
        });

        this.networkManager.on('resetRequest', () => {
            this.gameEngine.resetGame();
        });

        // URL events
        this.urlManager.on('gameLoaded', (data) => {
            if (this.gameEngine.loadFromFen(data.fen)) {
                this.currentMode = 'url';
                this.gameEngine.setGameMode('url');
                this.uiManager.showGameInterface();
                this.gameEngine.initializeBoard('chessboard');
                this.uiManager.updateGameModeDisplay('URL Play');
                this.uiManager.hideConnectionStatus();
            }
        });
    }

    initialize() {
        this.uiManager.showMainMenu();
        this.urlManager.checkUrlForGame();
        this.checkForSavedGame();
    }

    checkForSavedGame() {
        const savedGame = this.storageManager.loadCurrentGame();
        if (savedGame) {
            this.uiManager.showResumeGameOption(savedGame);
        }
    }

    resumeSavedGame() {
        const savedGame = this.storageManager.loadCurrentGame();
        if (savedGame) {
            
            this.currentMode = savedGame.gameMode || 'local';

            this.gameEngine.loadFromSavedGame(savedGame);
            this.gameEngine.initializeBoard('chessboard');

            this.uiManager.showGameInterface();
            this.uiManager.updateGameModeDisplay(this.currentMode);
            this.uiManager.hideResumeGameOption();
        }
    }    

    // Game mode management
    startLocalGame() {
        this.currentMode = 'local';
        this.gameEngine.setGameMode('local');
        this.uiManager.showGameInterface();
        this.gameEngine.initializeBoard('chessboard');
        this.uiManager.updateGameModeDisplay('Local Play');
        this.uiManager.hideConnectionStatus();
    }

    startOnlineGame() {
        this.currentMode = 'online';
        const playerColor = this.networkManager.isRoomHost() ? 'white' : 'black';
        this.gameEngine.setGameMode('online', playerColor, true);
        this.uiManager.showGameInterface();
        this.gameEngine.initializeBoard('chessboard');
        this.uiManager.updateGameModeDisplay('Online Play');
        this.uiManager.showConnectionStatus();
        this.uiManager.updateConnectionStatus('Connected', 'success');
        this.uiManager.updatePlayerStatus(playerColor, true);

        const roomCode = this.networkManager.getRoomCode();
        if (roomCode) {
            this.uiManager.setRoomCodeDisplay(roomCode);
        }
    }

    // Modal management
    showCreateRoomModal() {
        this.uiManager.showModal('createRoom');
        this.networkManager.createRoom();
    }

    hideCreateRoomModal() {
        this.uiManager.hideAllModals();
        this.networkManager.disconnect();
    }

    showJoinRoomModal() {
        this.uiManager.showModal('joinRoom');
    }

    hideJoinRoomModal() {
        this.uiManager.hideAllModals();
    }

    showUrlPlayModal() {
        this.uiManager.showModal('urlPlay');
    }

    hideUrlPlayModal() {
        this.uiManager.hideAllModals();
    }

    showShareGameModal() {
        const gameUrl = this.urlManager.generateGameUrl(this.gameEngine.getFen());
        this.uiManager.setShareUrlDisplay(gameUrl);
        this.uiManager.showModal('shareGame');
    }

    hideShareGameModal() {
        this.uiManager.hideAllModals();
    }

    hideAllModals() {
        this.uiManager.hideAllModals();
    }

    // Network operations
    joinRoom() {
        const roomCode = this.uiManager.getRoomCodeInput();
        if (!roomCode) {
            this.uiManager.updateStatus('joinStatus', 'Please enter a room code', 'error');
            return;
        }
        this.networkManager.joinRoom(roomCode);
    }

    // URL operations
    loadFromUrl() {
        const url = this.uiManager.getGameUrlInput();
        if (!url) return;

        if (!this.urlManager.loadFromUrl(url)) {
            alert('Invalid game URL. Please check the URL and try again.');
        } else {
            this.uiManager.hideAllModals();
        }
    }

    // Game control methods
    undoMove() {
        if (this.currentMode === 'online') {
            this.networkManager.sendUndo();
        }
        this.gameEngine.undoMove();
    }

    resetGame() {
        if (this.currentMode === 'online') {
            this.networkManager.sendReset();
        }
        this.gameEngine.resetGame();

        if (this.currentMode === 'url') {
            this.urlManager.clearUrl();
        }
    }

    backToMenu() {
        this.uiManager.showMainMenu();
        this.networkManager.disconnect();
        this.gameEngine.resetGame();
        this.uiManager.hideConnectionStatus();

        if (this.currentMode === 'url') {
            this.urlManager.clearUrl();
        }

        this.currentMode = 'local';
        this.checkForSavedGame();
    }

    // Utility methods
    copyRoomCode() {
        const roomCode = this.networkManager.getRoomCode();
        if (roomCode) {
            this.uiManager.copyToClipboard(roomCode, 'copyRoomCodeBtn');
        }
    }

    copyShareUrl() {
        const gameUrl = this.urlManager.generateGameUrl(this.gameEngine.getFen());
        this.uiManager.copyToClipboard(gameUrl, 'copyShareUrlBtn');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}
