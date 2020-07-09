import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, Type} from '@angular/core';
// import { style } from '@angular/animations';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { PlayerlookupService } from 'src/app/services/playerlookup/playerlookup.service';
import { Router } from '@angular/router';
import { SnackbarPromotionService } from 'src/app/components/snackbar-promotion/snackbar-promotion.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  pieceLastPosition = "";
  color: boolean;
  chessboard : any;

  pieceDark: string = "var(--chesspiece-dark)";
  pieceLight: string = "var(--chesspiece-light)";
  blockColour1: string = "light-section";
  blockColour2: string = "dark-section";

  dragging: boolean = true;
  dropping: boolean = true;

  showPromotion: boolean = false;
  selectedPromotion:string;


  private socket: any;
  private sessionId: string;

  moveList : any;
  currentPiece : any;
  block: any;
  data: any;
  colourTurn: any;
  thisPlayer : boolean;
  players : any = {white: null, black: null};
  history : any;

  playerLookup : PlayerlookupService;

  constructor(private snackbarService: SnackbarService, private socketService : SocketService, private promotionSelectionService: SnackbarPromotionService, private playerLookupService : PlayerlookupService, private router: Router) {

    this.socket = socketService.socket;
    this.sessionId = socketService.sessionID;
    this.playerLookup = playerLookupService;

  }

  ngOnInit(): void {

    //this.snackbarService.show('test','success', 3000);
    //let ret = this.snackbarService.promote(true);
    let email : string = JSON.parse(localStorage.getItem("userData")).email;
    if (this.playerLookup.getUserColour(email) == "black")
      this.thisPlayer = true;
    else
      this.thisPlayer = false;


    this.socket.on("postTurn", data => {
      this.colourTurn = data;
    })
    
    
    this.socket.emit("getBoard", this.sessionId);
    this.socket.emit("getTurn", this.sessionId);

    this.socket.on("postBoard", data => {
      console.log("hi there");
      this.chessboard = [];
      for (let item of data) {
        this.chessboard.push(item);
      }
    })

    //game end
    this.socket.on("gameOver", data => {
      console.log("Game Over");
      console.log(data);
      this.socketService.sessionID = null;
      this.router.navigateByUrl('/lobbies');
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
        this.socket.emit("getTurn", this.sessionId);; // store in a variable // ### FIX - GET FROM SERVER
  
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

        this.sound();
  
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

          this.addPieceToChildNode(document.getElementById(checkMove.to), checkMove.promotion, '', checkMove.color);          
        }
      }
      //this.gameCondition();
      this.removeBlockHighlighting();

      this.dragging = true;
      this.socket.emit("getBoard", this.sessionId);
      this.socket.emit("getTurn", this.sessionId);
    
    });


    this.socket.on("postUsersForSession", data => {
      this.players.white = data.playerWhite;
      this.players.black = data.playerBlack;
    });


    this.socket.emit("getUsersForSession", this.sessionId);

  }

  sound(){
    let audio = new Audio();
    audio.src = '../../../assets/sound/move.wav';
    audio.load();
    audio.play();
  }

  getMoves(position : string) : void {
    this.socket.emit("getMoves", this.sessionId, position);
  }

  move(from : string, to : string, toPromotion : string) : void{
    this.socket.emit("move", this.sessionId, from, to, toPromotion);
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
      this.blockColour1 = this.blockColour1 == "light-section" ? "dark-section" : "light-section";
      this.blockColour2 = this.blockColour2 == "dark-section" ? "light-section" : "dark-section";
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
    let email : string = JSON.parse(localStorage.getItem("userData")).email;
    let colour : string = this.playerLookup.getUserColour(email);
    if (ev.target.id[0] == "w" && colour !== "white")
      return;
    if (ev.target.id[0] == "b" && colour !== "black")
      return;
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

    this.socket.emit("getTurn", this.sessionId); // ### FIX - GET FROM SERVER 

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
      
      this.promotionSelectionService.promotionSelection.subscribe((pieceData: string) => {
        this.move(this.pieceLastPosition, this.block.id, pieceData);      
      });    
    }
    else {
      this.move(this.pieceLastPosition, this.block.id, undefined);
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

  removeBlockHighlighting() {
    let highlighted = document.getElementsByClassName("avaliableMove");

    while (highlighted.length > 0) {
      highlighted[0].classList.remove(("avaliableMove"));
    }
  }

  addPieceToChildNode(blockNode, pieceType, pieceID, pieceColour) {

    switch (pieceType.toLowerCase()) {

      case 'r':
        blockNode.firstElementChild.firstElementChild.innerHTML = `
          <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" style="width: 100%; height: 100%"
          viewBox="0 0 52.916666 52.916666" version="1.1"
          inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)" sodipodi:docname="rook.svg">
          <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"
            transform="translate(0,-244.08334)">
            <path fill="${pieceColour === 'b' ? this.pieceDark : this.pieceLight}"
              d="m 21.307215,250.607 v 5.27668 h -3.507799 v -4.92114 h -6.61462 v 15.48949 h 6.54382 c 0.0169,6.61647 0.35063,14.33684 -6.57999,18.29242 v 5.29167 h 15.213577 15.213543 v -5.29167 c -6.930584,-3.95559 -6.59683,-11.67595 -6.579963,-18.29242 h 6.543791 v -15.48949 h -6.614586 v 4.92114 H 31.417193 V 250.607 Z"
              id="rect739-1" inkscape:connector-curvature="0" />
          </g>
        </svg>
        `;
        break;
      case 'n':
        blockNode.firstElementChild.firstElementChild.innerHTML = `
          <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" style="width: 100%; height: 100%"
          viewBox="0 0 52.916666 52.916666" version="1.1"
          inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)" sodipodi:docname="knight.svg">
          <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"
            transform="translate(0,-244.08334)">
            <path fill="${pieceColour === 'b' ? this.pieceDark : this.pieceLight}"
              d="m 22.90838,269.73806 -7.79101,5.78676 c 0.17465,0.14138 3.21764,7.37363 -3.75946,9.29668 v 0 5.29167 h 30.427079 v -5.29167 0 c -10.640568,-2.76251 -5.11547,-14.37436 -1.117949,-21.11625 l -11.22117,-13.05537 -1.823439,0.7256 0.237368,5.42175 -16.249069,6.84579 1.61843,8.48616 z"
              id="rect852-6-9" inkscape:connector-curvature="0"
              sodipodi:nodetypes="ccccccccccccccc" />
          </g>
        </svg>
        `;
        break;
      case 'b':
        blockNode.firstElementChild.firstElementChild.innerHTML = `
          <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" style="width: 100%; height: 100%"
          viewBox="0 0 52.916666 52.916666" version="1.1"
          inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)" sodipodi:docname="bishop.svg">
          <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"
            transform="translate(0,-244.08334)">
            <path fill="${pieceColour === 'b' ? this.pieceDark : this.pieceLight}"
              d="m 26.179169,250.74863 c -2.922506,0 -5.291666,2.36916 -5.291666,5.29167 1.95e-4,1.18992 0.401441,2.34505 1.138948,3.27887 -3.946632,4.82008 -8.450912,9.05138 -9.318811,15.89412 -1.143478,9.01551 7.258745,9.44056 -1.856215,10.11824 l -5.29e-4,-5.3e-4 v 5.29167 h 15.213541 v -17.31471 c -0.414166,-0.0818 -0.808844,-0.24211 -1.16272,-0.47232 -1.529101,-0.99929 -1.958524,-3.04899 -0.959114,-4.57801 0.486996,-0.74161 1.251535,-1.25645 2.121834,-1.42886 -2.41e-4,-6.78785 5.55e-4,-4.87487 5.29e-4,-5.3e-4 0.570805,-0.11455 1.161736,-0.0764 1.713075,0.11059 l 3.81372,-5.83634 c -0.461958,-0.54236 -0.92274,-1.08838 -1.376662,-1.64124 0.810414,-0.95568 1.255395,-2.16794 1.255739,-3.42098 0,-2.92251 -2.369161,-5.29167 -5.291667,-5.29167 z m 6.549988,11.69748 -3.547071,5.42757 c 0.989852,1.11458 1.111748,2.7536 0.297657,4.00234 -0.739339,1.12951 -2.090947,1.69629 -3.414779,1.43196 v 17.3147 h 15.21406 v -5.29166 l -5.29e-4,5.3e-4 c -9.115216,-0.6777 -0.712692,-1.10275 -1.856205,-10.11826 -0.677455,-5.34107 -3.577784,-9.08752 -6.693133,-12.76718 z"
              id="rect857-2-8-2" inkscape:connector-curvature="0"
              sodipodi:nodetypes="sccscccccccccccccsccccccccsc" />
          </g>
        </svg>
        `;
        break;
      case 'q':
        blockNode.firstElementChild.firstElementChild.innerHTML = `
          <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
            xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
            xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" style="width: 100%; height: 100%"
            viewBox="0 0 52.916666 52.916666" version="1.1"
            inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)" sodipodi:docname="queen.svg">
            <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1"
              transform="translate(0,-244.08334)">
              <path fill="${pieceColour === 'b' ? this.pieceDark : this.pieceLight}"
                d="m 26.148267,253.05075 a 3.1509065,3.3821693 0 0 0 -3.15071,3.3817 3.1509065,3.3821693 0 0 0 1.79007,3.04633 l -1.5043,10.53372 -4.10724,-8.07444 a 3.1509065,3.3821693 0 0 0 1.15393,-2.61276 3.1509065,3.3821693 0 0 0 -3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15123,3.38222 3.1509065,3.3821693 0 0 0 2.9931,3.37344 l 1.16892,8.91263 -5.19865,-5.81101 a 3.1509065,3.3821693 0 0 0 0.45631,-1.74408 3.1509065,3.3821693 0 0 0 -3.15123,-3.38223 3.1509065,3.3821693 0 0 0 -3.1507097,3.38223 3.1509065,3.3821693 0 0 0 3.1507097,3.38222 3.1509065,3.3821693 0 0 0 0.12299,-0.005 c 2.28321,4.9786 8.18623,13.65068 3.72638,15.63781 h 24.36492 c -4.45984,-1.98713 1.44318,-10.65921 3.72639,-15.63781 a 3.1509065,3.3821693 0 0 0 0.12248,0.005 3.1509065,3.3821693 0 0 0 3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15071,-3.38223 3.1509065,3.3821693 0 0 0 -3.15072,3.38223 3.1509065,3.3821693 0 0 0 0.45579,1.74408 l -5.19813,5.81101 1.1684,-8.91263 a 3.1509065,3.3821693 0 0 0 2.9931,-3.37344 3.1509065,3.3821693 0 0 0 -3.15071,-3.38222 3.1509065,3.3821693 0 0 0 -3.15123,3.38222 3.1509065,3.3821693 0 0 0 1.15393,2.61276 l -4.10724,8.07444 -1.5043,-10.53372 a 3.1509065,3.3821693 0 0 0 1.79059,-3.04633 3.1509065,3.3821693 0 0 0 -3.15123,-3.3817 3.1509065,3.3821693 0 0 0 -0.17983,0.007 3.1509065,3.3821693 0 0 0 -0.17984,-0.007 z m -14.84715,30.02142 v 5.29167 h 30.42708 v -5.29167 z"
                id="path5338" inkscape:connector-curvature="0" />
            </g>
          </svg>
        `;
        //blockNode.firstElementChild.innerHTML = blockNode.firstElementChild.innerHTML.replace(pieceID, (pieceID.replace('pawn', 'queen')));
        break;
    }
  }

  receiveSelectedPromotion($event) {
    this.selectedPromotion = $event

    this.showPromotion = false;
  }


}
