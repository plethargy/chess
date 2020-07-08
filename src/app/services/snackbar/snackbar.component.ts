import { Component, OnInit, OnDestroy } from '@angular/core';
import { SnackbarService } from './snackbar.service';
import { Subscription } from 'rxjs';

import { trigger, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
  animations: [
    trigger('state', [
      transition(':enter', [
        style({ bottom: '-100px', transform: 'translate(-50%, 0%) scale(0.3)' }),
        animate('150ms cubic-bezier(0, 0, 0.2, 1)', style({
          transform: 'translate(-50%, 0%) scale(1)',
          opacity: 1,
          bottom: '20px'
        })),
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0.0, 1, 1)', style({
          transform: 'translate(-50%, 0%) scale(0.3)',
          opacity: 0,
          bottom: '-100px'
        }))
      ])
    ])
  ]
})

export class SnackbarComponent implements OnInit, OnDestroy {

  // CHESS PROMOTION
  piecePromotion = false;
  piecePromotionColour: string = 'b'; // b || w
  pieceDark: string = 'var(--chesspiece-dark)';
  pieceLight: string = 'var(--chesspiece-light)';

  // GENERAL ALERTS
  show = false;
  message: string = '';
  type: string = '';
  cardType: string = '';
  timer: number = 0;
  snackbarSubscription: Subscription;

  constructor(private snackbarService: SnackbarService) { }

  ngOnInit() {
    this.snackbarSubscription = this.snackbarService.snackbarState
    .subscribe(
      (state) => {
        this.piecePromotion = state.piecePromotion;
        if (this.piecePromotion) {
          state.piecePromotionColour = this.piecePromotionColour;

          this.cardType = 'promotion-card';
          this.show = state.show;
          
        }
        else {
          this.type = state.type;
          this.message = state.message;

          this.show = state.show;

          this.timer = state.timer;
          if (this.timer > 0) {
            setTimeout(() => {
              this.show = false;
            }, this.timer);
          }
        }        
      });
  }

  ngOnDestroy() {
    this.snackbarSubscription.unsubscribe();
  }
}