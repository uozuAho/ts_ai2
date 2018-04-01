import { Component, ViewChild } from '@angular/core';
import { GraphT } from '../../../ai_lib/structures/graphT';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode } from '../../../libs/vis_wrappers/vis_network';

@Component({
  selector: 'app-toposort',
  templateUrl: './toposort.component.html',
  styleUrls: ['./toposort.component.css']
})
export class ToposortComponent {

  private currentStepText: string;
  private backButtonText = 'Back';
  private nextButtonText = 'Done';

  private _currentState: AlgViewerState;
  private _originalGraph: GraphT<VisNode>;

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {
    this.reset();
  }

  private reset() {
    if (this._graphEditor) { this._graphEditor.clear(); }
    if (this._currentState && this._currentState.onLeavingState !== null) {
      this._currentState.onLeavingState();
    }
    this._currentState = this.createGraphState;
    this._currentState.run();
  }

  private next() { this.updateState(StateInput.Next); }
  private back() { this.updateState(StateInput.Back); }

  private updateState(input: StateInput) {
    const prevState = this._currentState;
    this._currentState = this._currentState.next(input);
    if (this._currentState !== prevState) {
      if (prevState.onLeavingState !== null) {
        prevState.onLeavingState();
      }
      this._currentState.run();
    }
  }

  private createGraphState = new AlgViewerState(
    () => {
      this.currentStepText = 'Draw a graph';
      this.nextButtonText = 'Next';
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          this._originalGraph = this._graphEditor.getGraph();
          return this.createGraphState;
        }
        default: return this._currentState;
      }
    }
  );
}

enum StateInput {
  Next,
  Back
}

class AlgViewerState {
  constructor(
    public run: (() => void),
    public next: ((input: StateInput) => AlgViewerState),
    public onLeavingState: (() => void) = null,
    private data: any = {}) {
  }
}
