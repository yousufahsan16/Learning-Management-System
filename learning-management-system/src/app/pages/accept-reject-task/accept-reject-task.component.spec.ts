import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptRejectTaskComponent } from './accept-reject-task.component';

describe('AcceptRejectTaskComponent', () => {
  let component: AcceptRejectTaskComponent;
  let fixture: ComponentFixture<AcceptRejectTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptRejectTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptRejectTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
