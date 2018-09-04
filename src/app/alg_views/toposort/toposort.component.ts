import { Component, ViewChild } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode } from '../../../libs/vis_wrappers/vis_network';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { TarjanSCC } from '../../../ai_lib/algorithms/graph/tarjan_scc';
import { CycleOrderer } from './cycle_orderer';

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
          } else {
            return this.showSccOrderState;
          }
        }
        default: return this._currentState;
      }
    }
  );

  private showTopoOrderState = new AlgViewerState(
    () => {
      this.currentStepText = 'Colouring nodes in topological order';
      this.nextButtonText = 'Next';
      let idx = 0;
      const order = Array.from(this._topoSort.order());
      const nodes = this._originalGraph.get_nodes();
      this.showTopoOrderState.data.timer = setInterval(() => {
        const prevIdx = idx;
        if (++idx === order.length) { idx = 0; }
        this._graphEditor.editNode(nodes[order[prevIdx]].id, n => n.color = 'blue');
        this._graphEditor.editNode(nodes[order[idx]].id, n => n.color = 'red');
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

  private showSccOrderState = new AlgViewerState(
    () => {
      this.currentStepText = `Showing 'scc' order. Note that this orders strongly-connected components
                              (SCC) in topological order. Since a directed graph with cycles has no
                              topological order, SCCs are treated as a special case. In this case, they
                              are repeated twice per complete node ordering.`;
      // get order
      const graph = this._graphEditor.getDiGraph();
      const sccOrder = new CycleOrderer(graph);
      const order = Array.from(sccOrder.order());

      // show order
      let idx = 0;
      const nodes = graph.get_nodes();
      this.showTopoOrderState.data.timer = setInterval(() => {
        const prevIdx = idx;
        if (++idx === order.length) { idx = 0; }
        this._graphEditor.editNode(nodes[order[prevIdx]].id, n => n.color = 'blue');
        this._graphEditor.editNode(nodes[order[idx]].id, n => n.color = 'red');
      }, 300);
    },
    input => {
      switch (input) {
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
