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