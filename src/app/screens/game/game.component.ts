import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, Type} from '@angular/core';
// import { style } from '@angular/animations';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { SocketService } from 'src/app/services/socket/socket.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @ViewChild('check', {read: ViewContainerRef}) container: ViewContainerRef;

  pieceLastPosition = "";
  color: boolean;
  chessboard : any;

  pieceDark: string = 'var(--chesspiece-dark)';
  pieceLight: string = 'var(--chesspiece-light)';
  blockColour1: string = 'light-section';
  blockColour2: string = 'dark-section';

  dragging: boolean = true;
  dropping: boolean = true;

  showPromotion: boolean = false;
  selectedPromotion:string;

  // Keep track of list of generated components for removal purposes
  components = [];

  // Expose class so that it can be used in the template
  // queenComponentClass = QueenComponent;

  private socket: any;
  private sessionId: string;

  moveList : any;
  currentPiece : any;
  block: any;
  data: any;
  colourTurn: any;

  constructor(private snackbarService: SnackbarService, private socketService : SocketService, private componentFactoryResolver: ComponentFactoryResolver) {

    this.socket = socketService.socket;
    this.sessionId = socketService.sessionID;

  }

  ngOnInit(): void {

    //this.snackbarService.show('test','success', 3000);
    //let ret = this.snackbarService.promote(true);
    
    this.socket.emit("getBoard", this.sessionId);

    this.socket.on("postBoard", data => {
      console.log("hi there");
      this.chessboard = [];
      for (let item of data) {
        this.chessboard.push(item);
      }
    })


    this.socket.on("postMoves", data =>{
      console.log('Moves' , data);
      this.moveList = data;

      for (let index = 0; index < this.moveList.length; index++) {
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
  
        let block = this.moveList[index];
        this.colourTurn = 'w'; // store in a variable // ### FIX - GET FROM SERVER
  
        // can refactor with regex      
        if (block.includes("O-"))
        {
          // CASTLING
          // King Side
          if (block === "O-O")
          {
            if (this.colourTurn === 'w')
              block = "g1"; // king > g1   rook > f1
            if (this.colourTurn === 'b')
              block = "g8"; // king > g8   rook > f8
          }
  
          // Queen Side
          if (block === "O-O-O")
          {
            if (this.colourTurn === 'w')
              block = "c1"; // king to c1   rook > d1
            if (this.colourTurn === 'b')
              block = "c8"; // king > c8    rook > d8
          }
        }
        if (block.includes('='))
          block = block.replace(/(?<==)[^\]]+/,'');  // PROMOTION // replace everything after = // can refactor
  
        block = block.replace(/[\=, \+, \#]+/g,''); // remove suffix of PROMOTION(=), CHECK (+), CHECKMATE (#)
        block = block.slice(-2); // STANDARD MOVE
  
        document.getElementById(block).classList.add("avaliableMove");
      }
    });

    this.socket.on("moveResult", response => {
      let checkMove = response;

      console.log("Move result",checkMove);
    
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
          this.removePieceFromChildNode(this.block);
  
        this.pieceLastPosition = "";
        this.block.firstChild.appendChild(document.getElementById(this.data));
  
        if (checkMove.flags.includes('e')) {
          //eg
            // b d7 > d5    w e5 > d6   w  en passant captures b on d5
            // w d2 > d4    b e4 > d3   b  en passant captures w on d4
  
          let passantBlockID = '';
          if (checkMove.color === "w")
            passantBlockID = (this.block.id[0] + (parseInt(this.block.id[1]) - 1).toString());
          else 
            passantBlockID = (this.block.id[0] + (parseInt(this.block.id[1]) + 1).toString());
  
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
              if (this.colourTurn === 'w') {
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
              if (this.colourTurn === 'w') {              
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
          console.log(this.currentPiece.id)
          //console.log(this.chess.ascii())
          this.pieceLastPosition = document.getElementById(checkMove.to).id;
          
        }
      }
      //this.gameCondition();
      this.removeBlockHighlighting();

      this.dragging = true;
      this.socket.emit("getBoard", this.sessionId);
    
    });

  }

  getMoves(position : string) : void {
    this.socket.emit("getMoves", this.sessionId, position);
  }

  move(from : string, to : string) : void{
    this.socket.emit("move", this.sessionId, from, to);
  }

  counter(i: number){
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

    if (this.dragging) {
      this.dragging = false;
      this.getMoves(this.pieceLastPosition);
    }

  }

  drop(ev) {

    this.colourTurn = 'w'; // ### FIX - GET FROM SERVER 
    //this.snackbarService.show('test','success', 3000);
    //this.showPromotion = true;

    console.log("Piece dropped");

    ev.preventDefault();
    this.data = ev.dataTransfer.getData("text");
    console.log("ev",ev)

    this.block = ev.target.closest(".block");
    console.log("block",this.block);

    console.log("last")
    console.log(document.getElementById(this.pieceLastPosition));
    this.currentPiece = this.fetchPieceFromChildNode(document.getElementById(this.pieceLastPosition));

    if (this.currentPiece.id.includes("pawn") && (this.block.id.includes('8') || this.block.id.includes('1')))
    { 
      this.showPromotion = true; // also how to subscribe unil the user is done selecting a piece //receiveSelectedPromotion
      

      //Update Server to take promotion key
      // checkMove = this.chess.move({ 
      //   from: this.pieceLastPosition,
      //   to: block.id,
      //   promotion: 'q'
      // });

    }
    else {
      this.move(this.pieceLastPosition, this.block.id);
    }

  }
  
  gameCondition()
  { 
    // let timer = 3000;

    // // change red or green depending who is in check?
    // if (this.chess.in_check())
    //   this.snackbarService.show("CHECK","", timer);

    // // Check for End Game Conditions
    // if (this.chess.in_checkmate())
    //   this.snackbarService.show("checkmate", "", timer);
    // if (this.chess.in_draw())
    //   this.snackbarService.show("Draw","", timer);
    // if (this.chess.in_stalemate())
    //   this.snackbarService.show("Stalemate","", timer);
    // if (this.chess.in_threefold_repetition())
    //   this.snackbarService.show("threefold repetition","", timer);
    
    // if (this.chess.game_over()){
    //   setTimeout(() => {
    //     this.snackbarService.show("Game Over");
    //   }, timer);     
    // }
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
