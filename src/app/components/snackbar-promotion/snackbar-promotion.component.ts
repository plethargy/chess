import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { SnackbarPromotionService } from '../../../app/components/snackbar-promotion/snackbar-promotion.service';

@Component({
  selector: 'app-snackbar-promotion',
  templateUrl: './snackbar-promotion.component.html',
  styleUrls: ['./snackbar-promotion.component.css'],
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

export class SnackbarPromotionComponent implements OnInit {

  // CHESS PROMOTION
  piecePromotionColour: string = 'b'; // b || w
  pieceDark: string = 'var(--chesspiece-dark)';
  pieceLight: string = 'var(--chesspiece-light)';

  // GENERAL ALERTS
  show = true;

  @Output() selectedPromotionEvent = new EventEmitter<string>();

  constructor(private promotionSelectionService: SnackbarPromotionService) { }

  ngOnInit() {

  }

  pieceSelect(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.closest('button').id; 

    this.selectedPromotionEvent.emit(idAttr)
    this.promotionSelectionService.promotionSelection.next(idAttr);
  }

}