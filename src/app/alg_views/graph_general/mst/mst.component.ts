import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';
import { VisEdge, VisEdgeColor } from '../../../../libs/vis_wrappers/vis_network';

const MST_EDGE_COLOR = 'red';
const MST_EDGE_WIDTH = 5;
const NORMAL_EDGE_COLOR = 'blue';
const NORMAL_EDGE_WIDTH = 1;

@Component({
  selector: 'app-mst',
  templateUrl: './mst.component.html',
  styleUrls: ['./mst.component.css']
})
export class MstComponent {

  private instructions: string;
  private nextButtonText = 'Done';

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {}

  public updateMst() {
    const allEdges = this._graphEditor.getEdges();
    const mstEdgeIds = new Set<string | number>(this.getMstEdgeIds());
    for (const edge of allEdges) {
      if (mstEdgeIds.has(edge.id)) {
        edge.color = <VisEdgeColor>{color: MST_EDGE_COLOR};
        edge.width = MST_EDGE_WIDTH;
      } else {
        edge.color = <VisEdgeColor>{color: NORMAL_EDGE_COLOR};
        edge.width = NORMAL_EDGE_WIDTH;
      }
      this._graphEditor.editEdge(edge.id, e => {
        e.color = edge.color;
        e.width = edge.width;
      });
    }
  }

  /** Get the ids of edges in the MST */
  private getMstEdgeIds(): Array<string | number> {
    const graph = this._graphEditor.getGraph();
    const mst = new Mst(graph);
    // since mst alg doesn't keep track of edge ids, build a map
    // map is (from,to): [edge ids]
    const edgeMap = new Map<string, Array<string | number>>();
    const edgeHash = edge => `${edge.from},${edge.to}`;
    let edges = this._graphEditor.getEdges();
    // add reverse edges to the map, since MST assumes undirected
    // graph and may return reverse edges
    // todo: this is really annoying to have to do. It'd be
    // nice to be able to store edge ids in the IGraph, but with the
    // current IGraph implementation, we can't store edge ids, since
    // one undirected edge is stored as two directed edges.
    edges = edges.concat(edges.map(e => new VisEdge(e.to, e.from, e.id)));
    for (const edge of edges) {
      const hash = edgeHash(edge);
      const existing = edgeMap.get(hash);
      if (existing === undefined) {
        edgeMap.set(hash, [edge.id]);
      } else {
        existing.push(edge.id);
      }
    }
    // map mst edges to ids of edges in our graph
    const mstEdgeIds = [];
    const nodes = graph.get_nodes();
    for (const edge of mst.get_edges()) {
      const nodeFrom = nodes[edge.from];
      const nodeTo = nodes[edge.to];
      const hash = edgeHash({from: nodeFrom.id, to: nodeTo.id});
      // take the first edge matching the hash
      // TODO: this won't be correct if the edges are weighted
      mstEdgeIds.push(edgeMap.get(hash)[0]);
    }
    return mstEdgeIds;
  }
}
