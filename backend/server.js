// List of FENS to use : https://docs.google.com/spreadsheets/d/1fWA-9QW-C8Dc-8LDrEemSligWcprkpKif6cNDs4V_mg/edit#gid=0

var express = require("express");
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const { createAssignment } = require("typescript");

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
    //console.log(`lobby id: ${Lobby.ID}`);
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
  socket.on("move", (sessionID, fromPosition, toPosition, promotion) => {
    io.to(`${sessionID}`).emit("moveResult", move(sessionID, fromPosition, toPosition, promotion));
  })

  //get moves
  socket.on("getMoves", (sessionID, position) => {
    io.to(`${sessionID}`).emit("postMoves", getMoves(sessionID, position));
  })


  //load/get board
  socket.on("getBoard", (sessionID) => {
    //console.log(`getBoard called with ID: ${sessionID}`)
    //console.log(Object.keys(socket.rooms).filter(item => item!=socket.id));
    io.to(`${sessionID}`).emit("postBoard", getBoard(sessionID));
  })

  socket.on("getMoveHistory", sessionID => {
    io.to(`${sessionID}`).emit("postMoveHistory", getMoveHistory(sessionID));
  })

  socket.on("getUsersForSession", sessionID => {
    io.to(`${sessionID}`).emit("postUsersForSession", getUsersForSession(sessionID));
  })

  socket.on("leaveRoom", (sessionID) => {
    console.log("leaveRoom called");
    socket.leave(sessionID, () => {
      console.log("users leaving room");
    })
  })    
  socket.on("userSignUp", email => {
    signupUser(email);
  })
  
  socket.on("getTurn", sessionID => {
    io.to(`${sessionID}`).emit("postTurn", getTurn(sessionID));
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
    createGame(sessionID);
    return { 'SessionID': sessionID, 'Result': true };
  }
  else
    return { 'SessionID': null, 'Result': false };
}

function move(sessionID, fromPosition, toPosition, toPromotion) {
  if (Sessions[sessionID] != undefined) {

    let session = Sessions[sessionID];
    let game = session['State'];

    let move = [];

    if (typeof toPromotion === 'undefined') {
      move = game.move({ from: fromPosition, to: toPosition });
    } else {
      move = game.move({ from: fromPosition, to: toPosition , promotion: toPromotion});
    }


    checkGameOver(sessionID);

    //console.log(move);

    return { "Data": move, "Result": true };

  }
  else {
    return { "Data": null, "Result": false };
  }
}

function checkGameOver(sessionID) {
  let session = Sessions[sessionID];
  //console.log(Sessions);
  let game = session['State'];
  if (game.game_over()) {
    let winner;
    if (game.turn() === "w")
      winner = session.White;
    else
      winner = session.Black;

    let dbInstance = new db();
  
    let query = `UPDATE Player SET [Score] = [Score] + 50, [LastPlayed] = GETDATE() WHERE Username = '${winner}'`;
    dbInstance.connect(query);
    recordHistory(sessionID);
    

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
  //console.log("ran getMoves with ID:" + sessionID);
  if (Sessions[sessionID] != undefined) {

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

    //console.log(legal_moves);

    //return legal_moves;
    return { "Data": legal_moves, "Result": true };

  }
  else {
    return { "Data": null, "Result": false };
  }
}

function getBoard(sessionID){
  console.log("ran getBoard with ID:" + sessionID);
  //console.log("getBoard ran");
  console.log(Sessions);
  if (Sessions[sessionID] != undefined) {
    let session = Sessions[sessionID];
    let game = session['State'];

    //console.log(game.board());

    return { "Data": game.board(), "Result": true };
  }
  else
    return { "Data": null, "Result": false }; 
}

function getMoveHistory(sessionID) {
  if (Sessions[sessionID] != undefined) {

    let session = Sessions[sessionID];
    let game = session['State'];

    let history = game.history({ verbose: true })

      return { "Data": history, "Result": true };
  }
  else
    return { "Data": null, "Result": false }; 
}

function getTurn(sessionID) {
  if (Sessions[sessionID] != undefined) {

    let session = Sessions[sessionID];
    let game = session['State'];

    console.log(game.turn());

    return { "Data": game.turn(), "Result": true };
  }
  else
    return { "Data": null, "Result": false }; 
}

function getUsersForSession(sessionID)
{
  if (Sessions[sessionID] != undefined) {

    let black = Sessions[sessionID].Black;
    let white = Sessions[sessionID].White;

    let data = { playerWhite: white, playerBlack: black };

    return { "Data": data, "Result": true }; 
  }
  else
    return { "Data": null, "Result": false }; 
}

function signupUser(email)
{

  let dbInstance = new db();
  let query = 
  `
  DECLARE @count int;
  SELECT @count = COUNT(PlayerId) FROM [Player] WHERE [Username] = '${email}';
  IF @count = 0
  BEGIN
    INSERT INTO Player(Username, Score) VALUES ('${email}', 0)
  END`;
  dbInstance.connect(query);

}

function createGame(sessionID)
{
  let dbInstance = new db();
  let white = Sessions[sessionID].White;
  let black = Sessions[sessionID].Black;
  let query = `
  DECLARE @player1 int
  DECLARE @player2 int

  SELECT @player1 = [PlayerId] FROM Player WHERE Username = '${white}';
  SELECT @player2 = [PlayerId] FROM Player WHERE Username = '${black}';

  INSERT INTO Game(Player1_ID, Player2_ID, Player1_Colored, Player2_Colored) VALUES (@player1, @player2, 'White', 'Black');
  `;

  dbInstance.connect(query);
}

function recordHistory(sessionID)
{
  let session = Sessions[sessionID];
  let white = Sessions[sessionID].White;
  let black = Sessions[sessionID].Black;
  let game = session['State'];

  let history = game.history({ verbose: true });


  let query = `
    DECLARE @game int;
    DECLARE @player1 int
    DECLARE @player2 int
  
    SELECT @player1 = [PlayerId] FROM Player WHERE Username = '${white}';
    SELECT @player2 = [PlayerId] FROM Player WHERE Username = '${black}';
    SELECT @game = MAX([GameID]) FROM Game WHERE Player1_ID = @player1 AND Player2_ID = @player2 AND [EndTime] IS NULL;
    UPDATE Game SET [EndTime] = GETDATE() WHERE GameID = @game;
    INSERT INTO [Move](PlayerID, GameID, Piece, FromBlock, ToBlock) VALUES 
    `;

  let dbInstance = new db();
  history.forEach((elem, index, arr) => {
    if (elem.color === 'w')
    {
      if (index == arr.length - 1)
        query += ` (@player1, @game, '${elem.piece}', '${elem.from}', '${elem.to}')`;
      else
        query += ` (@player1, @game, '${elem.piece}', '${elem.from}', '${elem.to}'),`
    }
    else
    {
      if (index == arr.length - 1)
        query += ` (@player2, @game, '${elem.piece}', '${elem.from}', '${elem.to}')`;
      else
        query += ` (@player2, @game, '${elem.piece}', '${elem.from}', '${elem.to}'),`
    }
  });

  dbInstance.connect(query);
}