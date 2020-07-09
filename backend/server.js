// List of FENS to use : https://docs.google.com/spreadsheets/d/1fWA-9QW-C8Dc-8LDrEemSligWcprkpKif6cNDs4V_mg/edit#gid=0

var express = require("express");
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

var app = express();

var Http = require("http").Server(express);
var io = require('socket.io')(Http);

Http.listen(4001, () => {
  console.log("Socket running on port 4001");
});

var Lobbies = [];
var Sessions = {};
var error_response = {};

const WHITE = 'w';
const BLACK = 'b';
const defaultFen = "6k1/5p1p/6p1/1P1n4/1K4P1/N6P/8/8 w - - 0 0";
const version = '/v1';
const service = '/chess';

app.use(express.json());

app.get(version.concat(service,"/sessions"), (req, res) => {
    res.json(Sessions);
});

io.on("connection", socket => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  console.log("user connected");
  socket.emit("lobbies", Lobbies);

  //add lobby
  socket.on("addLobby", playerName => {
    //lobbies
    let Lobby = { 'ID': uuidv4(), 'Player1': playerName, 'Player2': null };
    Lobbies.push(Lobby);
    io.emit("lobbies", Lobbies);
    console.log(`lobby id: ${Lobby.ID}`);
    socket.join(`${Lobby.ID}`);
    //game session
    socket.emit("newGame", createNewSession(Lobby.ID, playerName));
  })

  //join lobby
  socket.on("joinLobby", (lobbyID, playerName) => {
    //lobbies
    Lobbies.find(x => x.ID == lobbyID).Player2 = playerName;
    Lobbies = Lobbies.filter(function (lobby) { return lobby.ID != lobbyID });
    io.emit("lobbies", Lobbies);

    //game session
    socket.emit("joinGame", joinGame(lobbyID, playerName, socket));
  })

  //get lobbies
  socket.on("getLobbies", () => {
    socket.emit("lobbies", Lobbies);
  })

  //move
  socket.on("move", (sessionID, fromPosition, toPosition) => {
    io.to(`${sessionID}`).emit("moveResult", move(sessionID, fromPosition, toPosition));
  })

  //get moves
  socket.on("getMoves", (sessionID, position) => {
    io.to(`${sessionID}`).emit("postMoves", getMoves(sessionID, position));
  })


  //load/get board
  socket.on("getBoard", (sessionID) => {
    console.log(`getBoard called with ID: ${sessionID}`)
    console.log(Object.keys(socket.rooms).filter(item => item!=socket.id));
    io.to(`${sessionID}`).emit("postBoard", getBoard(sessionID));
  })

  socket.on("getMoveHistory", sessionID => {
    io.to(`${sessionID}`).emit("postMoveHistory", getMoveHistory(sessionID));
  })

  socket.on("getUsersForSession", sessionID => {
    io.to(`${sessionID}`).emit("postUsersForSession", getUsersForSession(sessionID));
  })

})

//creates default game
function createNewSession(sessionID, playerName) {

  console.log(`new session ID: ${sessionID}`);
  let White = playerName;
  let Black = null;
  let Fen = null;

  let State = null;

  if (Fen === null) {
    State = new Chess();
  }
  else {
    State = new Chess(Fen);
  }

  let CurrentDate = new Date();

  let Game = { 'White': White, 'Black': Black, 'Start': CurrentDate.getTime(), 'State': State };

  Sessions[sessionID] = Game;
  //console.log(Sessions);
  return { 'SessionID': sessionID, 'Result': true };
}

function joinGame(sessionID, playerName, sock) {
  if (Sessions[sessionID] != undefined) {
    Sessions[sessionID].Black = playerName;
    sock.join(`${sessionID}`);
    return { 'SessionID': sessionID, 'Result': true };
  }
  else
    return { 'SessionID': null, 'Result': false };
}

function move(sessionID, fromPosition, toPosition) {
  let session = Sessions[sessionID];
  let game = session['State'];

  let move = game.move({ from: fromPosition, to: toPosition });

  checkGameOver(sessionID);

  console.log(move);

  return move;
}

function checkGameOver(sessionID) {
  let session = Sessions[sessionID];
  console.log(Sessions);
  let game = session['State'];
  if (game.game_over()) {
    let winner;
    if (game.turn() === "w")
      winner = session.White;
    else
      winner = session.Black;

    io.to(`${sessionID}`).emit("gameOver", winner);
    deleteSession(sessionID);
  }
}

function deleteSession(sessionID) {
  if (Sessions[sessionID]) {
    console.log("Before Deleteion:");
    console.log(Sessions);
    delete Sessions[sessionID];
    console.log("After Deleteion:");
    console.log(Sessions);
  }
}

function getMoves(sessionID, position) {
  console.log("ran getMoves with ID:" + sessionID);
  let session = Sessions[sessionID];
  let game = session['State'];

  let current_player = game.turn();

  let conditions = {
    "check": game.in_check(),
    "checkmate": game.in_checkmate(),
    "draw": game.in_draw(),
    "stalemate": game.in_stalemate(),
    "threefold-repetition": game.in_threefold_repetition(),
    "insufficient-material": game.insufficient_material()
  }

  if (current_player == WHITE) {
    current_player = { 'white': session['White'] };
  }
  else {
    current_player = { 'black': session['Black'] };
  };

  let legal_moves = game.moves({ square: position });

  console.log(legal_moves);

  return legal_moves;
}

function getBoard(sessionID){
  console.log("ran getBoard with ID:" + sessionID);

  let session = Sessions[sessionID];
  let game = session['State'];

  console.log(game.board());

  return game.board();
}

function getMoveHistory(sessionID) {
  let session = Sessions[sessionID];
  let game = session['State'];

  let history = game.history({ verbose: true })

  return { "move history": history };
}

function getUsersForSession(sessionID)
{
  let black = Sessions[sessionID].Black;
  let white = Sessions[sessionID].White;

  return { playerWhite: white, playerBlack: black};
}
