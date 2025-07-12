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