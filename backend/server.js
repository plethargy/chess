// List of FENS to use : https://docs.google.com/spreadsheets/d/1fWA-9QW-C8Dc-8LDrEemSligWcprkpKif6cNDs4V_mg/edit#gid=0

var express = require("express");
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

var app = express();

var Http = require("http").Server(express);
var io = require('socket.io')(Http);

Http.listen(4001, () => {
  console.log("Listening at :3000...");
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
    console.log("addLobby called");

    //need to do IDs properly
    let Lobby = { 'ID': uuidv4(), 'Player1': playerName, 'Player2': null };
    Lobbies.push(Lobby);
    console.log(Lobbies);
    io.emit("lobbies", Lobbies);

    socket.emit("newGame", createNewSession(Lobby.ID, playerName));
  })

  //join lobby
  socket.on("joinLobby", (lobbyID, playerName) => {
    Lobbies.find(x => x.ID == lobbyID).Player2 = playerName;
    Lobbies = Lobbies.filter(function (lobby) { return lobby.ID != lobbyID });
    io.emit("lobbies", Lobbies);

    socket.emit("joinGame", joinGame(lobbyID, playerName));
  })

  //get lobbies
  socket.on("getLobbies", () => {
    socket.emit("lobbies", Lobbies);
  })

  //move
  socket.on("move", (sessionID, inputMove) => {
    socket.emit("moveResult", move(sessionID, inputMove));
  })

  //get moves
  socket.on("getMoves", sessionID => {
    socket.emit("postMoves", getMoves(sessionID));
  })

})

//creates default game
function createNewSession(sessionID, playerName) {
  let UUID = sessionID;

  let White = playerName;
  let Black = null;
  let Fen = defaultFen;

  let State = null;

  if (Fen === null) {
    State = new Chess();
  }
  else {
    State = new Chess(Fen);
  }

  let CurrentDate = new Date();

  let Game = { 'White': White, 'Black': Black, 'Start': CurrentDate.getTime(), 'State': State };

  Sessions[UUID] = Game;
  console.log(Sessions);
  return { 'Session': UUID, 'Result': true };
}

function joinGame(sessionID, playerName) {
  if (Sessions[sessionID] != undefined) {
    Sessions[sessionID].Black = playerName
    return true;
  }
  else
    return false;
  console.log(Sessions);
}

function move(sessionID, inputMove) {
  let session = Sessions[sessionID];
  let game = session['State'];

  let move = game.move(inputMove);

  // console.log(game.ascii());
  res = {};

  if (move === null) {

    let current_player = game.turn();

    if (current_player == WHITE) {
      current_player = { 'White': session['White'] };
    }
    else {
      current_player = { 'Black': session['Black'] };
    }

    error_response["Error"] = "Illegal Move";
    error_response["Move"] = inputMove;
    error_response["Player"] = current_player;

    res.statusCode = 408;
    res.error_response = error_response;
    //res.json(error_response);
  }
  else {
    res.statusCode = 200;
    res.move = move;
    //res.json(move);
  }
  return res;
}

function getMoves(sessionID) {
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

  let legal_moves = { 'current player': current_player, 'conditions': conditions, 'legal moves': game.moves() };

  return legal_moves;
  //res.json(legal_moves);
}

app.post(version.concat(service,"/createSession"), function(req, res){

    let UUID = uuidv4();

    let White = req.body.White;
    let Black = req.body.Black;
    let Fen = req.body.Fen;

    let State = null;

    if(Fen === null)
    {
        State = new Chess();
    }
    else
    {
        State = new Chess(Fen);
    }

    let CurrentDate = new Date();

    let Game = {'White' : White, 'Black' : Black , 'Start' : CurrentDate.getTime(), 'State' : State};

    Sessions[UUID] = Game;

    res.json({'Session' : UUID, 'Result': true});

});


app.post(version.concat(service,"/move"), function(req, res){

    let session = Sessions[req.body.Id];
    let game = session['State'];

    let move = game.move(req.body.move);

    // console.log(game.ascii());

    if(move === null)
    {

        let current_player = game.turn();

        if (current_player == WHITE)
        {
            current_player = {'White' : session['White']};
        } 
        else 
        {
            current_player = {'Black' : session['Black']};
        }

        error_response["Error"] = "Illegal Move";
        error_response["Move"] = req.body.move;
        error_response["Player"] = current_player;

        res.statusCode = 408;
        res.json(error_response);
    }
    else
    {
        res.statusCode = 200;
        res.json(move);
    }

});


app.get(version.concat(service,"/moves"), (req, res) => {

    let session = Sessions[req.body.Id];
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

    if (current_player == WHITE)
    {
        current_player = {'white' : session['White']};
    }
    else 
    {
        current_player = {'black' : session['Black']};
    };

    let legal_moves = {'current player' : current_player, 'conditions' : conditions, 'legal moves': game.moves()};

    res.json(legal_moves);
});

app.get(version.concat(service,"/history"), (req, res) => {

    let session = Sessions[req.body.Id];
    let game = session['State'];

    let history = game.history({ verbose: true })

    res.json({"move history" : history});
});


app.listen(process.env.PORT || 4000, () => {
    console.log("Server running on port 4000");
});
