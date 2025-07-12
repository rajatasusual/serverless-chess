// app.js
// Application initialization and entry point
class ChessApplication {
    constructor() {
        this.gameController = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Check if all required dependencies are loaded
            this.checkDependencies();

            // Initialize the game controller
            this.gameController = new GameController();
            this.isInitialized = true;

            console.log('Chess application initialized successfully');

            // Make game controller available globally for debugging
            if (typeof window !== 'undefined') {
                window.chessGame = this.gameController;
                window.chessApp = this;
            }

        } catch (error) {
            console.error('Failed to initialize chess application:', error);
            this.showInitializationError(error);
        }
    }

    checkDependencies() {
        const required = [
            { name: 'Chess', object: Chess, description: 'chess.js library' },
            { name: 'Chessboard', object: Chessboard, description: 'chessboard.js library' },
            { name: 'Peer', object: Peer, description: 'PeerJS library' },
            { name: 'GameEngine', object: GameEngine, description: 'GameEngine class' },
            { name: 'UIManager', object: UIManager, description: 'UIManager class' },
            { name: 'NetworkManager', object: NetworkManager, description: 'NetworkManager class' },
            { name: 'URLManager', object: URLManager, description: 'URLManager class' },
            { name: 'GameController', object: GameController, description: 'GameController class' },
            { name: 'EventManager', object: EventManager, description: 'EventManager class' }
        ];

        const missing = required.filter(dep => typeof dep.object === 'undefined');

        if (missing.length > 0) {
            const missingList = missing.map(dep => `${dep.name} (${dep.description})`).join(', ');
            throw new Error(`Missing dependencies: ${missingList}`);
        }
    }

    showInitializationError(error) {
        // Create error display
        const errorDiv = document.createElement('div');
        errorDiv.id = 'initializationError';
        errorDiv.className = 'initialization-error';
        errorDiv.innerHTML = `
            <h2>Chess Game Failed to Load</h2>
            <p><strong>Error:</strong> ${error.message}</p>
            <p>Please check that all required files are loaded:</p>
            <ul>
                <li>chess.js</li>
                <li>chessboard.js</li>
                <li>peerjs</li>
                <li>GameEngine.js</li>
                <li>UIManager.js</li>
                <li>NetworkManager.js</li>
                <li>URLManager.js</li>
                <li>GameController.js</li>
                <li>EventManager.js</li>
            </ul>
            <button onclick="location.reload()">Reload Page</button>
        `;

        // Add some basic styling
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(errorDiv);
    }

    getGameController() {
        return this.gameController;
    }

    isReady() {
        return this.isInitialized && this.gameController !== null;
    }

    destroy() {
        if (this.gameController && this.gameController.eventManager) {
            this.gameController.eventManager.destroy();
        }

        this.gameController = null;
        this.isInitialized = false;

        console.log('Chess application destroyed');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ChessApplication();
    await app.initialize();
});

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
    if (window.chessApp) {
        window.chessApp.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessApplication;
}
