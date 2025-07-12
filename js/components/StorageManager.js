// StorageManager.js
class GameStorageManager {
    constructor() {
        this.storageKey = 'chessGame';
        this.maxHistorySize = 10;
        this.eventHandlers = {};
        this.lastSavedFen = null;
        this.initializeStorage();
    }

    initializeStorage() {
        if (!this.isStorageAvailable()) {
            console.warn('Local storage is not available');
            return;
        }
        
        this.emit('storageInitialized');
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Save current game state
    saveCurrentGame(gameState) {
        if (!this.isStorageAvailable() || !gameState) return false;

        try {
            const saveData = {
                ...gameState,
                timestamp: Date.now(),
                id: this.generateGameId()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            this.lastSavedFen = gameState.fen;
            this.emit('gameSaved', saveData);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.emit('saveError', error);
            return false;
        }
    }

    // Load current game state
    loadCurrentGame() {
        if (!this.isStorageAvailable()) return null;

        try {
            const savedGame = localStorage.getItem(this.storageKey);
            if (savedGame) {
                const gameData = JSON.parse(savedGame);
                this.emit('gameLoaded', gameData);
                return gameData;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            this.emit('loadError', error);
        }
        return null;
    }

    // Utility methods
    generateGameId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateGameTitle(gameState) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const moves = gameState.moveHistory ? gameState.moveHistory.length : 0;
        const mode = gameState.gameMode || 'Local';
        
        return `${mode} Game - ${date} ${time} (${moves} moves)`;
    }

    // Event system
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
}
