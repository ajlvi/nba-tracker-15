import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarRowComponent } from './calendar-row.component';

describe('CalendarRowComponent', () => {
  let component: CalendarRowComponent;
  let fixture: ComponentFixture<CalendarRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
