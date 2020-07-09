import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-bishop',
  templateUrl: './bishop.component.html',
  styleUrls: ['./bishop.component.css']
})
export class BishopComponent implements OnInit {

  @Input() pieceColour: string;

  constructor() { }

  ngOnInit(): void {
  }

}
