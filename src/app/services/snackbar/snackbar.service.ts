import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  private snackbarSubject = new Subject<any>();
  public snackbarState = this.snackbarSubject.asObservable();

  constructor() { }

  show(message: string, type?: string, timer?: number) {
    this.snackbarSubject.next({
      show: true,
      message,
      type,
      timer
    });
  }

  promote(piecePromotion: boolean, piecePromotionColour?: string, type?: string) {
    this.snackbarSubject.next({
      piecePromotion: true,
      piecePromotionColour,
      show: true,
      type,
    });
  }
}

