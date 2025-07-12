# Serverless Chess Game

A modern, serverless chess game built with JavaScript that supports both local and online multiplayer gameplay without requiring any server infrastructure.

## Motivation

Traditional online chess games require dedicated servers, complex backend infrastructure, and ongoing maintenance costs. This project eliminates these barriers by creating a fully client-side chess experience that leverages modern web technologies like WebRTC for peer-to-peer connections and URL-based game sharing for asynchronous play.

The game was designed with a clean, modular architecture following software engineering best practices, making it easy to maintain, extend, and deploy on any static hosting platform.

## Features

### Multiple Play Modes
- **Local Play**: Two players on the same device
- **Online Real-time**: WebRTC peer-to-peer connections using simple room codes
- **URL Sharing**: Share game states via links for correspondence-style chess
- **Resume Anywhere**: Load any game position from a shared URL

### Complete Chess Implementation
- Full chess rule enforcement including castling, en passant, and pawn promotion
- Check, checkmate, and stalemate detection
- Move validation and legal move highlighting
- Interactive drag-and-drop piece movement
- Move history tracking and display
- Game state persistence

### Serverless Architecture
- No backend servers required
- WebRTC for real-time peer-to-peer connections
- FEN notation for game state serialization
- Local storage for game persistence
- GitHub Pages compatible

## Architecture

The application follows a clean separation of concerns with six specialized components:

### Core Components

- **GameEngine**: Pure chess logic and board state management
- **UIManager**: User interface updates and modal management  
- **NetworkManager**: WebRTC peer connections and online multiplayer
- **URLManager**: URL-based game sharing and FEN encoding
- **EventManager**: DOM event handling and user interactions
- **GameController**: Coordination and orchestration between components

### Communication Flow
```
User Interaction → EventManager → GameController → Specific Component
                                        ↓
                                   UIManager (updates display)
```

## Quick Start

### Prerequisites
- Modern web browser with WebRTC support
- No server or database required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajatasusual/serverless-chess.git
   cd serverless-chess
   ```

2. **Open the game**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

3. **Deploy to GitHub Pages**
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Your game will be live at `https://rajatasusual.github.io/serverless-chess`

### Usage

#### Local Play
1. Click "Play Local" to start a game on the same device
2. Players alternate moves by clicking and dragging pieces
3. Game automatically enforces chess rules and detects game end conditions

#### Online Play
1. **Host a game**: Click "Create Online Room" to generate a room code
2. **Join a game**: Click "Join Online Room" and enter the 6-character code
3. **Play**: Moves synchronize automatically between players

#### URL Sharing
1. **Share current position**: Click "Share Game" to generate a URL
2. **Load from URL**: Click "Play from URL" and paste a game link
3. **Resume play**: Game loads the exact position from the URL

## Project Structure

```
serverless-chess/
├── index.html                 # Main HTML file
├── css/
│   ├── main.css              # Game styling
│   └── chessboard.css        # Board component styles
├── js/
│   ├── components/
│   │   ├── GameEngine.js     # Chess logic
│   │   ├── UIManager.js      # Interface management
│   │   ├── NetworkManager.js # WebRTC connections
│   │   ├── URLManager.js     # URL sharing
│   │   └── EventManager.js   # Event handling
│   ├── GameController.js     # Main orchestrator
│   └── libs/
│       ├── chess.js          # Chess engine library
│       ├── chessboard.js     # Board UI library
│       └── peer.js           # WebRTC peer library
├── README.md
└── LICENSE
```

## Configuration

### Customizing the Game

The game can be easily customized by modifying the configuration in `GameController.js`:

```javascript
// Example customization
const config = {
    boardTheme: 'classic',
    pieceTheme: 'alpha',
    enableSounds: true,
    showLegalMoves: true,
    enablePreMoves: false
};
```

### Adding New Features

Thanks to the modular architecture, new features can be added by:

1. Creating new component classes
2. Registering them with the GameController
3. Setting up event bindings for component communication

## Testing

The modular architecture enables comprehensive testing:

```bash
# Run unit tests for individual components
npm test

# Test specific component
npm test -- --grep "GameEngine"
```

### Testing Strategy
- **GameEngine**: Chess logic and move validation
- **UIManager**: DOM manipulation and display updates
- **NetworkManager**: WebRTC connection handling
- **URLManager**: URL encoding/decoding
- **EventManager**: Event binding and delegation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use ESLint configuration provided
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Maintain separation of concerns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-party Libraries

- **chess.js**: Chess logic library (BSD 2-Clause License)
- **chessboard.js**: Chess board UI (MIT License)
- **PeerJS**: WebRTC peer connections (MIT License)

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) for the robust chess engine
- [chessboard.js](https://chessboardjs.com/) for the beautiful chess board interface
- [PeerJS](https://peerjs.com/) for simplified WebRTC connections
- The WebRTC community for making peer-to-peer web applications possible

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/rajatasusual/serverless-chess/issues) page
2. Create a new issue with detailed description
3. For feature requests, use the enhancement label

---

**Built with ❤️ for the chess community**
