import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.css'],
})
export class GameResultComponent implements OnInit {
  result: string;
  resultText: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.result = paramMap.get('result');
    });
    console.log(this.result);
    this.resultText =
      this.result === 'WIN' ? 'Congratulations! You Won!' : 'Sorry! You Lose!';
  }
}
