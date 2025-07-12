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