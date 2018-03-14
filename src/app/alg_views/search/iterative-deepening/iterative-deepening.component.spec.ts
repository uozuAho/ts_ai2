import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IterativeDeepeningComponent } from './iterative-deepening.component';

describe('IterativeDeepeningComponent', () => {
  let component: IterativeDeepeningComponent;
  let fixture: ComponentFixture<IterativeDeepeningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IterativeDeepeningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IterativeDeepeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
