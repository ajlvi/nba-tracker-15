import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickHistoryComponent } from './pick-history.component';

describe('PickHistoryComponent', () => {
  let component: PickHistoryComponent;
  let fixture: ComponentFixture<PickHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
