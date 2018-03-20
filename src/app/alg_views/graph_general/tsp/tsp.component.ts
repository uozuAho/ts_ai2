import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { VisEdge } from '../../../../libs/vis_wrappers/vis_network';
import { Graph } from '../../../../ai_lib/structures/graph';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TspComponent {

  private instructions: string;
  private backButtonText = 'Back';
  private nextButtonText = 'Done';
  private _currentState: AlgViewerState;

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {
    this.reset();
  }

  private reset() {
    if (this._graphEditor) { this._graphEditor.clear(); }
    this._currentState = this.createGraphState;
    this._currentState.run();
  }

  private next() { this.updateState(StateInput.Next); }
  private back() { this.updateState(StateInput.Back); }

  private updateState(input: StateInput) {
    const prevState = this._currentState;
    this._currentState = this._currentState.next(input);
    if (this._currentState !== prevState) {
      this._currentState.run();
    }
  }

  private createGraphState = new AlgViewerState(
    StateType.CreatingGraph,
    () => {
      this.instructions = 'Create a map of cities. Don\'t worry about edges, they\'ll be generated';
      this.nextButtonText = 'Done';
    },
    input => {
      switch (input) {
        case StateInput.Next: return this.joinNodesState;
        default: return this._currentState;
      }
    }
  );

  private joinNodesState = new AlgViewerState(
    StateType.JoinNodes,
    () => {
      this.instructions = 'Get MST of fully connected cities graph';
      this.nextButtonText = 'Next';

      // find mst of fully connected nodes
      const nodes = this._graphEditor.getNodes();
      const graph = new Graph(nodes.length);
      for (let i = 0; i < nodes.length - 1; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const dist2 = Math.pow(ni.x - nj.x, 2) + Math.pow(ni.y - nj.y, 2);
          graph.add_edge(i, j, dist2);
        }
      }
      const mst = new Mst(graph);

      // delete any existing edges, populate MST edges
      this._graphEditor.deleteEdges();
      for (const edge of mst.get_edges()) {
        const nodeFrom = nodes[edge.from];
        const nodeTo = nodes[edge.to];
        this._graphEditor.addEdge(new VisEdge(nodeFrom.id, nodeTo.id));
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.createGraphState;
        case StateInput.Next: return this.tempEndState;
        default: return this._currentState;
      }
    }
  );

  private tempEndState = new AlgViewerState(
    StateType.TempEnd,
    () => {
      this.instructions = 'Not yet implemented :)';
      this.nextButtonText = 'N/A';
    },
    input => this.tempEndState
  );
}

enum StateType {
  CreatingGraph,
  JoinNodes,
  TempEnd
}

enum StateInput {
  Next,
  Back
}

class AlgViewerState {
  constructor(
    public state: StateType,
    public run: (() => void),
    public next: ((input: StateInput) => AlgViewerState)) {
  }
}
