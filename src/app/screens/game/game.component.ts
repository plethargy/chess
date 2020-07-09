import { Component, OnInit} from '@angular/core';
// import { style } from '@angular/animations';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import * as Chess from 'chess.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  chess = new Chess()
  chessboard = this.chess.board();
  pieceLastPosition = "";
  color: boolean;

  pieceDark: string = 'var(--chesspiece-dark)';
  pieceLight: string = 'var(--chesspiece-light)';
  blockColour1: string = 'light-section';
  blockColour2: string = 'dark-section';

  showPrmotion: boolean = false;
  selectedPromotion:string;

  constructor(
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {

    //this.snackbarService.show('test','success', 3000);
    //let ret = this.snackbarService.promote(true);

    for (let row = 0; row < this.chessboard.length; row++) {

      for (let block = 0; block < this.chessboard[row].length; block++) {

        if (!this.chessboard[row][block])
          this.chessboard[row][block] = {
            type: '',
            color: ''
          };
      }
    }

    console.log(this.chessboard);
  }

  counter(i: number) {
    console.log(i);
    return new Array(i);
  }

  generateBlockID(row: number, column: number) {
    let columnLetter = String.fromCharCode(column + 97);

    return (columnLetter + (8 - row));
  }

  mod(a: number) {

    if (a % 8 == 0) {
      // invert colour
      this.blockColour1 = this.blockColour1 == 'light-section' ? 'dark-section' : 'light-section';
      this.blockColour2 = this.blockColour2 == 'dark-section' ? 'light-section' : 'dark-section';
    }

    if (a % 2 == 0)
      return true;
    else
      return false;
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    this.showPrmotion = false;

    this.removeBlockHighlighting();

    this.pieceLastPosition = ev.target.closest(".block").id;

    console.log(this.pieceLastPosition);
    ev.dataTransfer.setData("text", ev.target.id);

    let moveList = this.chess.moves({
      square: this.pieceLastPosition
    });

    console.log("moveList");
    console.log(moveList);
    for (let index = 0; index < moveList.length; index++) {
      // CHESS NOTATION
      // [Piece][Position]        // Standard move
      // [Piece][Rank][Position]  // Disambiguating standard move
      // [Piece]x[Position]       // Capturing
      // [Column]x[Position]      // En passant captures  // used as flag instead
      // [Position]=[Promotion]   // Promoting Pawn eg =Q, =R, =B, =N (g8x=N)
      // "O-O"                    // Castling (king side) - this can probably be hard coded
      // "O-O-O"                  // Castling (queen side)
      // [Position]+              // Check
      // [Piece][Position]#       // Checkmate

      let block = moveList[index];
      let colourTurn = this.chess.turn(); // store in a variable

      // can refactor with regex      
      if (block.includes('O-'))
      {
        // CASTLING
        // King Side
        if (block === "O-O")
        {
          if (colourTurn === 'w')
            block = "g1"; // king > g1   rook > f1
          if (colourTurn === 'b')
            block = "g8"; // king > g8   rook > f8
        }

        // Queen Side
        if (block === "O-O-O")
        {
          if (colourTurn === 'w')
            block = "c1"; // king to c1   rook > d1
          if (colourTurn === 'b')
            block = "c8"; // king > c8    rook > d8
        }
      }
      if (block.includes('='))
        block = block.replace(/(?<==)[^\]]+/,'');  // PROMOTION // replace everything after = // can refactor

      block = block.replace(/[\=, \+, \#]+/g,''); // remove suffix of PROMOTION(=), CHECK (+), CHECKMATE (#)
      block = block.slice(-2); // STANDARD MOVE

      document.getElementById(block).classList.add("avaliableMove");
    }
  }

  drop(ev) {
    //this.snackbarService.show('test','success', 3000);
    //this.showPrmotion = true;

    console.log("drop");

    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log("ev");
    console.log(ev)

    let block = ev.target.closest(".block");
    
//     Or by passing .move() a move object (only the 'to', 'from', and when necessary 'promotion', fields are needed):

// const chess = new Chess()

// chess.move({ from: 'g2', to: 'g3' })

    let checkMove = this.chess.move({
      from: this.pieceLastPosition,
      to: block.id
    });

    console.log(checkMove);
    
    if (checkMove) { 

      // Flags
      // 'n' - a non-capture
      // 'b' - a pawn push of two squares
      // 'e' - an en passant capture
      // 'c' - a standard capture
      // 'p' - a promotion
      // 'k' - kingside castling
      // 'q' - queenside castling

      if (checkMove.flags.includes('c')) 
        this.removePieceFromChildNode(block);

      this.pieceLastPosition = "";
      block.firstChild.appendChild(document.getElementById(data));

      if (checkMove.flags.includes('e')) {
        // EN PASSANT CAPTURE
        //eg
          // b d7 > d5    w e5 > d6   w  en passant captures b on d5
          // w d2 > d4    b e4 > d3   b  en passant captures w on d4

        let passantBlockID = '';
        if (checkMove.color === "w")
          passantBlockID = (block.id[0] + (parseInt(block.id[1]) - 1).toString());
        else 
          passantBlockID = (block.id[0] + (parseInt(block.id[1]) + 1).toString());

        this.removePieceFromChildNode(document.getElementById(passantBlockID));
      }  

      if (checkMove.flags.includes('k') || checkMove.flags.includes('q')) {
        // CASTLING
          let currentRookBlock = document.getElementById('h1');
          let newRookBlock = document.getElementById('f1');

          console.log("GONNA SWAP");
          this.swapPieceFromChildNode(newRookBlock, currentRookBlock);
          console.log("SWAPPED");
          console.log(this.chess.ascii())
        // Kings's Side
        // white :  king e1 > g1   rook h1 > f1
        // black :  king e8 > g8   rook h8 > f8
        // data = ev.dataTransfer.getData("text");
        // block.firstChild.appendChild(document.getElementById(data));

        // Queen's Side
        // white :  king e1 > c1   rook a1 > d1
        // black :  king e8 > c8   rook a8 > d8

      }      
    }
    this.gameCondition();
    this.removeBlockHighlighting();
  }

  gameCondition()
  { 
    let timer = 3000;

    // change red or green depending who is in check?
    if (this.chess.in_check())
      this.snackbarService.show('CHECK','', timer);

    // Check for End Game Conditions
    if (this.chess.in_checkmate())
      this.snackbarService.show('checkmate', '', timer);
    if (this.chess.in_draw())
      this.snackbarService.show('Draw','', timer);
    if (this.chess.in_stalemate())
      this.snackbarService.show('Stalemate','', timer);
    if (this.chess.in_threefold_repetition())
      this.snackbarService.show('threefold repetition','', timer);
    
    if (this.chess.game_over()){
      setTimeout(() => {
        this.snackbarService.show('Game Over');
      }, timer);     
    }
  }

  swapPieceFromChildNode(newBlockNode, oldBlockNode) {

      oldBlockNode.firstChild.childNodes.forEach(element => {
        console.log("element");
        let name = element.nodeName.toLowerCase();
        if (name === "app-pawn" || name === "app-queen" || name === "app-bishop" || name === "app-knight" || name === "app-rook")
        {
          console.log("found rook");
          newBlockNode.firstChild.appendChild(element);  
        }

      });
  }
  
  removePieceFromChildNode(blockNode) {
    blockNode.firstChild.childNodes.forEach(element => {

      let name = element.nodeName.toLowerCase();
      if (name === "app-pawn" || name === "app-queen" || name === "app-bishop" || name === "app-knight" || name === "app-rook")
        element.remove();

    });
  }

  removeBlockHighlighting() {
    let highlighted = document.getElementsByClassName("avaliableMove");

    while (highlighted.length > 0) {
      highlighted[0].classList.remove(("avaliableMove"));
    }
  }

  receiveSelectedPromotion($event) {
    this.selectedPromotion = $event
    console.log("incoming: " + this.selectedPromotion);

    this.showPrmotion = false;
  }

}
