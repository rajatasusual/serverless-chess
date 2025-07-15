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
        
        this.boardId = 'chessboard';

        this.lastMove = null;
        this.legalMoveHighlights = [];
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

            this.boardId = boardId;
            
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

        // Clear any existing highlights
        this.clearLegalMoveHighlights();

        // Show legal moves for this piece
        this.highlightLegalMoves(source);

        return true;
    }

    onDrop(source, target) {
        try {

            // Clear legal move highlights
            this.clearLegalMoveHighlights();

            const move = this.game.move({
                from: source,
                to: target,
                promotion: 'q'
            });
            this.updateMoveHistory();
            this.trigger('moveMade', { move });
            this.trigger('gameStateChanged', this.getGameState());

            // Highlight the last move
            this.highlightLastMove(move);

            // Store the last move for highlighting
            this.lastMove = move;
        } catch (error) {
            return 'snapback';
        }


        return true;
    }

    // Legal move highlighting methods
    highlightLegalMoves(square) {
        const moves = this.game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        // Highlight the source square
        this.highlightSquare(square, 'legal-move-source');
        
        // Highlight all possible target squares
        moves.forEach(move => {
            this.highlightSquare(move.to, 'legal-move-target');
        });
        
        this.legalMoveHighlights = [square, ...moves.map(m => m.to)];
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
        return $('#' + this.boardId).find('.square-' + square);
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

        this.clearLastMoveHighlights();

        const result = this.game.undo();
        if (result) {
            this.lastMove = result;
            this.highlightLastMove(result);
        }
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
            gameMode: this.gameMode,
            lastMove: this.lastMove,
            legalMoveHighlights: this.legalMoveHighlights 
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