import { Component, ViewChild } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode } from '../../../libs/vis_wrappers/vis_network';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';

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
  private _originalGraph: DiGraphT<VisNode>;
  private _topoSort: TopoSort;

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
          this._originalGraph = this._graphEditor.getDiGraph();
          return this.toposortState;
        }
        default: return this._currentState;
      }
    }
  );

  private toposortState = new AlgViewerState(
    () => {
      this.currentStepText = 'Attempt to order the vertices with a topological sort';
      this.nextButtonText = 'Next';
      this._topoSort = new TopoSort(this._originalGraph);
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          if (this._topoSort.hasOrder()) {
            return this.showTopoOrderState;
          }
          return this._currentState;
        }
        default: return this._currentState;
      }
    }
  );

  private showTopoOrderState = new AlgViewerState(
    () => {
      this.currentStepText = 'Here\'s your order mister';
      this.nextButtonText = 'Next';
      let idx = 0;
      const order = Array.from(this._topoSort.order());
      const nodes = this._originalGraph.get_nodes();
      this.showTopoOrderState.data.timer = setInterval(() => {
        const prevIdx = idx;
        if (++idx === order.length) { idx = 0; }
        this._graphEditor.editNode(nodes[prevIdx].id, n => n.color = 'blue');
        this._graphEditor.editNode(nodes[idx].id, n => n.color = 'red');
      }, 300);
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          return this._currentState;
        }
        default: return this._currentState;
      }
    },
    () => clearInterval(this.showTopoOrderState.data.timer)
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
    public data: any = {}) {
  }
}
