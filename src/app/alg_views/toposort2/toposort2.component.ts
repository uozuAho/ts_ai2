import { Component } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { Edge } from '../../../ai_lib/structures/igraph';

const NUM_NODES = 500;

@Component({
  selector: 'app-toposort2',
  templateUrl: './toposort2.component.html',
  styleUrls: ['./toposort2.component.css']
})
export class Toposort2Component {

    public nodes: Node2d[];
    public edges: Edge2d[];
    private _graph: DiGraphT<Node2d>;
    private _idx = 0;

    constructor() {
        this._graph = new DiGraphT<Node2d>();
        for (let i = 0; i < NUM_NODES; i++) {
            this._graph.add_node(this.randomNode());
        }
        for (let i = 0; i < 40; i++) {
            const from = Math.floor(Math.random() * NUM_NODES);
            const to = Math.floor(Math.random() * NUM_NODES);
            this._graph.add_edge(from, to);
        }
        this.nodes = this._graph.get_nodes();
        this.edges = this._graph.get_edges().map(e => this.toEdge2d(e));

        const interval = setInterval(() => {
            this._idx++;
            const prev = this._idx === 0 ? this.nodes.length - 1 : this._idx - 1;
            if (this._idx === this.nodes.length) {
                this._idx = 0;
            }
            this.nodes[prev].highlighted = false;
            this.nodes[this._idx].highlighted = true;
        }, 50);
    }

    private randomNode(): Node2d {
        return new Node2d(Math.random() * 1000, Math.random() * 600);
    }

    private toEdge2d(e: Edge): Edge2d {
        const from = this.nodes[e.from];
        const to = this.nodes[e.to];
        return new Edge2d(from.x, to.x, from.y, to.y);
    }
}

class Node2d {
    constructor(
        public x: number,
        public y: number,
        public highlighted = false
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
