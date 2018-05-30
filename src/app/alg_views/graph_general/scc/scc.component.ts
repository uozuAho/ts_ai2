import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { TarjanSCC } from '../../../../ai_lib/algorithms/graph/tarjan_scc';
import { VisNode, VisNetworkDef, VisEdge } from '../../../../libs/vis_wrappers/vis_network';
import { DiGraphT } from '../../../../ai_lib/structures/graphT';

@Component({
  selector: 'app-scc',
  templateUrl: './scc.component.html',
  styleUrls: ['./scc.component.css']
})
export class SccComponent {

  private instructions: string;
  private nextButtonText = 'Done';

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {}

  public updateScc() {
    const graph = this._graphEditor.getDiGraph();
    const interestingGraph = this.buildInterestingGraph(graph);
    // show only sccs
    this._graphEditor.setGraph(interestingGraph);
  }

  /** build a graph containing only the 'interesting' sccs */
  private buildInterestingGraph(graph: DiGraphT<VisNode>): VisNetworkDef {
    const nodes: VisNode[] = [];
    const edges: VisEdge[] = [];
    const oldNodes = graph.get_nodes();
    const scc = new TarjanSCC(graph);
    const interestingNodes = this.getInterestingNodes(graph, scc);
    for (const n of interestingNodes) {
      nodes.push(oldNodes[n]);
    }
    for (const e of graph.get_edges()) {
      if (interestingNodes.has(e.from) && interestingNodes.has(e.to)) {
        // edge connects 2 interesting nodes
        if (scc.id(e.from) === scc.id(e.to)) {
          // 2 interesting nodes are in the same scc
          const id_from = oldNodes[e.from].id;
          const id_to = oldNodes[e.to].id;
          edges.push(new VisEdge(id_from, id_to));
        }
      }
    }
    return new VisNetworkDef(nodes, edges);
  }

  /** Return the indexes of interesting nodes */
  private getInterestingNodes(graph: DiGraphT<VisNode>, scc: TarjanSCC): Set<number> {
    const sizes = this.getSccSizes(scc, graph.num_nodes());
    const nodes = graph.get_nodes();
    const interesting = new Set<number>();
    for (let i = 0; i < graph.num_nodes(); i++) {
      const adj = graph.adjacent(i).map(e => e.other(i));
      const scc_size = sizes[scc.id(i)];
      if (scc_size > 1 || adj.indexOf(i) !== -1) {
        // scc has more than 1 node, or scc has a self loop
        interesting.add(i);
      }
    }
    return interesting;
  }

  private getSccSizes(scc: TarjanSCC, num_nodes: number): number[] {
    const sizes = Array(scc.count()).fill(0);
    for (let i = 0; i < num_nodes; i++) {
      sizes[scc.id(i)]++;
    }
    return sizes;
  }

  private createRandomColours(n: number): string[] {
    const colours = [];
    for (let i = 0; i < n; i++) {
      colours.push(this.createRandomColour());
    }
    return colours;
  }

  private createRandomColour(): string {
    return `rgb(${this.random256()}, ${this.random256()}, ${this.random256()})`;
  }

  private random256(): number {
    return Math.floor(Math.random() * 256);
  }
}
