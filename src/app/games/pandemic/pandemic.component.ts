import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { PandemicDrawerComponent } from './pandemic_drawer';
import { PandemicBoard } from './pandemic_board';

@Component({
  selector: 'app-pandemic',
  templateUrl: './pandemic.component.html',
  styleUrls: ['./pandemic.component.css']
})
export class PandemicComponent implements AfterViewInit {

  private _board: PandemicBoard = new PandemicBoard();

  @ViewChild(PandemicDrawerComponent) private _drawer: PandemicDrawerComponent;

  constructor() { }

  public ngAfterViewInit() {
    this._drawer.drawBoard(this._board);
  }
}
