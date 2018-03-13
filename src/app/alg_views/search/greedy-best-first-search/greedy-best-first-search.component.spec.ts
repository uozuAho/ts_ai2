import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GreedyBestFirstSearchComponent } from './greedy-best-first-search.component';

describe('GreedyBestFirstSearchComponent', () => {
  let component: GreedyBestFirstSearchComponent;
  let fixture: ComponentFixture<GreedyBestFirstSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GreedyBestFirstSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GreedyBestFirstSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
