import { Component } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { Edge } from '../../../ai_lib/structures/igraph';

@Component({
  selector: 'app-toposort2',
  templateUrl: './toposort2.component.html',
  styleUrls: []
})
export class Toposort2Component {

    public nodes: Node2d[];
    public edges: Edge2d[];
    private _graph: DiGraphT<Node2d>;

    constructor() {
        this._graph = new DiGraphT<Node2d>();
        for (let i = 0; i < 20; i++) {
            this._graph.add_node(this.randomNode());
        }
        for (let i = 0; i < 40; i++) {
            const from = Math.floor(Math.random() * 20);
            const to = Math.floor(Math.random() * 20);
            this._graph.add_edge(from, to);
        }
        this.nodes = this._graph.get_nodes();
        this.edges = this._graph.get_edges().map(e => this.edge22d(e));
    }

    private randomNode(): Node2d {
        return new Node2d(Math.random() * 500, Math.random() * 500);
    }

    private edge22d(e: Edge): Edge2d {
        const from = this.nodes[e.from];
        const to = this.nodes[e.to];
        return new Edge2d(from.x, to.x, from.y, to.y);
    }
}

class Node2d {
    constructor(
        public x: number,
        public y: number
    ) {}
}

class Edge2d {
    constructor (
        public fromX: number,
        public toX: number,
        public fromY: number,
        public toY: number
     ) {}
}
