// List of FENS to use : https://docs.google.com/spreadsheets/d/1fWA-9QW-C8Dc-8LDrEemSligWcprkpKif6cNDs4V_mg/edit#gid=0

var express = require("express");
var cors = require('cors');

const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

var app = express();

var Sessions = {};
var error_response = {};

const WHITE = 'w';
const BLACK = 'b';

const version = '/v1';
const service = '/chess';

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors())

app.get(version.concat(service,"/sessions"), (req, res) => {
    res.json(Object.values(Sessions));
});


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


app.listen(PORT, () => {
    console.log("Server running on port ".concat(PORT));
});