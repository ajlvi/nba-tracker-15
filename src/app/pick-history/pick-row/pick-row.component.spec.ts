import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickRowComponent } from './pick-row.component';

describe('PickRowComponent', () => {
  let component: PickRowComponent;
  let fixture: ComponentFixture<PickRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
