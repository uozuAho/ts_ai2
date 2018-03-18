import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstComponent } from './mst.component';

describe('MstComponent', () => {
  let component: MstComponent;
  let fixture: ComponentFixture<MstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
