import { Point2d } from './point2d';
import { IGraph, Edge } from './igraph';
import { Graph, DiGraph } from './graph';

/** Weighted graph of nodes of type T */
class GraphBase<T> {

    /** internal graph representation */
    protected _graph: IGraph;

    private readonly _nodes: T[] = [];

    public num_nodes(): number {
        return this._graph.num_nodes();
    }

    public get_edges(): Edge[] {
        return this._graph.get_edges();
    }

    public get_edgesT(): EdgeT<T>[] {
        const edges = this._graph.get_edges();
        return edges.map(e => new EdgeT(this._nodes[e.from], this._nodes[e.to], e.weight));
    }

    public add_node(node: T): T {
        if (this.contains(node)) {
            throw new Error('graph already contains node ' + node);
        }
        this._nodes.push(node);
        return node;
    }

    public add_edge(p: number, q: number, weight: number = 1): void {
        this._graph.add_edge(p, q, weight);
    }

    public add_edgeT(nodeFrom: T, nodeTo: T, cost: number = 1) {
        const idx_from = this._get_idx(nodeFrom);
        const idx_to = this._get_idx(nodeTo);
        this.add_edge(idx_from, idx_to, cost);
    }

    public adjacent(n: number): Edge[] {
        return this._graph.adjacent(n);
    }

    public adjacentT(node: T): EdgeT<T>[] {
        const idx = this._get_idx(node);
        const adj = this.adjacent(idx);
        return adj.map(a => new EdgeT(this._nodes[a.from], this._nodes[a.to], a.weight));
    }

    public degree(n: number): number {
        return this._graph.degree(n);
    }

    public get_nodes(): T[] {
        return this._nodes;
    }

    public contains(node: T) {
        return this._get_idx(node) >= 0;
    }

    /** Returns the cost of the lowest-cost edge between the given nodes
     * @throws if no edge exists between the nodes
     */
    public edge_cost(nodeFrom: T, nodeTo: T) {
        const idx_from = this._get_idx(nodeFrom);
        const idx_to = this._get_idx(nodeTo);
        const edges = this._get_edges_from_to(idx_from, idx_to);
        if (edges.length === 0) {
            throw new Error('no edge between nodes');
        }
        return Math.min(...edges.map(e => e.weight));
    }

    private _get_idx(node: T) {
        return this._nodes.indexOf(node);
    }

    private _get_edges_from_to(p: number, q: number): Edge[] {
        const adj = this._graph.adjacent(p);
        return adj.filter(e => e.to === q);
    }
}

/** Undirected weighted graph which stores typed nodes internally */
export class GraphT<T> extends GraphBase<T> implements IGraph {

    private _graph_impl: Graph;

    constructor() {
        super();
        this._graph_impl = new Graph();
        this._graph = this._graph_impl;
    }

    public add_node(node: T): T {
        this._graph_impl.set_num_nodes(this._graph.num_nodes() + 1);
        return super.add_node(node);
    }
}

/** Weighted digraph which stores typed nodes internally */
export class DiGraphT<T> extends GraphBase<T> implements IGraph {

    private _graph_impl: DiGraph;

    constructor() {
        super();
        this._graph_impl = new DiGraph();
        this._graph = this._graph_impl;
    }

    public add_node(node: T): T {
        this._graph_impl.set_num_nodes(this._graph.num_nodes() + 1);
        return super.add_node(node);
    }
}

/** Edge with typed nodes */
export class EdgeT<T> {
    public from: T;
    public to: T;
    public cost: number;
    constructor(from: T, to: T, cost: number) {
        this.from = from;
        this.to = to;
        this.cost = cost;
    }
}

/** Creates an undirected randomly weighted graph with nodes randomly distributed within the 2d
 *  square of given height and width. Edges are created between nodes within a certain distance
 *  of each other
 */
export function randomSquareGraph(height: number, width: number, totalNodes: number): GraphT<Point2d> {
    const graph = new GraphT<Point2d>();
    for (let i = 0; i < totalNodes; i++) {
        graph.add_node(new Point2d(Math.random() * width, Math.random() * height));
    }
    const minDistance2 = 1.6 * height * width / totalNodes;

    const nodes = graph.get_nodes();

    // add edges between nodes that are close enough
    for (let i = 0; i < totalNodes; i++) {
        for (let j = i + 1; j < totalNodes; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            if (Point2d.distanceSquared(node1, node2) < minDistance2) {
                graph.add_edge(i, j, 0.5 + Math.random() * 9.5);
            }
        }
    }
    return graph;
}
