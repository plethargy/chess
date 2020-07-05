var express = require("express");
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

var app = express();

var Sessions = {};
var error_response = {};

const WHITE = 'w';
const BLACK = 'b';

const version = '/v1';
const service = '/chess';

app.use(express.json());

app.get(version.concat(service,"/sessions"), (req, res) => {
    res.json(Sessions);
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

    console.log(game.ascii());

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

    if (current_player == WHITE)
    {
        current_player = {'White' : session['White']};
    } 
    else 
    {
        current_player = {'Black' : session['Black']};
    }

    let legal_moves = {'Current Player' : current_player, 'Legal Moves': game.moves()};

    res.json(legal_moves);
});




app.listen(3500, () => {
    console.log("Server running on port 3000");
});