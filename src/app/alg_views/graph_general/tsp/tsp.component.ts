import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { VisEdge, VisNode, VisNetworkDef } from '../../../../libs/vis_wrappers/vis_network';
import { GraphT } from '../../../../ai_lib/structures/graphT';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';
import { IGraph } from '../../../../ai_lib/structures/igraph';
import { Graph } from '../../../../ai_lib/structures/graph';
import { FlowNetwork, FlowEdge } from '../../../../ai_lib/structures/flow_network';
import { BipartiteX } from '../../../../ai_lib/algorithms/graph/bipartiteX';
import { MaxFlow } from '../../../../ai_lib/algorithms/graph/max_flow';

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
  private _hungFlowNet: FlowNetwork;

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
        case StateInput.Next: return this.hungarianState;
        default: return this._currentState;
      }
    }
  );

  private hungarianState = new AlgViewerState(
    () => {
      this.currentStepText = 'Hungarian algorithm step 1: subtract min edge weight from all edges. ' +
                             'Showing 0-weight edges';

      // for each node, subtract min edge weight from all edges
      const oddNodes = this._mstOddDGraph.get_nodes();
      for (let i = 0; i < oddNodes.length; i++) {
        const adj = this._mstOddDGraph.adjacent(i);
        const minWeight = Math.min(...adj.map(e => e.weight));
        if (minWeight > 0) {
          for (const a of adj) {
            a.weight -= minWeight;
          }
        }
      }

      // build flow network with zero weight edges
      // add 2 nodes - sink and source - for finding matchings
      const def = new VisNetworkDef(oddNodes);
      this._hungFlowNet = new FlowNetwork(this._mstOddDGraph.num_nodes() + 2);
      // add zero weight edges
      for (const e of this._mstOddDGraph.get_edges()) {
        if (e.weight === 0) {
          // undirected flow network - add edges both ways
          this._hungFlowNet.add_flow_edge(new FlowEdge(e.from, e.to, 1));
          this._hungFlowNet.add_flow_edge(new FlowEdge(e.to, e.from, 1));
          def.edges.push(new VisEdge(oddNodes[e.from].id, oddNodes[e.to].id));
        }
      }
      // show 0-weight edges
      this._graphEditor.setGraph(def);
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.getOddDegreeMstNodes;
        case StateInput.Next: return this.hungarianState2;
        default: return this._currentState;
      }
    }
  );

  private hungarianState2 = new AlgViewerState(
    () => {
      this.currentStepText = 'Hungarian algorithm step 2: find max matching using 0-weight edges';

      const b = new BipartiteX(this._hungFlowNet);
      if (!b.isBipartite()) {
        throw new Error('Expected graph to be bipartite!');
      }

      // connect source to one side of bipartition, sink to other
      const source = this._mstOddDGraph.num_nodes();
      const sink = source + 1;
      for (let i = 0; i < this._mstOddDGraph.num_nodes(); i++) {
        if (b.color(i)) {
          this._hungFlowNet.add_flow_edge(new FlowEdge(source, i, 1));
          this._hungFlowNet.add_flow_edge(new FlowEdge(i, source, 1));
        }
        else {
          this._hungFlowNet.add_flow_edge(new FlowEdge(i, sink, 1));
          this._hungFlowNet.add_flow_edge(new FlowEdge(sink, i, 1));
        }
      }

      // find max flow from source to sink
      const maxFlow = new MaxFlow(this._hungFlowNet, source, sink);

      const oddNodes = this._mstOddDGraph.get_nodes();
      const def = new VisNetworkDef(oddNodes);
      for (const edge of maxFlow.edges()) {
        def.edges.push(new VisEdge(oddNodes[edge.from()].id, oddNodes[edge.to()].id));
      }
      // show matching
      this._graphEditor.setGraph(def);

    },
    input => {
      switch (input) {
        case StateInput.Back: return this.hungarianState;
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
