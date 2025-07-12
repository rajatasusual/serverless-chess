// Simplified Chess Game Application with Clear Separation of Concerns

// Game Engine - Handles chess game logic
class GameEngine {
    constructor() {
        this.game = new Chess();
        this.board = null;
        this.moveHistory = [];
        this.gameMode = 'local';
        this.playerColor = 'white';
        this.isOnlineGame = false;
        this.eventHandlers = {};
    }

    // Event system
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    trigger(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }
    }

    // Initialize chess board
    initializeBoard(boardId) {
        try {
            const config = {
                position: this.game.fen(),
                draggable: true,
                onDragStart: (source, piece) => this.onDragStart(source, piece),
                onDrop: (source, target) => this.onDrop(source, target),
                onSnapEnd: () => this.board.position(this.game.fen())
            };

            if (this.isOnlineGame) {
                config.orientation = this.playerColor;
            }

            this.board = Chessboard(boardId, config);
            this.updateMoveHistory();
            this.trigger('gameStateChanged', this.getGameState());
            return true;
        } catch (error) {
            console.error('Board initialization error:', error);
            return false;
        }
    }

    onDragStart(source, piece) {
        if (this.game.game_over()) return false;

        if (this.isOnlineGame) {
            if (this.game.turn() !== this.playerColor[0]) return false;
            if ((this.playerColor === 'white' && piece.search(/^b/) !== -1) ||
                (this.playerColor === 'black' && piece.search(/^w/) !== -1)) {
                return false;
            }
        } else {
            if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }
        return true;
    }

    onDrop(source, target) {
        const move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        this.updateMoveHistory();
        this.trigger('moveMade', { move });
        this.trigger('gameStateChanged', this.getGameState());
        return true;
    }

    makeMove(move) {
        const result = this.game.move(move);
        if (result && this.board) {
            this.board.position(this.game.fen());
            this.updateMoveHistory();
            this.trigger('gameStateChanged', this.getGameState());
        }
        return result;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;
        
        const result = this.game.undo();
        if (result && this.board) {
            this.board.position(this.game.fen());
            this.updateMoveHistory();
            this.trigger('gameStateChanged', this.getGameState());
        }
        return result;
    }

    resetGame() {
        this.game.reset();
        if (this.board) {
            this.board.position(this.game.fen());
        }
        this.moveHistory = [];
        this.trigger('gameStateChanged', this.getGameState());
    }

    loadFromFen(fen) {
        try {
            this.game.load(fen);
            if (this.board) {
                this.board.position(this.game.fen());
            }
            this.updateMoveHistory();
            this.trigger('gameStateChanged', this.getGameState());
            return true;
        } catch (error) {
            console.error('Invalid FEN:', error);
            return false;
        }
    }

    getGameState() {
        return {
            fen: this.game.fen(),
            turn: this.game.turn(),
            isCheck: this.game.in_check(),
            isCheckmate: this.game.in_checkmate(),
            isStalemate: this.game.in_stalemate(),
            isDraw: this.game.in_draw(),
            isGameOver: this.game.game_over(),
            moveHistory: [...this.moveHistory]
        };
    }

    updateMoveHistory() {
        this.moveHistory = this.game.history();
    }

    setGameMode(mode, playerColor = 'white', isOnline = false) {
        this.gameMode = mode;
        this.playerColor = playerColor;
        this.isOnlineGame = isOnline;
    }

    getFen() {
        return this.game.fen();
    }

    getMoveHistory() {
        return [...this.moveHistory];
    }
}

// UI Manager - Handles all UI operations
class UIManager {
    constructor() {
        this.elements = this.getElements();
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
            joinStatus: document.getElementById('joinStatus')
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

    updateMoveHistory(moveHistory) {
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
}

// Network Manager - Handles online connections
class NetworkManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.roomCode = null;
        this.isHost = false;
        this.eventHandlers = {};
    }

    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    trigger(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Network event handler error:', error);
                }
            });
        }
    }

    createRoom() {
        try {
            this.peer = new Peer();
            this.isHost = true;

            this.peer.on('open', (id) => {
                this.roomCode = id;
                this.trigger('roomCreated', { roomCode: id });
            });

            this.peer.on('connection', (conn) => {
                this.connection = conn;
                this.setupConnection();
                this.trigger('playerConnected');
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.trigger('connectionError', err);
            });
        } catch (error) {
            console.error('Error creating room:', error);
            this.trigger('connectionError', error);
        }
    }

    joinRoom(roomCode) {
        try {
            this.peer = new Peer();
            this.isHost = false;
            this.roomCode = roomCode;

            this.peer.on('open', () => {
                this.trigger('connecting');
                this.connection = this.peer.connect(roomCode);
                this.setupConnection();
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.trigger('connectionError', err);
            });
        } catch (error) {
            console.error('Error joining room:', error);
            this.trigger('connectionError', error);
        }
    }

    setupConnection() {
        if (!this.connection) return;

        this.connection.on('open', () => {
            this.trigger('connected');
        });

        this.connection.on('data', (data) => {
            this.handleMessage(data);
        });

        this.connection.on('close', () => {
            this.trigger('disconnected');
        });

        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
            this.trigger('connectionError', err);
        });
    }

    handleMessage(data) {
        switch (data.type) {
            case 'move':
                this.trigger('opponentMove', data.move);
                break;
            case 'undo':
                this.trigger('undoRequest');
                break;
            case 'reset':
                this.trigger('resetRequest');
                break;
        }
    }

    sendMessage(data) {
        if (this.connection?.open) {
            this.connection.send(data);
        }
    }

    sendMove(move) {
        this.sendMessage({ type: 'move', move });
    }

    sendUndo() {
        this.sendMessage({ type: 'undo' });
    }

    sendReset() {
        this.sendMessage({ type: 'reset' });
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.roomCode = null;
        this.isHost = false;
    }

    getRoomCode() {
        return this.roomCode;
    }

    isRoomHost() {
        return this.isHost;
    }

    isConnected() {
        return this.connection?.open || false;
    }
}

// URL Manager - Handles URL-based game sharing
class URLManager {
    constructor() {
        this.eventHandlers = {};
    }

    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    trigger(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('URL event handler error:', error);
                }
            });
        }
    }

    generateGameUrl(fen) {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}#${encodeURIComponent(fen)}`;
    }

    loadFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const fen = decodeURIComponent(urlObj.hash.substring(1));
            
            if (fen) {
                this.trigger('gameLoaded', { fen });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Invalid URL:', error);
            return false;
        }
    }

    checkUrlForGame() {
        const hash = window.location.hash;
        if (hash) {
            try {
                const fen = decodeURIComponent(hash.substring(1));
                this.trigger('gameLoaded', { fen });
                return true;
            } catch (error) {
                console.error('Invalid FEN in URL:', error);
                return false;
            }
        }
        return false;
    }

    updateUrl(fen) {
        window.location.hash = encodeURIComponent(fen);
    }

    clearUrl() {
        window.location.hash = '';
    }
}

// Main Game Controller
class GameController {
    constructor() {
        this.gameEngine = new GameEngine();
        this.uiManager = new UIManager();
        this.networkManager = new NetworkManager();
        this.urlManager = new URLManager();
        this.currentMode = 'local';
        
        this.setupComponentEvents();
        this.setupUserEvents();
        this.initialize();
    }

    setupComponentEvents() {
        // Game engine events
        this.gameEngine.on('gameStateChanged', (gameState) => {
            this.uiManager.updateGameStatus(gameState);
            this.uiManager.updateMoveHistory(gameState.moveHistory);
            
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

    setupUserEvents() {
        // Main menu buttons
        this.addButtonHandler('playLocalBtn', () => this.startLocalGame());
        this.addButtonHandler('createRoomBtn', () => this.showCreateRoomModal());
        this.addButtonHandler('joinRoomBtn', () => this.showJoinRoomModal());
        this.addButtonHandler('playFromUrlBtn', () => this.showUrlPlayModal());

        // Modal buttons
        this.addButtonHandler('cancelCreateRoomBtn', () => this.hideCreateRoomModal());
        this.addButtonHandler('cancelJoinRoomBtn', () => this.hideJoinRoomModal());
        this.addButtonHandler('cancelUrlPlayBtn', () => this.hideUrlPlayModal());
        this.addButtonHandler('copyRoomCodeBtn', () => this.copyRoomCode());
        this.addButtonHandler('connectRoomBtn', () => this.joinRoom());
        this.addButtonHandler('loadFromUrlBtn', () => this.loadFromUrl());

        // Game controls
        this.addButtonHandler('backToMenuBtn', () => this.backToMenu());
        this.addButtonHandler('undoMoveBtn', () => this.undoMove());
        this.addButtonHandler('resetGameBtn', () => this.resetGame());
        this.addButtonHandler('shareGameBtn', () => this.showShareGameModal());
        this.addButtonHandler('closeShareModalBtn', () => this.hideShareGameModal());
        this.addButtonHandler('copyShareUrlBtn', () => this.copyShareUrl());

        // Enter key handlers
        this.addEnterKeyHandler('roomCodeInput', () => this.joinRoom());
        this.addEnterKeyHandler('gameUrlInput', () => this.loadFromUrl());

        // ESC key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    addButtonHandler(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    handler();
                } catch (error) {
                    console.error(`Error in ${buttonId} handler:`, error);
                }
            });
        }
    }

    addEnterKeyHandler(inputId, handler) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    try {
                        handler();
                    } catch (error) {
                        console.error(`Error in ${inputId} enter handler:`, error);
                    }
                }
            });
        }
    }

    initialize() {
        this.uiManager.showMainMenu();
        this.urlManager.checkUrlForGame();
    }

    // Game mode methods
    startLocalGame() {
        this.currentMode = 'local';
        this.gameEngine.setGameMode('local');
        this.uiManager.showGameInterface();
        this.gameEngine.initializeBoard('chessboard');
        this.uiManager.updateGameModeDisplay('Local Play');
        this.uiManager.hideConnectionStatus();
    }

    // Modal methods
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

    // Network methods
    joinRoom() {
        const roomCode = this.uiManager.getRoomCodeInput();
        if (!roomCode) {
            this.uiManager.updateStatus('joinStatus', 'Please enter a room code', 'error');
            return;
        }
        this.networkManager.joinRoom(roomCode);
    }

    loadFromUrl() {
        const url = this.uiManager.getGameUrlInput();
        if (!url) return;

        if (!this.urlManager.loadFromUrl(url)) {
            alert('Invalid game URL. Please check the URL and try again.');
        } else {
            this.uiManager.hideAllModals();
        }
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new GameController();
        console.log('Chess game initialized successfully');
        window.chessGame = game; // For debugging
    } catch (error) {
        console.error('Failed to initialize chess game:', error);
    }
});