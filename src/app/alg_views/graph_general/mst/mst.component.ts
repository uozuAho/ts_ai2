import { Component } from '@angular/core';

@Component({
  selector: 'app-mst',
  templateUrl: './mst.component.html',
  styleUrls: ['./mst.component.css']
})
export class MstComponent {

  private instructions: string;
  private nextButtonText = 'Done';
  private _currentState: AlgViewerState;

  constructor() {
    this._currentState = this.createGraphState;
    this._currentState.run();
  }

  public next() {
    this._currentState.next(StateInput.Next);
  }

  private createGraphState = new AlgViewerState(
    StateType.CreatingGraph,
    () => { this.instructions = 'Create a graph'; },
    input => this.createGraphState
  );
}

enum StateType {
  CreatingGraph,
}

enum StateInput {
  Next
}

class AlgViewerState {
  constructor(
    public state: StateType,
    public run: (() => void),
    public next: ((input: StateInput) => AlgViewerState)) {
    }
}
