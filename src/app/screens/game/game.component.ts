import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, Type} from '@angular/core';
// import { style } from '@angular/animations';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import * as Chess from 'chess.js';
import { QueenComponent } from 'src/app/components/pieces/queen/queen.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('check', {read: ViewContainerRef}) container: ViewContainerRef;
  

  chess = new Chess()
  chessboard = this.chess.board();
  pieceLastPosition = "";
  color: boolean;

  pieceDark: string = "var(--chesspiece-dark)";
  pieceLight: string = "var(--chesspiece-light)";
  blockColour1: string = "light-section";
  blockColour2: string = "dark-section";

  showPromotion: boolean = false;
  selectedPromotion:string;

    // Keep track of list of generated components for removal purposes
    components = [];

    // Expose class so that it can be used in the template
    queenComponentClass = QueenComponent;

  constructor(
    private snackbarService: SnackbarService, private componentFactoryResolver: ComponentFactoryResolver
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
      this.blockColour1 = this.blockColour1 == "light-section" ? "dark-section" : "light-section";
      this.blockColour2 = this.blockColour2 == "dark-section" ? "light-section" : "dark-section";
    }

    if (a % 2 == 0)
      return true;
    else
      return false;
  }

  allowDrop(ev) {
    console.log("ALLOW")
    ev.preventDefault();
  }

  drag(ev) {
    console.log("DRAG")
    this.showPromotion = false;

    this.removeBlockHighlighting();

    this.pieceLastPosition = ev.target.closest(".block").id;

    console.log("drag");
    console.log(ev);
    console.log("drag:" + this.pieceLastPosition);
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
      if (block.includes("O-"))
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

    console.log("DROP");
    
    let colourTurn = this.chess.turn(); // store in a variable
    //this.snackbarService.show('test','success', 3000);
    //this.showPromotion = true;

    console.log("drop");

    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log("ev");
    console.log(ev)

    console.log("blocckkkk");
    let block = ev.target.closest(".block");
    console.log(block);
    
//     Or by passing .move() a move object (only the 'to', 'from', and when necessary 'promotion', fields are needed):

// const chess = new Chess()

// chess.move({ from: 'g2', to: 'g3' })

    //check if a pawn on the 8th Rank 
    //
    // let checkMove = this.chess.move({
    //   from: this.pieceLastPosition,
    //   to: block.id,
    //   promotion: ''    
    // });
    // this.addComponent(this.queenComponentClass)

    let checkMove;
    console.log("last")
    console.log(document.getElementById(this.pieceLastPosition));
    let currentPiece = this.fetchPieceFromChildNode(document.getElementById(this.pieceLastPosition));

    // 
    //this.addPieceToChildNode(block, 'q', 'sigh', 'b'); // this works but doesn't work - need to inject the component
    if (currentPiece.id.includes("pawn") && (block.id.includes('8') || block.id.includes('1')))
    { 
      this.showPromotion = true; // also how to subscribe unil the user is done selecting a piece //receiveSelectedPromotion
      
      checkMove = this.chess.move({
        from: this.pieceLastPosition,
        to: block.id,
        promotion: 'q'
      });
    }
    else {
      checkMove = this.chess.move({
        from: this.pieceLastPosition,
        to: block.id
      });
    }
    

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

        let passantBlockID = "";
        if (checkMove.color === 'w')
          passantBlockID = (block.id[0] + (parseInt(block.id[1]) - 1).toString());
        else 
          passantBlockID = (block.id[0] + (parseInt(block.id[1]) + 1).toString());

        this.removePieceFromChildNode(document.getElementById(passantBlockID));
      }  

      if (checkMove.flags.includes('k') || checkMove.flags.includes('q')) {
        // CASTLING         
          let currentRookBlock;
          let newRookBlock;

          if (checkMove.flags.includes('k')) {
            // Kings's Side
            // white :  king e1 > g1   rook h1 > f1
            // black :  king e8 > g8   rook h8 > f8
            if (colourTurn === 'w') {
              currentRookBlock = document.getElementById("h1");
              newRookBlock = document.getElementById("f1");
            } 
            else {
              currentRookBlock = document.getElementById("h8");
              newRookBlock = document.getElementById("f8");
            }
          }
          else if (checkMove.flags.includes('q')) {
            // Queen's Side
            // white :  king e1 > c1   rook a1 > d1
            // black :  king e8 > c8   rook a8 > d8
            if (colourTurn === 'w') {              
              currentRookBlock = document.getElementById("a1");
              newRookBlock = document.getElementById("d1");
            } 
            else {             
              currentRookBlock = document.getElementById("a8");
              newRookBlock = document.getElementById("d8");
            }
          }
  
          this.swapPieceFromChildNode(currentRookBlock, newRookBlock);
      }
      console.log(checkMove);
      console.log(this.chess.ascii())
      if (checkMove.flags.includes('p')) {
        // captured: "r"
        // color: "w"
        // flags: "cp"
        // from: "g7"
        // piece: "p"
        // promotion: "q"
        // san: "gxh8=Q+"
        // to: "h8"
        
        // this.removePieceFromChildNode(block);
        this.addPieceToChildNode(document.getElementById(checkMove.to), checkMove.promotion, 'test', checkMove.color)
        console.log(currentPiece.id)
        console.log(this.chess.ascii())
        this.pieceLastPosition = document.getElementById(checkMove.to).id;
        
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
      this.snackbarService.show("CHECK","", timer);

    // Check for End Game Conditions
    if (this.chess.in_checkmate())
      this.snackbarService.show("checkmate", "", timer);
    if (this.chess.in_draw())
      this.snackbarService.show("Draw","", timer);
    if (this.chess.in_stalemate())
      this.snackbarService.show("Stalemate","", timer);
    if (this.chess.in_threefold_repetition())
      this.snackbarService.show("threefold repetition","", timer);
    
    if (this.chess.game_over()){
      setTimeout(() => {
        this.snackbarService.show("Game Over");
      }, timer);     
    }
  }

  fetchPieceFromChildNode(blockNode) {
    console.log("blockNode");
    console.log(blockNode);
    let piece;
    blockNode.firstChild.childNodes.forEach(element => {

      let name = element.nodeName.toLowerCase();
      //if (name === "app-pawn" || name === "app-queen" || name === "app-bishop" || name === "app-knight" || name === "app-rook")
      if (name === "div")  
        piece = element;
      
    });
    return piece;
  }

  swapPieceFromChildNode(oldBlockNode, newBlockNode) {
    newBlockNode.firstChild.appendChild(this.fetchPieceFromChildNode(oldBlockNode));
  }
  
  removePieceFromChildNode(blockNode) {
   blockNode.firstChild.removeChild(this.fetchPieceFromChildNode(blockNode));
  }

  addPieceToChildNode(blockNode, pieceType, pieceID, pieceColour) {
    let piece = pieceType;
    console.log(blockNode.firstElementChild)
    console.log(blockNode.firstElementChild.firstElementChildinnerHTML)
    blockNode.firstElementChild.firstElementChildinnerHTML = ""
    // `

    //                       <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
    //                         xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    //                         xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
    //                         xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    //                         xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" style="width: 100%; height: 100%"
    //                         viewBox="0 0 52.916666 52.916666" version="1.1"
    //                         inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)" sodipodi:docname="queen.svg">
    //                         <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"
    //                           transform="translate(0,-244.08334)">
    //                           <path fill="${pieceColour === 'b' ? this.pieceDark : this.pieceLight}"
    //                             d="m 26.148267,253.05075 a 3.1509065,3.3821693 0 0 0 -3.15071,3.3817 3.1509065,3.3821693 0 0 0 1.79007,3.04633 l -1.5043,10.53372 -4.10724,-8.07444 a 3.1509065,3.3821693 0 0 0 1.15393,-2.61276 3.1509065,3.3821693 0 0 0 -3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15123,3.38222 3.1509065,3.3821693 0 0 0 2.9931,3.37344 l 1.16892,8.91263 -5.19865,-5.81101 a 3.1509065,3.3821693 0 0 0 0.45631,-1.74408 3.1509065,3.3821693 0 0 0 -3.15123,-3.38223 3.1509065,3.3821693 0 0 0 -3.1507097,3.38223 3.1509065,3.3821693 0 0 0 3.1507097,3.38222 3.1509065,3.3821693 0 0 0 0.12299,-0.005 c 2.28321,4.9786 8.18623,13.65068 3.72638,15.63781 h 24.36492 c -4.45984,-1.98713 1.44318,-10.65921 3.72639,-15.63781 a 3.1509065,3.3821693 0 0 0 0.12248,0.005 3.1509065,3.3821693 0 0 0 3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15071,-3.38223 3.1509065,3.3821693 0 0 0 -3.15072,3.38223 3.1509065,3.3821693 0 0 0 0.45579,1.74408 l -5.19813,5.81101 1.1684,-8.91263 a 3.1509065,3.3821693 0 0 0 2.9931,-3.37344 3.1509065,3.3821693 0 0 0 -3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15123,3.38222 3.1509065,3.3821693 0 0 0 1.15393,2.61276 l -4.10724,8.07444 -1.5043,-10.53372 a 3.1509065,3.3821693 0 0 0 1.79059,-3.04633 3.1509065,3.3821693 0 0 0 -3.15123,-3.3817 3.1509065,3.3821693 0 0 0 -0.17983,0.007 3.1509065,3.3821693 0 0 0 -0.17984,-0.007 z m -14.84715,30.02142 v 5.29167 h 30.42708 v -5.29167 z"
    //                             id="path5338" inkscape:connector-curvature="0" />
    //                         </g>
    //                       </svg>
                        
    // `;
    //blockNode.firstElementChild.firstElementChildinnerHTML = document.getElementById("d1").firstElementChild.innerHTML;

    // switch (pieceType.toLowerCase()) {

    //     case 'p':

    //     break;
    //     case 'r':
    //       `<app-rook [pieceColour]="column.color === 'b' ? pieceDark : pieceLight" id="{{column.color}}_rook_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    //       </app-rook>`
    //       break;
    //     case 'n':

    //       break;
    //     case 'b':

    //       break;
    //     case 'k':

    //       break;
    //     case 'q':

    //       break;
    // }
    // <app-rook *ngIf="column.type === 'r'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_rook_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-rook>
    // <app-knight *ngIf="column.type === 'n'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_knight_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-knight>
    // <app-bishop *ngIf="column.type === 'b'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_bishop_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-bishop>
    // <app-queen *ngIf="column.type === 'q'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_queen_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-queen>
    // <app-king *ngIf="column.type === 'k'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_king_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-king>
    // <app-pawn *ngIf="column.type === 'p'"
    //   [pieceColour]="column.color === 'b' ? pieceDark : pieceLight"
    //   id="{{column.color}}_pawn_{{columnIndex}}" draggable="true" (dragstart)="drag($event)">
    // </app-pawn>
  }
  addComponent(componentClass: Type<any>) {
    // Create component dynamically inside the ng-template
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory);

    // Push the component so that we can keep track of which components are created
    this.components.push(component);
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

    this.showPromotion = false;
  }

}
