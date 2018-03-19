import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';

@Component({
  selector: 'app-mst',
  templateUrl: './mst.component.html',
  styleUrls: ['./mst.component.css']
})
export class MstComponent {

  private instructions: string;
  private nextButtonText = 'Done';
  private _currentState: AlgViewerState;

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {
    this._currentState = this.createGraphState;
    this._currentState.run();
  }

  public next() {
    this._currentState.next(StateInput.Next);
  }

  private createGraphState = new AlgViewerState(
    StateType.CreatingGraph,
    () => { this.instructions = 'Create, generate, or drag & drop a graph'; },
    input => this.mstState
  );

  private mstState = new AlgViewerState(
    StateType.ShowMst,
    () => {
      this.instructions = 'Showing MST';
      const graph = this._graphEditor.getGraph();
      const mst = new Mst(graph);
      const nodes = graph.get_nodes();
      for (const edge of mst.get_edges()) {
        const nodeFrom = nodes[edge.from];
        const nodeTo = nodes[edge.to];
      }
    },
    input => this.mstState
  );
}

enum StateType {
  CreatingGraph,
  ShowMst
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
