import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackbarPromotionService {

  promotionSelection = new Subject();
  constructor() { }
}
