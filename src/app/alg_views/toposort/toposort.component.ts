import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode, VisNetworkDef } from '../../../libs/vis_wrappers/vis_network';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { CycleOrderer } from './cycle_orderer';
import { Node2d, Edge2d } from '../../shared/graph-svg/graph-svg.component';
import { Edge } from '../../../ai_lib/structures/igraph';

@Component({
  selector: 'app-toposort',
  templateUrl: './toposort.component.html',
  styleUrls: ['./toposort.component.css']
})
export class ToposortComponent implements AfterViewInit {

  private currentStepText: string;
  private backButtonText = 'Back';
  private nextButtonText = 'Done';

  private _currentState: AlgViewerState;
  private _originalGraph: DiGraphT<VisNode> = null;
  private _graphEditorBackup: VisNetworkDef = null;
  private _topoSort: TopoSort;

  public showSvgGraph = false;
  public svgnodes: Node2d[] = [new Node2d(100, 100)];
  public svgedges: Edge2d[];

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {
    this.reset();
  }

  ngAfterViewInit(): void {
    console.log('yo');
    console.log(this._graphEditor);
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
      this.showSvgGraph = false;
      if (this._graphEditorBackup !== null) {
        setTimeout(() => {
          // hack: wait a bit before setting graph, to make sure the graph element is loaded
          // todo: is there an event i can hook into instead???
          this._graphEditor.setGraph(this._graphEditorBackup);
        }, 100);
      }
    },
    input => {
      switch (input) {
        case StateInput.Next: {
          this._originalGraph = this._graphEditor.getDiGraph();
          this._graphEditorBackup = this._graphEditor.getVisNetworkDef();
          this._topoSort = new TopoSort(this._originalGraph);
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

      const order = Array.from(this._topoSort.order());
      this.showSvgGraph = true;
      this.setSvgGraph();
      let idx = 0;
      this.showTopoOrderState.data.timer = setInterval(() => {
        const prevIdx = idx;
        if (++idx === order.length) { idx = 0; }
        this.svgnodes[prevIdx].highlighted = false;
        this.svgnodes[idx].highlighted = true;
      }, 300);
    },
    input => {
      switch (input) {
        case StateInput.Back: {
          return this.createGraphState;
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
      this.showSvgGraph = true;
      this.setSvgGraph();
      let idx = 0;
      this.showTopoOrderState.data.timer = setInterval(() => {
        const prevIdx = idx;
        if (++idx === order.length) { idx = 0; }
        this.svgnodes[order[prevIdx]].highlighted = false;
        this.svgnodes[order[idx]].highlighted = true;
      }, 300);
    },
    input => {
      switch (input) {
        case StateInput.Back: {
          return this.createGraphState;
        }
        default: return this._currentState;
      }
    },
    () => clearInterval(this.showTopoOrderState.data.timer)
  );

    // update svg nodes and edges from the current graph editor
    private setSvgGraph() {
      const nodes = this._originalGraph.get_nodes();
      const nodeXs = nodes.map(n => n.x);
      const nodeYs = nodes.map(n => n.y);
      // scale and offset to fit svg viewbox bounds (0, 1000)
      const margin = 30;
      const xoffset = -Math.min(...nodeXs);
      const yoffset = -Math.min(...nodeYs);
      const xScale = (1000 - 2 * margin) / (Math.max(...nodeXs) - Math.min(...nodeXs));
      const yScale = (1000 - 2 * margin) / (Math.max(...nodeYs) - Math.min(...nodeYs));
      const toSvgX = x => xScale * (x + xoffset) + margin;
      const toSvgY = y => yScale * (y + yoffset) + margin;
      const toNode2d = (n: VisNode) => new Node2d(toSvgX(n.x), toSvgY(n.y));
      const toEdge2d = (e: Edge) => new Edge2d(toSvgX(nodes[e.from].x), toSvgX(nodes[e.to].x),
        toSvgY(nodes[e.from].y), toSvgY(nodes[e.to].y));
      this.svgnodes = nodes.map(n => toNode2d(n));
      this.svgedges = this._originalGraph.get_edges().map(e => toEdge2d(e));
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
    public data: any = {}) {
  }
}
