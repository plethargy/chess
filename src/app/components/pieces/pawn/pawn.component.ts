import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pawn',
  templateUrl: './pawn.component.html',
  styleUrls: ['./pawn.component.css']
})
export class PawnComponent implements OnInit {

  @Input() pieceColour: string;

  constructor() { }

  ngOnInit(): void {
  }

}
