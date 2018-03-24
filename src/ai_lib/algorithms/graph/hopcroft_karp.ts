/**
 *  Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/HopcroftKarp.java.html
 *
 *  The {@code HopcroftKarp} class represents a data type for computing a
 *  <em>maximum (cardinality) matching</em> and a
 *  <em>minimum (cardinality) vertex cover</em> in a bipartite graph.
 *  A <em>bipartite graph</em> in a graph whose vertices can be partitioned
 *  into two disjoint sets such that every edge has one endpoint in either set.
 *  A <em>matching</em> in a graph is a subset of its edges with no common
 *  vertices. A <em>maximum matching</em> is a matching with the maximum number
 *  of edges.
 *  A <em>perfect matching</em> is a matching which matches all vertices in the graph.
 *  A <em>vertex cover</em> in a graph is a subset of its vertices such that
 *  every edge is incident to at least one vertex. A <em>minimum vertex cover</em>
 *  is a vertex cover with the minimum number of vertices.
 *  By Konig's theorem, in any biparite
 *  graph, the maximum number of edges in matching equals the minimum number
 *  of vertices in a vertex cover.
 *  The maximum matching problem in <em>nonbipartite</em> graphs is
 *  also important, but all known algorithms for this more general problem
 *  are substantially more complicated.
 *  <p>
 *  This implementation uses the <em>Hopcroft-Karp algorithm</em>.
 *  The order of growth of the running time in the worst case is
 *  (<em>E</em> + <em>V</em>) sqrt(<em>V</em>),
 *  where <em>E</em> is the number of edges and <em>V</em> is the number
 *  of vertices in the graph. It uses extra space (not including the graph)
 *  proportional to <em>V</em>.
 *  <p>
 *  See also {@link BipartiteMatching}, which solves the problem in
 *  O(<em>E V</em>) time using the <em>alternating path algorithm</em>
 *  and <a href = "https://algs4.cs.princeton.edu/65reductions/BipartiteMatchingToMaxflow.java.html">BipartiteMatchingToMaxflow</a>,
 *  which solves the problem in O(<em>E V</em>) time via a reduction
 *  to the maxflow problem.
 *  <p>
 *  For additional documentation, see
 *  <a href="https://algs4.cs.princeton.edu/65reductions">Section 6.5</a>
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

import { BipartiteX } from './bipartiteX';
import { IGraph } from '../../structures/igraph';
import { FifoQueue } from '../../structures/fifo_queue';

const UNMATCHED = -1;

/**
 *  Find a maximum cardinality matching (and minimum cardinality vertex cover)
 *  in a bipartite graph using Hopcroft-Karp algorithm.
 */
export class HopcroftKarp {

    private V = 0;                 // number of vertices in the graph
    private bipartition: BipartiteX;      // the bipartition
    private cardinality = 0;             // cardinality of current matching
    private _mate: number[];                  // mate[v] =  w if v-w is an edge in current matching
                                         //         = -1 if v is not in current matching
    private _inMinVertexCover: boolean[];  // inMinVertexCover[v] = true iff v is in min vertex cover
    private marked: boolean[];            // marked[v] = true iff v is reachable via alternating path
    private distTo: number[];                // distTo[v] = number of edges on shortest path to v

    /**
     * Determines a maximum matching (and a minimum vertex cover)
     * in a bipartite graph.
     *
     * @throws if graph is not bipartite
     */
    constructor(G: IGraph) {
        this.bipartition = new BipartiteX(G);
        if (!this.bipartition.isBipartite()) {
            throw new Error('graph is not bipartite');
        }

        // initialize empty matching
        this.V = G.num_nodes();
        this._mate = Array(this.V).fill(UNMATCHED);

        // the call to hasAugmentingPath() provides enough info to reconstruct level graph
        while (this.hasAugmentingPath(G)) {

            // to be able to iterate over each adjacency list, keeping track of which
            // vertex in each adjacency list needs to be explored next
            const adj: ArrayIterator<number>[] = [];
            for (let v = 0; v < this.V; v++) {
                adj[v] = new ArrayIterator(G.adjacent(v).map(e => e.other(v)));
            }

            // for each unmatched vertex s on one side of bipartition
            for (let s = 0; s < this.V; s++) {
                if (this.isMatched(s) || !this.bipartition.color(s)) { continue; }

                // find augmenting path from s using nonrecursive DFS
                const path: number[] = [];
                path.push(s);
                while (path.length > 0) {
                    const v = path[path.length - 1];

                    // retreat, no more edges in level graph leaving v
                    if (!adj[v].hasNext()) {
                        path.pop();
                    }

                    // advance
                    else {
                        // process edge v-w only if it is an edge in level graph
                        const w = adj[v].next();
                        if (!this.isLevelGraphEdge(v, w)) { continue; }

                        // add w to augmenting path
                        path.push(w);

                        // augmenting path found: update the matching
                        if (!this.isMatched(w)) {
                            while (path.length > 0) {
                                const x = path.pop();
                                const y = path.pop();
                                this._mate[x] = y;
                                this._mate[y] = x;
                            }
                            this.cardinality++;
                        }
                    }
                }
            }
        }

        // also find a min vertex cover
        this._inMinVertexCover = Array(this.V).fill(false);
        for (let v = 0; v < this.V; v++) {
            if (this.bipartition.color(v) && !this.marked[v]) { this._inMinVertexCover[v] = true; }
            if (!this.bipartition.color(v) && this.marked[v]) { this._inMinVertexCover[v] = true; }
        }

        this.certifySolution(G);
    }

   // is the edge v-w in the level graph?
    private isLevelGraphEdge(v: number, w: number): boolean {
        return (this.distTo[w] === this.distTo[v] + 1) && this.isResidualGraphEdge(v, w);
    }

   // is the edge v-w a forward edge not in the matching or a reverse edge in the matching?
    private isResidualGraphEdge(v: number, w: number): boolean {
        if ((this.mate[v] !== w) &&  this.bipartition.color(v)) { return true; }
        if ((this.mate[v] === w) && !this.bipartition.color(v)) { return true; }
        return false;
    }

    /*
     * is there an augmenting path?
     *   - if so, upon termination adj[] contains the level graph;
     *   - if not, upon termination marked[] specifies those vertices reachable via an alternating
     *     path from one side of the bipartition
     *
     * an alternating path is a path whose edges belong alternately to the matching and not
     * to the matching
     *
     * an augmenting path is an alternating path that starts and ends at unmatched vertices
     */
    private hasAugmentingPath(G: IGraph): boolean {

        // shortest path distances
        this.marked = Array(this.V).fill(false);
        this.distTo = Array(this.V).fill(Number.MAX_VALUE);

        // breadth-first search (starting from all unmatched vertices on one side of bipartition)
        const queue = new FifoQueue<number>();
        for (let v = 0; v < this.V; v++) {
            if (this.bipartition.color(v) && !this.isMatched(v)) {
                queue.push(v);
                this.marked[v] = true;
                this.distTo[v] = 0;
            }
        }

        // run BFS until an augmenting path is found
        // (and keep going until all vertices at that distance are explored)
        let hasAugmentingPath = false;
        while (!queue.isEmpty()) {
            const v = queue.pop();
            for (const w of G.adjacent(v).map(e => e.other(v))) {

                // forward edge not in matching or backwards edge in matching
                if (this.isResidualGraphEdge(v, w)) {
                    if (!this.marked[w]) {
                        this.distTo[w] = this.distTo[v] + 1;
                        this.marked[w] = true;
                        if (!this.isMatched(w)) {
                            hasAugmentingPath = true;
                        }

                        // stop enqueuing vertices once an alternating path has been discovered
                        // (no vertex on same side will be marked if its shortest path distance longer)
                        if (!hasAugmentingPath) {
                            queue.push(w);
                        }
                    }
                }
            }
        }

        return hasAugmentingPath;
    }

    /**
     * Returns the vertex to which the specified vertex is matched in
     * the maximum matching computed by the algorithm.
     *
     * @param  v the vertex
     * @return the vertex to which vertex {@code v} is matched in the
     *         maximum matching; {@code -1} if the vertex is not matched
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     *
     */
    public mate(v: number): number {
        this.validate(v);
        return this._mate[v];
    }

    /**
     * Returns true if the specified vertex is matched in the maximum matching
     * computed by the algorithm.
     *
     * @param  v the vertex
     * @return {@code true} if vertex {@code v} is matched in maximum matching;
     *         {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     *
     */
    public isMatched(v: number): boolean {
        this.validate(v);
        return this._mate[v] !== UNMATCHED;
    }

    /**
     * Returns the number of edges in any maximum matching.
     *
     * @return the number of edges in any maximum matching
     */
    public size(): number {
        return this.cardinality;
    }

    /**
     * Returns true if the graph contains a perfect matching.
     * That is, the number of edges in a maximum matching is equal to one half
     * of the number of vertices in the graph (so that every vertex is matched).
     *
     * @return {@code true} if the graph contains a perfect matching;
     *         {@code false} otherwise
     */
    public isPerfect(): boolean {
        return this.cardinality * 2 === this.V;
    }

    /**
     * Returns true if the specified vertex is in the minimum vertex cover
     * computed by the algorithm.
     *
     * @param  v the vertex
     * @return {@code true} if vertex {@code v} is in the minimum vertex cover;
     *         {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public inMinVertexCover(v: number): boolean {
        this.validate(v);
        return this._inMinVertexCover[v];
    }

    /**
     * Returns a minimum vertex cover
     */
    public minVertexCover(): number[] {
        const vertices: number[] = [];
        for (let i = 0; i < this.V; i++) {
            if (this.inMinVertexCover(i)) {
                vertices.push(i);
            }
        }
        return vertices;
    }

    // throw an exception if vertex is invalid
    private validate(v: number) {
        if (v < 0 || v >= this.V) {
            throw new Error(`vertex ${v} is not between 0 and ${(this.V - 1)}`);
        }
    }

    /**************************************************************************
     *
     *  The code below is solely for testing correctness of the data type.
     *
     **************************************************************************/

    // check that mate[] and inVertexCover[] define a max matching and min vertex cover, respectively
    private certifySolution(G: IGraph): boolean {

        // check that mate(v) = w iff mate(w) = v
        for (let v = 0; v < this.V; v++) {
            if (this.mate(v) === -1) { continue; }
            if (this.mate(this.mate(v)) !== v) { return false; }
        }

        // check that size() is consistent with mate()
        let matchedVertices = 0;
        for (let v = 0; v < this.V; v++) {
            if (this.mate(v) !== -1) { matchedVertices++; }
        }
        if (2 * this.size() !== matchedVertices) { return false; }

        // check that size() is consistent with minVertexCover()
        let sizeOfMinVertexCover = 0;
        for (let v = 0; v < this.V; v++) {
            if (this.inMinVertexCover(v)) {
                sizeOfMinVertexCover++;
            }
        }
        if (this.size() !== sizeOfMinVertexCover) {
            return false;
        }

        // check that mate() uses each vertex at most once
        const isMatched = Array(this.V).fill(false);
        for (let v = 0; v < this.V; v++) {
            const w = this._mate[v];
            if (w === -1) { continue; }
            if (v === w)  { return false; }
            if (v >= w)   { continue; }
            if (this.isMatched[v] || this.isMatched[w]) {
                return false;
            }
            isMatched[v] = true;
            isMatched[w] = true;
        }

        // check that mate() uses only edges that appear in the graph
        for (let v = 0; v < this.V; v++) {
            if (this.mate(v) === -1) { continue; }
            let isEdge = false;
            for (const w of G.adjacent(v).map(e => e.other(v))) {
                if (this.mate(v) === w) {
                    isEdge = true;
                }
            }
            if (!isEdge) {
                return false;
            }
        }

        // check that inMinVertexCover() is a vertex cover
        for (let v = 0; v < this.V; v++) {
            for (const w of G.adjacent(v).map(e => e.other(v))) {
                if (!this.inMinVertexCover(v) && !this.inMinVertexCover(w)) {
                    return false;
                }
            }
        }

        return true;
    }
}

/** Not quite a javascript iterator, just what I want. */
class ArrayIterator<T> {

    private _idx: number;

    /** Assumes array has items indexed 0 - n, with no gaps */
    constructor(private _arr: T[]) {
        this._idx = 0;
    }

    public hasNext(): boolean {
        return this._idx < this._arr.length;
    }

    public peek(): T {
        return this._arr[this._idx];
    }

    public next(): T {
        if (this._idx === this._arr.length) {
            throw new Error('iterator finished');
        }
        return this._arr[this._idx++];
    }
}
