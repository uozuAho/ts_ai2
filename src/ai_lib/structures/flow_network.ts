import { IGraph, Edge } from './igraph';

/*
 *  see <a href="https://algs4.cs.princeton.edu/64maxflow">Section 6.4</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */
export class FlowNetwork implements IGraph {

    private readonly _num_vertices: number;
    private _num_edges: number;
    /** Adjacency list for each vertex */
    private _adj: FlowEdge[][];

    /**
     * Initializes an empty flow network with {@code V} vertices and 0 edges.
     * @param num_vertices the number of vertices
     * @throws Error if {@code V < 0}
     */
    constructor (num_vertices: number) {
        if (num_vertices < 0) { throw new Error('Number of vertices in a Graph must be nonnegative'); }
        this._num_vertices = num_vertices;
        this._num_edges = 0;
        this._adj = [];
        for (let v = 0; v < num_vertices; v++) {
            this._adj[v] = [];
        }
    }

    public num_nodes(): number {
        return this._num_vertices;
    }

    /**
     * Returns the number of edges in the edge-weighted graph.
     * @return the number of edges in the edge-weighted graph
     */
    public num_edges(): number {
        return this._num_edges;
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number): void {
        if (v < 0 || v >= this._num_vertices) {
            throw new Error('vertex ' + v + ' is not between 0 and ' + (this._num_vertices - 1));
        }
    }

    /**
     * Add a flow edge to the network.
     */
    public add_flow_edge(e: FlowEdge): void {
        const v = e.from();
        const w = e.to();
        this.validateVertex(v);
        this.validateVertex(w);
        this._adj[v].push(e);
        this._adj[w].push(e);
        this._num_edges++;
    }

    /** Adds a flow edge to the network via the IGraph interface.
     *  Use add_flow_edge for better control over flow edges.
     */
    public add_edge(p: number, q: number, weight: number): void {
        this.add_flow_edge(new FlowEdge(p, q, weight));
    }

    /**
     * Returns the edges incident on vertex v (includes both edges pointing to
     * and from v).
     * @param v the vertex
     * @return the edges incident on vertex v as an Iterable
     * @throws unless 0 <= v < V
     */
    public incident(v: number): FlowEdge[] {
        this.validateVertex(v);
        return this._adj[v];
    }

    /** return list of all edges - excludes self loops */
    public edges(): FlowEdge[] {
        const list: FlowEdge[] = [];
        for (let v = 0; v < this._num_vertices; v++) {
            for (const e of this._adj[v]) {
                if (e.to() !== v) {
                    list.push(e);
                }
            }
        }
        return list;
    }

    /** Get IGraph-style edges. Edge weights are network edge flows. */
    public get_edges(): Edge[] {
        return this.edges().map(e => new Edge(e.from(), e.to(), e.flow()));
    }

    /** Get IGraph-style adjacent edges. Edge weights are network edge flows. */
    public adjacent(n: number): Edge[] {
        return this._adj[n].map(e => new Edge(e.from(), e.to(), e.flow()));
    }

    public degree(n: number): number {
        return this._adj[n].length;
    }
}

export class FlowEdge {
    // to deal with floating-point roundoff errors
    private static readonly FLOATING_POINT_EPSILON = 1E-10;

    private readonly _from: number;             // from
    private readonly _to: number;             // to
    private readonly _capacity: number;   // capacity
    private _flow: number;             // flow

    /**
     * Initializes an edge from vertex v to vertex w with
     * the given capacity and zero flow.
     * @throws Error if either from or to is a negative integer
     * @throws Error if capacity < 0.0
     */
    constructor(from: number, to: number, capacity: number, flow: number = 0) {
        if (from < 0) { throw new Error('vertex index must be a non-negative integer'); }
        if (to < 0) { throw new Error('vertex index must be a non-negative integer'); }
        if (!(capacity >= 0.0)) { throw new Error('Edge capacity must be non-negative'); }
        this._from         = from;
        this._to         = to;
        this._capacity  = capacity;
        this._flow      = flow;
    }

    /**
     * Initializes a flow edge from another flow edge.
     * @param e the edge to copy
     */
    public clone(e: FlowEdge): FlowEdge {
        return new FlowEdge(this._from, this._to, this._capacity, this._flow);
    }

    /**
     * Returns the tail vertex of the edge.
     * @return the tail vertex of the edge
     */
    public from(): number {
        return this._from;
    }

    /**
     * Returns the head vertex of the edge.
     * @return the head vertex of the edge
     */
    public to(): number {
        return this._to;
    }

    /**
     * Returns the capacity of the edge.
     * @return the capacity of the edge
     */
    public capacity(): number {
        return this._capacity;
    }

    /**
     * Returns the flow on the edge.
     * @return the flow on the edge
     */
    public flow(): number {
        return this._flow;
    }

    /**
     * Returns the endpoint of the edge that is different from the given vertex
     * (unless the edge represents a self-loop in which case it returns the same vertex).
     * @param vertex one endpoint of the edge
     * @return the endpoint of the edge that is different from the given vertex
     *   (unless the edge represents a self-loop in which case it returns the same vertex)
     * @throws IllegalArgumentException if {@code vertex} is not one of the endpoints
     *   of the edge
     */
    public other(vertex: number): number {
        if (vertex === this._from) {
            return this._to;
        } else if (vertex === this._to) {
            return this._from;
        } else { throw new Error('invalid endpoint'); }
    }

    /**
     * Returns the residual capacity of the edge in the direction
     * to the given vertex.
     * @param vertex one endpoint of the edge
     * @return The residual capacity of the edge in the direction to the given vertex.
     *         If vertex is the tail vertex, the residual capacity equals
     *         capacity() - flow(); if vertex is the head vertex, the
     *         residual capacity equals flow().
     * @throws Error if vertex is not one of the endpoints of the edge
     */
    public residual_capacity_to(vertex: number): number {
        if (vertex === this._from) {
            return this._flow;
        } else if (vertex === this._to) {
            return this._capacity - this._flow;
        } else { throw new Error('invalid endpoint'); }
    }

    /**
     * Increases the flow on the edge in the direction to the given vertex.
     *   If vertex is the tail vertex, this increases the flow on the edge by delta;
     *   if vertex is the head vertex, this decreases the flow on the edge by delta.
     * @param vertex one endpoint of the edge
     * @param delta amount by which to increase flow
     * @throws Error if vertex is not one of the endpoints
     *   of the edge
     * @throws Error if delta makes the flow on
     *   on the edge either negative or larger than its capacity
     * @throws Error if delta is NaN
     */
    public add_residual_flow_to(vertex: number, delta: number): void {
        if (!(delta >= 0.0)) { throw new Error('Delta must be nonnegative'); }

        if (vertex === this._from) {
            this._flow -= delta;
         } else if (vertex === this._to) {
             this._flow += delta;
        } else { throw new Error('invalid endpoint'); }

        // round flow to 0 or capacity if within floating-point precision
        if (Math.abs(this._flow) <= FlowEdge.FLOATING_POINT_EPSILON) {
            this._flow = 0;
        }
        if (Math.abs(this._flow - this._capacity) <= FlowEdge.FLOATING_POINT_EPSILON) {
            this._flow = this._capacity;
        }

        if (!(this._flow >= 0.0)) {      throw new Error('Flow is negative'); }
        if (!(this._flow <= this._capacity)) { throw new Error('Flow exceeds capacity'); }
    }

    /**
     * Returns a string representation of the edge.
     * @return a string representation of the edge
     */
    public toString(): string {
        return this._from + '->' + this._to + ' ' + this._flow + '/' + this._capacity;
    }
}
