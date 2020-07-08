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

  constructor(
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    //this.snackbarService.show('test','success', 3000);
    let ret = this.snackbarService.promote(true);

    console.log(ret);

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
    let highlighted = document.getElementsByClassName("avaliableMove");

    while (highlighted.length > 0) {
      highlighted[0].classList.remove(("avaliableMove"));
    }

    this.pieceLastPosition = ev.target.closest(".block").id;

    console.log(this.pieceLastPosition);
    ev.dataTransfer.setData("text", ev.target.id);

    let moveList = this.chess.moves({
      square: this.pieceLastPosition
    });

    console.log("moveList");
    console.log(moveList);
    for (let index = 0; index < moveList.length; index++) {
      let block = moveList[index].slice(-2);

      document.getElementById(block).classList.add("avaliableMove");

    }

  }

  drop(ev) {
    console.log("drop");
    // if (canDrop)
    // {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    let block = ev.target.closest(".block");
    
    let checkMove = this.chess.move({
      from: this.pieceLastPosition,
      to: block.id
    });

    console.log(checkMove);
    
    if (checkMove) {      
      block.firstChild.childNodes.forEach(element => {
      
        let name = element.nodeName.toLowerCase();
        if (name === "app-pawn" || name === "app-queen" || name === "app-bishop" || name === "app-knight" || name === "app-rook")
          element.remove();
        
      });

      this.pieceLastPosition = "";

      block.firstChild.appendChild(document.getElementById(data));
      
      let highlighted = document.getElementsByClassName("avaliableMove");
      while (highlighted.length > 0) {
        highlighted[0].classList.remove(("avaliableMove"));
      }
    }

  }

}
