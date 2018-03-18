import { Component } from '@angular/core';

@Component({
  selector: 'app-graph-alg-viewer',
  templateUrl: './graph-alg-viewer.component.html',
  styleUrls: ['./graph-alg-viewer.component.css']
})
export class GraphAlgViewerComponent {

  public instructions: string;
  public nextButtonText: string;
  public currentState: IAlgViewerState;
  public StateTypes = StateType;

  constructor() {
    this.currentState = this.createCreateGraphState();
    this.currentState.run();
  }

  public next() {
    this.currentState = this.currentState.next(StateInput.Next);
    this.currentState.run();
  }

  private createCreateGraphState(): IAlgViewerState {
    const _comp = this;
    const run = () => {
      _comp.instructions = 'Create a graph';
      _comp.nextButtonText = 'Done';
    };
    const next = input => this.dummyState();
    return new AlgViewerState(StateType.CreatingGraph, run, next);
  }

  private dummyState(): IAlgViewerState {
    const run = () => {
      this.instructions = 'you win!';
    };
    const next = input => this.dummyState();
    return new AlgViewerState(StateType.Dummy, run, next);
  }
}

enum StateType {
  CreatingGraph,
  Dummy
}

enum StateInput {
  Next
}

interface IAlgViewerState {
  readonly state: StateType;
  run(): void;
  next(input: StateInput): IAlgViewerState;
}

/**
 * Generic viewer state. State actions are determined by functions
 * passed to the constructor.
 */
class AlgViewerState implements IAlgViewerState {

  constructor(
    public state: StateType,
    public run: (() => void),
    public next: ((input: StateInput) => IAlgViewerState)) {
  }
}
