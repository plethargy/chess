import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  color: boolean;

  counter(i: number) {
    return new Array(i);
  }

  mod(i: number){
    if(i%2==0){
      return true;
    }
    else{
      return false;
    }
  }

}
