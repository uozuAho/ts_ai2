import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../shared/graph-editor/graph-editor.component';

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

  private _startNodeId: string | number;

  @ViewChild(GraphEditorComponent) graphEditor: GraphEditorComponent;

  constructor() {
    this.currentState = this.createCreateGraphState();
    this.currentState.run();
  }

  public next() {
    this.currentState = this.currentState.next(StateInput.Next);
    this.currentState.run();
  }

  private createCreateGraphState(): IAlgViewerState {
    const run = () => {
      this.instructions = 'Create a graph';
      this.nextButtonText = 'Done';
    };
    const next = input => {
      this.graphEditor.exitEditMode();
      return this.selectStartNode();
    };
    return new AlgViewerState(StateType.CreatingGraph, run, next);
  }

  private selectStartNode(): IAlgViewerState {
    const run = () => {
      this.instructions = 'Select start node';
      this.nextButtonText = 'Done';
      this.graphEditor.setOnNodeSelected(node => {
        if (this._startNodeId !== undefined) {
          this.graphEditor.editNode(this._startNodeId, n => n.color = 'blue');
        }
        this._startNodeId = node.id;
        this.graphEditor.editNode(node.id, n => n.color = 'red');
      });
    };
    const next = input => this.selectEndNode();
    return new AlgViewerState(StateType.SelectingStart, run, next);
  }

  private selectEndNode(): IAlgViewerState {
    const run = () => {
      this.instructions = 'Select end node';
      this.nextButtonText = 'Done';
    };
    const next = input => this.dummyState();
    return new AlgViewerState(StateType.SelectingStart, run, next);
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
  SelectingStart,
  SelectingEnd,
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
