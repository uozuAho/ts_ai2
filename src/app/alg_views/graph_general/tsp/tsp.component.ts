import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { VisEdge, VisNode, VisNetworkDef, VisEdgeColor } from '../../../../libs/vis_wrappers/vis_network';
import { GraphT } from '../../../../ai_lib/structures/graphT';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';
import { IGraph, Edge } from '../../../../ai_lib/structures/igraph';
import { Graph } from '../../../../ai_lib/structures/graph';
import { Blossom } from '../../../../ai_lib/algorithms/graph/blossom';
import { Assert } from '../../../../libs/assert/Assert';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TspComponent {

  private currentStepText: string;
  private backButtonText = 'Back';
  private nextButtonText = 'Done';

  private _currentState: AlgViewerState;
  private _originalGraph: GraphT<VisNode>;
  private _mst: IGraph;
  private _mstOddDGraph: GraphT<VisNode>;
  private _minOddDMatches: Edge[];
  private _mstPlusOddMatching: GraphT<VisNode>;

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
    () => {
      this.currentStepText = 'Create a map of cities. Don\'t worry about edges, they\'ll be generated';
      this.nextButtonText = 'Next';
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          this._originalGraph = this._graphEditor.getGraph();
          return this.getMstState;
        }
        default: return this._currentState;
      }
    }
  );

  private getMstState = new AlgViewerState(
    () => {
      this.currentStepText = 'Get MST of fully connected cities graph';
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
      this._mst = new Mst(graph);

      // delete any existing edges, populate MST edges
      this._graphEditor.deleteEdges();
      for (const edge of this._mst.get_edges()) {
        const nodeFrom = nodes[edge.from];
        const nodeTo = nodes[edge.to];
        this._graphEditor.addEdge(new VisEdge(nodeFrom.id, nodeTo.id));
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.createGraphState;
        case StateInput.Next: return this.getOddDegreeMstNodes;
        default: return this._currentState;
      }
    }
  );

  private getOddDegreeMstNodes = new AlgViewerState(
    () => {
      this.currentStepText = 'Find cities with odd degree in MST';
      const nodes = this._originalGraph.get_nodes();
      this._mstOddDGraph = new GraphT<VisNode>();
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (this._mst.degree(i) % 2 === 1) {
          this._mstOddDGraph.add_node(node);
          this._graphEditor.editNode(node.id, n => n.color = 'red');
        }
      }
      // connect all nodes in new graph
      const oddNodes = this._mstOddDGraph.get_nodes();
      for (let i = 0; i < oddNodes.length - 1; i++) {
        for (let j = i + 1; j < oddNodes.length; j++) {
          this._mstOddDGraph.add_edge(i, j, nodes[i].distanceSquaredTo(nodes[j]));
        }
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.getMstState;
        case StateInput.Next: return this.matchOddDegreeMstNodes;
        default: return this._currentState;
      }
    }
  );

  private matchOddDegreeMstNodes = new AlgViewerState(
    () => {
      this.currentStepText = 'Find minimum weight matching of odd degree cities';
      // create weighted edges for blossom algorithm
      const blossomEdges = [];
      const oddNodes = this._mstOddDGraph.get_nodes();
      let maxWeight = 0;
      for (let i = 0; i < oddNodes.length - 1; i++) {
        for (let j = i + 1; j < oddNodes.length; j++) {
          const weight = oddNodes[i].distanceSquaredTo(oddNodes[j]);
          blossomEdges.push([i, j, weight]);
          if (weight > maxWeight) {
            maxWeight = weight;
          }
        }
      }
      // invert weights since our only blossom alg only does max matching
      for (const edge of blossomEdges) {
        edge[2] = maxWeight - edge[2];
      }
      const matches = new Blossom(blossomEdges).getMatches();

      // show matching
      const marked = Array(oddNodes.length).fill(false);
      this._minOddDMatches = [];
      for (let i = 0; i < oddNodes.length - 1; i++) {
        if (marked[i]) { continue; }
        const j = matches[i];
        Assert.isTrue(j !== Blossom.NO_MATCH, 'should always find a perfect match');
        marked[i] = true;
        marked[j] = true;
        const e = new VisEdge(oddNodes[i].id, oddNodes[j].id);
        e.color = <VisEdgeColor> {color: 'red'};
        this._minOddDMatches.push(new Edge(i, j, oddNodes[i].distanceSquaredTo(oddNodes[j])));
        this._graphEditor.addEdge(e);
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.getOddDegreeMstNodes;
        case StateInput.Next: return this.createMstPlusOddMatches;
        default: return this._currentState;
      }
    }
  );

  private createMstPlusOddMatches = new AlgViewerState(
    () => {
      this.currentStepText = 'Add min weight match edges to MST';

      // build MST + M
      const mstPlus = new GraphT<VisNode>();
      this._originalGraph.get_nodes().forEach(n => mstPlus.add_node(n));
      this._mst.get_edges().forEach(e => mstPlus.add_edge(e.from, e.to, e.weight));
      this._minOddDMatches.forEach(e => mstPlus.add_edge(e.from, e.to, e.weight));
      this._mstPlusOddMatching = mstPlus;

      // show MST + M
      this.displayGraph(this._mstPlusOddMatching);
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.matchOddDegreeMstNodes;
        case StateInput.Next: return this.tempEndState;
        default: return this._currentState;
      }
    }
  );

  private tempEndState = new AlgViewerState(
    () => {
      this.currentStepText = 'Not yet implemented :)';
      this.nextButtonText = 'N/A';
    },
    input => this.tempEndState
  );

  private displayGraph(graph: GraphT<VisNode>) {
    const def = this.toNetworkDef(graph);
    this._graphEditor.setGraph(def);
  }

  private toNetworkDef(graph: GraphT<VisNode>): VisNetworkDef {
    const nodes = graph.get_nodes();
    const edges = graph.get_edges().map(e => new VisEdge(nodes[e.from].id, nodes[e.to].id));
    return new VisNetworkDef(nodes, edges);
  }
}

enum StateInput {
  Next,
  Back
}

class AlgViewerState {
  constructor(
    public run: (() => void),
    public next: ((input: StateInput) => AlgViewerState)) {
  }
}
