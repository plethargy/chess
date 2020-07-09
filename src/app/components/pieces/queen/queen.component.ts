import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-queen',
  templateUrl: './queen.component.html',
  styleUrls: ['./queen.component.css']
})
export class QueenComponent implements OnInit {

  @Input() pieceColour: string;

  constructor() { }

  ngOnInit(): void {
  }

}
