import {
  Component,
  OnInit
} from '@angular/core';
import { style } from '@angular/animations';
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

  constructor() {}

  ngOnInit(): void {
    
    for (let row = 0; row < this.chessboard.length; row++) {

      for (let block = 0; block < this.chessboard[row].length; block++) {
        
        if (!this.chessboard[row][block])
          this.chessboard[row][block] = {type: '', color: ''};
      }
      
    }

    console.log(this.chessboard);
  }

  counter(i: number) {
    console.log(i);
    return new Array(i);
  }

  generateBlockID(row:number, column:number)
  {
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
    // console.log("alowdrop");
    // if (canDrop)
    
      ev.preventDefault();
  }
  
  drag(ev) {
    console.log("drag parent " + ev.target.parentNode.id);
    this.pieceLastPosition = ev.target.parentNode.id;
    console.log(ev.dataTransfer.setData("text", ev.target.id));
    ev.dataTransfer.setData("text", ev.target.id);

    let moveList = this.chess.moves({ square: this.pieceLastPosition });
    console.log(moveList[0])
    //document.getElementById(moveList[0]).style.backgroundColor = "lightblue";
  }
  
  drop(ev) {
    // console.log("drop");
    // if (canDrop)
    // {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(data));
      console.log("drop parent " + this.pieceLastPosition);
      //console.log(this.chess.move({ from: this.pieceLastPosition, to: ev.target.id }))
      this.pieceLastPosition = "";
    // }
  }

}
