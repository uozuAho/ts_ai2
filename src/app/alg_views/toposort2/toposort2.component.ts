import { Component } from '@angular/core';
import { DiGraphT } from '../../../ai_lib/structures/graphT';

@Component({
  selector: 'app-toposort2',
  templateUrl: './toposort2.component.html',
  styleUrls: []
})
export class Toposort2Component {

    public nodes: Node2d[];
    private _graph: DiGraphT<Node2d>;

    constructor() {
        this._graph = new DiGraphT<Node2d>();
        this._graph.add_node(new Node2d(50, 50));
        this._graph.add_node(new Node2d(100, 100));
        this._graph.add_edge(0, 1);
        this.nodes = this._graph.get_nodes();
    }
}

class Node2d {
    constructor(
        public x: number,
        public y: number
    ) {}
}
