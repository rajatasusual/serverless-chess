// EventManager.js
// Event Manager - Handles all DOM events and user interactions
class EventManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.eventHandlers = new Map();
        this.isInitialized = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.isInitialized) {
            console.warn('EventManager already initialized');
            return;
        }

        this.setupMenuEvents();
        this.setupModalEvents();
        this.setupGameControlEvents();
        this.setupKeyboardEvents();
        this.setupGlobalEvents();

        this.isInitialized = true;
        console.log('EventManager initialized successfully');
    }

    setupMenuEvents() {
        // Main menu navigation buttons
        this.addButtonHandler('playLocalBtn', () => {
            this.gameController.startLocalGame();
        });

        this.addButtonHandler('createRoomBtn', () => {
            this.gameController.showCreateRoomModal();
        });

        this.addButtonHandler('joinRoomBtn', () => {
            this.gameController.showJoinRoomModal();
        });

        this.addButtonHandler('playFromUrlBtn', () => {
            this.gameController.showUrlPlayModal();
        });
    }

    setupModalEvents() {
        // Create room modal
        this.addButtonHandler('cancelCreateRoomBtn', () => {
            this.gameController.hideCreateRoomModal();
        });

        this.addButtonHandler('copyRoomCodeBtn', () => {
            this.gameController.copyRoomCode();
        });

        // Join room modal
        this.addButtonHandler('cancelJoinRoomBtn', () => {
            this.gameController.hideJoinRoomModal();
        });

        this.addButtonHandler('connectRoomBtn', () => {
            this.gameController.joinRoom();
        });

        this.addEnterKeyHandler('roomCodeInput', () => {
            this.gameController.joinRoom();
        });

        // URL play modal
        this.addButtonHandler('cancelUrlPlayBtn', () => {
            this.gameController.hideUrlPlayModal();
        });

        this.addButtonHandler('loadFromUrlBtn', () => {
            this.gameController.loadFromUrl();
        });

        this.addEnterKeyHandler('gameUrlInput', () => {
            this.gameController.loadFromUrl();
        });

        // Share game modal
        this.addButtonHandler('closeShareModalBtn', () => {
            this.gameController.hideShareGameModal();
        });

        this.addButtonHandler('copyShareUrlBtn', () => {
            this.gameController.copyShareUrl();
        });
    }

    setupGameControlEvents() {
        // Game interface controls
        this.addButtonHandler('backToMenuBtn', () => {
            this.gameController.backToMenu();
        });

        this.addButtonHandler('undoMoveBtn', () => {
            this.gameController.undoMove();
        });

        this.addButtonHandler('resetGameBtn', () => {
            this.gameController.resetGame();
        });

        this.addButtonHandler('shareGameBtn', () => {
            this.gameController.showShareGameModal();
        });
    }

    setupKeyboardEvents() {
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.gameController.hideAllModals();
            }
        });

        // Additional keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'u':
                case 'U':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.gameController.undoMove();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.gameController.resetGame();
                    }
                    break;
                case 's':
                case 'S':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.gameController.showShareGameModal();
                    }
                    break;
            }
        });
    }

    setupGlobalEvents() {
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.gameController.hideAllModals();
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', (e) => {
            this.handlePageUnload(e);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    // Event handler utility methods
    addButtonHandler(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (button) {
            const wrappedHandler = (e) => {
                e.preventDefault();
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in ${buttonId} handler:`, error);
                    this.showErrorMessage(`An error occurred. Please try again.`);
                }
            };

            button.addEventListener('click', wrappedHandler);
            this.eventHandlers.set(buttonId, wrappedHandler);
        } else {
            console.warn(`Button with id '${buttonId}' not found`);
        }
    }

    addEnterKeyHandler(inputId, handler) {
        const input = document.getElementById(inputId);
        if (input) {
            const wrappedHandler = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    try {
                        handler(e);
                    } catch (error) {
                        console.error(`Error in ${inputId} enter handler:`, error);
                        this.showErrorMessage(`An error occurred. Please try again.`);
                    }
                }
            };

            input.addEventListener('keypress', wrappedHandler);
            this.eventHandlers.set(`${inputId}_enter`, wrappedHandler);
        } else {
            console.warn(`Input with id '${inputId}' not found`);
        }
    }

    // Input validation helpers
    validateRoomCode(roomCode) {
        if (!roomCode || roomCode.trim().length === 0) {
            return { valid: false, message: 'Please enter a room code' };
        }

        if (roomCode.length < 6) {
            return { valid: false, message: 'Room code must be at least 6 characters' };
        }

        return { valid: true };
    }

    validateGameUrl(url) {
        if (!url || url.trim().length === 0) {
            return { valid: false, message: 'Please enter a game URL' };
        }

        try {
            new URL(url);
            return { valid: true };
        } catch (error) {
            return { valid: false, message: 'Please enter a valid URL' };
        }
    }

    // Event handling for page lifecycle
    handlePageHidden() {
        // Pause timers, save state, etc.
        console.log('Page hidden - pausing activities');
    }

    handlePageVisible() {
        // Resume timers, refresh state, etc.
        console.log('Page visible - resuming activities');
    }

    handlePageUnload(e) {
        // Clean up connections, save state
        if (this.gameController.currentMode === 'online') {
            // Don't show confirmation for online games to avoid disrupting multiplayer
            return;
        }

        // For local games, optionally warn about unsaved progress
        const message = 'Are you sure you want to leave? Your game progress may be lost.';
        e.returnValue = message;
        return message;
    }

    handleWindowResize() {
        // Adjust board size or layout if needed
        if (this.gameController.gameEngine && this.gameController.gameEngine.board) {
            // Trigger board resize if chessboard.js supports it
            try {
                this.gameController.gameEngine.board.resize();
            } catch (error) {
                // Silently ignore resize errors
            }
        }
    }

    // Error handling and user feedback
    showErrorMessage(message) {
        // Create or update error display
        let errorDisplay = document.getElementById('globalErrorDisplay');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'globalErrorDisplay';
            errorDisplay.className = 'error-message';
            document.body.appendChild(errorDisplay);
        }

        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDisplay.style.display = 'none';
        }, 5000);
    }

    // Cleanup methods
    removeEventListener(elementId) {
        const handler = this.eventHandlers.get(elementId);
        if (handler) {
            const element = document.getElementById(elementId);
            if (element) {
                element.removeEventListener('click', handler);
                this.eventHandlers.delete(elementId);
            }
        }
    }

    removeAllEventListeners() {
        this.eventHandlers.forEach((handler, elementId) => {
            this.removeEventListener(elementId);
        });
        this.eventHandlers.clear();
    }

    destroy() {
        this.removeAllEventListeners();
        this.isInitialized = false;
        console.log('EventManager destroyed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}
