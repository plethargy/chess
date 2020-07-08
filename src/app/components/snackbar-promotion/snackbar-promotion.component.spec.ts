import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarPromotionComponent } from './snackbar-promotion.component';

describe('SnackbarPromotionComponent', () => {
  let component: SnackbarPromotionComponent;
  let fixture: ComponentFixture<SnackbarPromotionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnackbarPromotionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
