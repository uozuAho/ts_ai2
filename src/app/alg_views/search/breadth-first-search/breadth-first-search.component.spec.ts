import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadthFirstSearchComponent } from './breadth-first-search.component';

describe('BreadthFirstSearchComponent', () => {
  let component: BreadthFirstSearchComponent;
  let fixture: ComponentFixture<BreadthFirstSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadthFirstSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadthFirstSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
