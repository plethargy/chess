var express = require("express");
const { Chess } = require('chess.js');
const { v4: uuidv4 } = require('uuid');

var app = express();

var Sessions = {};
var error_response = {};

const WHITE = 'w';
const BLACK = 'b';

const version = 'v1';

app.use(express.json());

app.get(version+"/sessions", (req, res) => {
    res.json(Sessions);
});


app.post(version+"/session", function(req, res){

    let UUID = uuidv4();

    let White = req.body.White;
    let Black = req.body.Black;
    let State = new Chess();

    let CurrentDate = new Date();

    let Game = {'White' : White, 'Black' : Black , 'Start' : CurrentDate.getTime(), 'State' : State};

    Sessions[UUID] = Game;

    res.json({'Session' : UUID, 'Result': true});

});


app.post(version+"/move", function(req, res){

    var session = Sessions[req.body.Id];
    var game = session['State'];

    var move = game.move(req.body.move);

    // console.log(game.ascii());

    if(move === null)
    {
        error_response["Error"] = "Illegal Move for ".concat(game.turn());
        res.statusCode = 401;
        res.json(error_response);
    }
    else
    {
        res.statusCode = 200;
        res.json(move);
    }

});


app.get(version+"/moves", (req, res) => {

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