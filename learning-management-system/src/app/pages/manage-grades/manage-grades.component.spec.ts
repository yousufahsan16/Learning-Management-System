import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGradesComponent } from './manage-grades.component';

describe('ManageGradesComponent', () => {
  let component: ManageGradesComponent;
  let fixture: ComponentFixture<ManageGradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageGradesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
