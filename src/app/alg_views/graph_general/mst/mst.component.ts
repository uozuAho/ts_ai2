import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';
import { VisEdge, VisEdgeColor } from '../../../../libs/vis_wrappers/vis_network';

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
    this._currentState = this._currentState.next(StateInput.Next);
    this._currentState.run();
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
      for (const id of this.getMstEdges()) {
        this._graphEditor.editEdge(id, e => {
          if (e.color === undefined) {
            e.color = new VisEdgeColor();
          }
          e.color.color = 'red';
          e.width = 5;
        });
      }
      this._graphEditor.redraw();
    },
    input => this.mstState
  );

  /** Get the ids of edges in the MST */
  private getMstEdges(): Array<string | number> {
    const graph = this._graphEditor.getGraph();
    const mst = new Mst(graph);
    // since mst alg doesn't keep track of edge ids, build a map
    // map is (from,to): [edges]
    const edgeMap = new Map<string, VisEdge[]>();
    const edgeHash = edge => `${edge.from},${edge.to}`;
    for (const edge of this._graphEditor.getEdges()) {
      const hash = edgeHash(edge);
      const existing = edgeMap.get(hash);
      if (existing === undefined) {
        edgeMap.set(hash, [edge]);
      } else {
        existing.push(edge);
      }
    }
    // map mst edges to ids of edges in our graph
    const mstEdgeIds = [];
    for (const edge of mst.get_edges()) {
      const hash = edgeHash(edge);
      // take the first edge matching the hash
      // TODO: this won't be correct if the edges are weighted
      mstEdgeIds.push(edgeMap.get(hash)[0].id);
    }
    return mstEdgeIds;
  }
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
