import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConfigComponent } from './group-config.component';

describe('GroupConfigComponent', () => {
  let component: GroupConfigComponent;
  let fixture: ComponentFixture<GroupConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
