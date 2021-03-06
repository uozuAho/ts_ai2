import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { VisEdge, VisNode, VisNetworkDef, VisEdgeColor } from '../../../../libs/vis_wrappers/vis_network';
import { GraphT } from '../../../../ai_lib/structures/graphT';
import { Mst } from '../../../../ai_lib/algorithms/graph/mst';
import { IGraph, Edge } from '../../../../ai_lib/structures/igraph';
import { Graph } from '../../../../ai_lib/structures/graph';
import { Blossom } from '../../../../ai_lib/algorithms/graph/blossom';
import { Assert } from '../../../../libs/assert/Assert';
import { EulerianCycle } from '../../../../ai_lib/algorithms/graph/euler_cycle';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css']
})
export class TspComponent {

  private currentStepText: string;
  private backButtonText = 'Back';
  private nextButtonText = 'Done';

  /** Current state of the demonstration state machine */
  private _currentState: AlgViewerState;

  /******************************************************
   Outputs of various states
  ******************************************************/
  private _originalGraph: GraphT<VisNode>;
  private _nodes: VisNode[];
  private _mst: IGraph;
  private _mstOddDGraph: GraphT<VisNode>;
  private _minOddDMatches: VisEdge[];
  private _mstPlusOddMatching: GraphT<VisNode>;

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
      this.currentStepText = 'Create a map of nodes. Don\'t worry about edges, they\'ll be generated';
      this.nextButtonText = 'Next';
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          this._originalGraph = this._graphEditor.getGraph();
          this._nodes = this._originalGraph.get_nodes();
          return this.getMstState;
        }
        default: return this._currentState;
      }
    }
  );

  private getMstState = new AlgViewerState(
    () => {
      this.currentStepText = 'Get MST of fully connected graph';
      this.nextButtonText = 'Next';

      // fully connect starting graph, with weights equal to distance between nodes
      const graph = new Graph(this._nodes.length);
      for (let i = 0; i < this._nodes.length - 1; i++) {
        const ni = this._nodes[i];
        for (let j = i + 1; j < this._nodes.length; j++) {
          const nj = this._nodes[j];
          graph.add_edge(i, j, ni.distanceSquaredTo(nj));
        }
      }

      // find mst of fully connected nodes
      this._mst = new Mst(graph);

      // show MST:
      // delete any existing edges, populate MST edges
      this._graphEditor.deleteEdges();
      for (const edge of this._mst.get_edges()) {
        const nodeFrom = this._nodes[edge.from];
        const nodeTo = this._nodes[edge.to];
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
      this.currentStepText = 'Find nodes with odd degree in MST';

      this._mstOddDGraph = new GraphT<VisNode>();
      for (let i = 0; i < this._nodes.length; i++) {
        const node = this._nodes[i];
        if (this._mst.degree(i) % 2 === 1) {
          this._mstOddDGraph.add_node(node);
          this.setNodeColor(node, 'red');
        }
      }
      // connect all nodes in new graph
      const oddNodes = this._mstOddDGraph.get_nodes();
      for (let i = 0; i < oddNodes.length - 1; i++) {
        for (let j = i + 1; j < oddNodes.length; j++) {
          this._mstOddDGraph.add_edge(i, j, oddNodes[i].distanceSquaredTo(oddNodes[j]));
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
      this.currentStepText = 'Find minimum weight matching of odd degree nodes';

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

      // find matching
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
        const edge = new VisEdge(oddNodes[i].id, oddNodes[j].id);
        edge.color = <VisEdgeColor> {color: 'red'};
        edge.width = 3;
        this._minOddDMatches.push(edge);
        this._graphEditor.addEdge(edge);
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

      // Current display should include MST + M edges, with M nodes & edges highlighted.
      // Just reset all edge styles.
      const displayGraph = this.getCurrentDisplayGraph();
      for (const node of displayGraph.nodes) {
        this.setNodeColor(node, 'blue');
      }
      for (const edge of displayGraph.edges) {
        this._graphEditor.editEdge(edge.id, e => {
          e.color = <VisEdgeColor> { color: 'blue' };
          e.width = 1;
        });
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.matchOddDegreeMstNodes;
        case StateInput.Next: return this.findEulerCycle;
        default: return this._currentState;
      }
    }
  );

  private findEulerCycle = new AlgViewerState(
    () => {
      this.currentStepText = 'Find euler cycle of resulting graph, then visit the nodes in the ' +
                             'order that they first appear in the cycle.';

      const euler = new EulerianCycle(this._graphEditor.getGraph());

      Assert.isTrue(euler.hasEulerianCycle(), 'no cycle found!');

      // tour order is the order of nodes in the euler cycle
      // note that the euler cycle may visit nodes twice, since
      // MST + M may not be a simple graph
      const tour: VisNode[] = [];
      const tspSet = new Set<number>();
      for (const idx of euler.cycle()) {
        if (!tspSet.has(idx)) {
          tspSet.add(idx);
          tour.push(this._nodes[idx]);
        }
      }
      // complete the tour by adding the first node to the end
      tour.push(tour[0]);

      // show the tour
      this._graphEditor.deleteEdges();
      for (let i = 1; i < tour.length; i++) {
        const prev = tour[i - 1];
        const curr = tour[i];
        this._graphEditor.addEdge(new VisEdge(prev.id, curr.id));
      }

      // check the solution
      if (tour.length !== this._nodes.length + 1) {
        console.error(`tour length (${tour.length}) should equal number of nodes + 1 (${this._nodes.length + 1})`);
      }
      const nodeSet = new Set<VisNode>(this._nodes);
      const visited = new Set<VisNode>();
      for (const node of tour) {
        if (visited.has(node) && node !== tour[0]) {
          console.error(`node '${node.label}' is visited > 1 times`);
        }
        visited.add(node);
        nodeSet.delete(node);
      }
      for (const node of nodeSet) {
        console.error(`node '${node.label}' is not visited`);
      }
    },
    input => {
      switch (input) {
        case StateInput.Back: return this.createMstPlusOddMatches;
        default: return this._currentState;
      }
    },
    () => { clearInterval(this.findEulerCycle.data.timer); }
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

  private getCurrentDisplayGraph(): VisNetworkDef {
    return this._graphEditor.getVisNetworkDef();
  }

  private setNodeColor(node: VisNode, color: string) {
    this._graphEditor.editNode(node.id, n => {
      n.color = color;
      // hack to prevent xy coords resetting when physics is enabled
      n.x = n.y = undefined;
    });
  }
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
