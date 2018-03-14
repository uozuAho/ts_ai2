import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphAlgViewerComponent } from './graph-alg-viewer.component';

describe('GraphAlgViewerComponent', () => {
  let component: GraphAlgViewerComponent;
  let fixture: ComponentFixture<GraphAlgViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphAlgViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphAlgViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
