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
    console.log("alowdrop");
    // if (canDrop)

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
            block = "g1";
          if (colourTurn === 'b')
            block = "g8"
          // white
          // king > g1   rook > f1
          
          // black
          // king > g8   rook > f8
        }

        // Queen Side
        if (block === "O-O-O")
        {
          if (colourTurn === 'w')
            block = "c1";
          if (colourTurn === 'b')
            block = "c8"
          // white
          // king to c1   rook > d1
          // black
          // king > c8    rook > d8
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
    this.showPrmotion = true;

    console.log("drop");

    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

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
    }
    this.removeBlockHighlighting();
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
