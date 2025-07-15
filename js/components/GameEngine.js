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
        if (this.game.isGameOver()) return false;

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

        this.trigger('moveStarted', { source, legalMoves: this.findLegalMoves(source) });

        return true;
    }

    onDrop(source, target) {
        try {
            const move = this.game.move({
                from: source,
                to: target,
                promotion: 'q'
            });
            this.updateMoveHistory();
            this.trigger('moveMade', move);
            this.trigger('gameStateChanged', this.getGameState());
        } catch (error) {
            return 'snapback';
        }


        return true;
    }

    findLegalMoves(square) {
        return this.game.moves({
            square: square,
            verbose: true
        });
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

            this.trigger('moveMade', result);
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

    loadFromSavedGame(savedGame) {
        try {
            const history = savedGame.moveHistory;
            this.game = new Chess();
            for (var i = 0; i < history.length; i++) {
                this.game.move(history[i]);
            }
            this.isOnlineGame = savedGame.gameMode === 'online' ? true : false;
            this.trigger('gameStateChanged', this.getGameState());
            return true;
        } catch (error) {
            console.error('Invalid game state:', error);
            return false;
        }
    }

    getGameState() {
        return {
            fen: this.game.fen(),
            turn: this.game.turn(),
            isCheck: this.game.isCheck(),
            isCheckmate: this.game.isCheckmate(),
            isStalemate: this.game.isStalemate(),
            isDraw: this.game.isDraw(),
            isGameOver: this.game.isGameOver(),
            moveHistory: [...this.moveHistory],
            gameMode: this.gameMode
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