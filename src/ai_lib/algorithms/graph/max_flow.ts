import { FlowEdge, FlowNetwork } from '../../structures/flow_network';
import { FifoQueue } from '../../structures/fifo_queue';

/*
 *  FordFulkerson implementation for finding max flow in a flow network.
 *  see <a href="https://algs4.cs.princeton.edu/64maxflow">Section 6.4</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */
export class MaxFlow {
    private static readonly FLOATING_POINT_EPSILON = 1E-11;

    private readonly _num_vertices: number;

    /** marked[v] = true iff s->v path in residual graph */
    private _marked: boolean[];

    /** edgeTo[v] = last edge on shortest residual s->v path */
    private _edgeTo: FlowEdge[];

    /** current value of max flow */
    private _value: number;

    /** edges in the max flow */
    private _edges: Set<FlowEdge>;

    /**
     * Compute a maximum flow and minimum cut in the network G
     * from vertex s to vertex t.
     *
     * @param  network the flow network
     * @param  source the source vertex
     * @param  sink the sink vertex
     * @throws Error unless 0 <= s < V
     * @throws Error unless 0 <= t < V
     * @throws Error if s == t
     * @throws Error if initial flow is infeasible
     */
    public constructor(network: FlowNetwork, source: number, sink: number) {
        this._num_vertices = network.num_nodes();
        this.throwIfOutOfRange(source);
        this.throwIfOutOfRange(sink);
        if (source === sink) {
            throw new Error('Source equals sink');
        }
        this._value = this.excess(network, sink);
        try {
            this.throwIfFlowInvalid(network, source, sink);
        } catch (error) {
            throw new Error('Initial flow is infeasible: ' + error);
        }

        this._edges = new Set<FlowEdge>();

        // while there exists an augmenting path, use it
        while (this.has_augmenting_path(network, source, sink)) {

            // compute bottleneck capacity
            let bottle = Number.MAX_VALUE;
            for (let v = sink; v !== source; v = this._edgeTo[v].other(v)) {
                bottle = Math.min(bottle, this._edgeTo[v].residual_capacity_to(v));
                // add to max flow edges
                this._edges.add(this._edgeTo[v]);
            }

            // augment flow
            for (let v = sink; v !== source; v = this._edgeTo[v].other(v)) {
                this._edgeTo[v].add_residual_flow_to(v, bottle);
            }

            this._value += bottle;
        }

        this.validateSelf(network, source, sink);
    }

    /**
     * Returns the value of the maximum flow.
     */
    public value(): number {
        return this._value;
    }

    /**
     * Returns true if the specified vertex is on the source side of the mincut.
     *
     * @param  v vertex
     * @return true if vertex v is on the s side of the micut; false otherwise
     * @throws Error unless 0 <= v < V
     */
    public is_in_cut(v: number): boolean {
        this.throwIfOutOfRange(v);
        if (!this._marked[v]) { return false; }
        return this._marked[v];
    }

    /** Return the edges in the max flow */
    public edges(): Set<FlowEdge> {
        return this._edges;
    }

    private throwIfOutOfRange(v: number): void {
        if (v < 0 || v >= this._num_vertices) {
            throw new Error('vertex ' + v + ' is not between 0 and ' + (this._num_vertices - 1));
        }
    }

    /** Is there an augmenting path?
     *  If so, upon termination edgeTo[] will contain a parent-link representation of such a path.
     *  This implementation finds a shortest augmenting path (fewest number of edges),
     *  which performs well both in theory and in practice
     */
    private has_augmenting_path(network: FlowNetwork, s: number, t: number): boolean {
        this._edgeTo = [];
        this._marked = [];

        // breadth-first search
        const frontier = new FifoQueue<number>();
        frontier.push(s);
        this._marked[s] = true;
        while (!frontier.isEmpty() && !this._marked[t]) {
            const v = frontier.pop();

            for (const edge of network.incident(v)) {
                const adj = edge.other(v);

                // if residual capacity to adjacent vertex
                if (edge.residual_capacity_to(adj) > 0) {
                    if (!this._marked[adj]) {
                        this._edgeTo[adj] = edge;
                        this._marked[adj] = true;
                        frontier.push(adj);
                    }
                }
            }
        }

        // is there an augmenting path?
        return this._marked[t];
    }

    /** return excess flow at vertex v (excess = flow in - flow out) */
    private excess(network: FlowNetwork, v: number): number {
        let excess = 0.0;
        for (const edge of network.incident(v)) {
            if (v === edge.from()) { excess -= edge.flow(); }
            else { excess += edge.flow(); }
        }
        return excess;
    }

    private throwIfFlowInvalid(network: FlowNetwork, source: number, sink: number) {
        // check that capacity constraints are satisfied
        for (let v = 0; v < network.num_nodes(); v++) {
            for (const e of network.incident(v)) {
                if (e.flow() < -MaxFlow.FLOATING_POINT_EPSILON || e.flow() > e.capacity() + MaxFlow.FLOATING_POINT_EPSILON) {
                    throw new Error(`invalid flow ${e.flow()} for edge (${e.from()},${e.to()})`);
                }
            }
        }

        // check that net flow into a vertex equals zero, except at source and sink
        if (Math.abs(this._value + this.excess(network, source)) > MaxFlow.FLOATING_POINT_EPSILON) {
            throw new Error('flow at source != network flow');
        }
        if (Math.abs(this._value - this.excess(network, sink)) > MaxFlow.FLOATING_POINT_EPSILON) {
            throw new Error('flow at sink != network flow');
        }
        for (let v = 0; v < network.num_nodes(); v++) {
            if (v === source || v === sink) { continue; }
            else if (Math.abs(this.excess(network, v)) > MaxFlow.FLOATING_POINT_EPSILON) {
                throw new Error(`flow in - out != 0 at node ${v}`);
            }
        }
    }

    // check validity conditions, throw errors
    private validateSelf(network: FlowNetwork, source: number, sink: number) {
        this.throwIfFlowInvalid(network, source, sink);
        // check that s is on the source side of min cut and that t is not on source side
        if (!this.is_in_cut(source)) {
            throw new Error('source not on source side of min cut');
        }
        if (this.is_in_cut(sink)) {
            throw new Error('sink not on sink side of min cut');
        }

        // check that value of min cut = value of max flow
        let mincutValue = 0.0;
        for (let v = 0; v < network.num_nodes(); v++) {
            for (const e of network.incident(v)) {
                if ((v === e.from()) && this.is_in_cut(e.from()) && !this.is_in_cut(e.to())) {
                    mincutValue += e.capacity();
                }
            }
        }

        if (Math.abs(mincutValue - this._value) > MaxFlow.FLOATING_POINT_EPSILON) {
            throw new Error('min cut != max flow');
        }
    }
}
