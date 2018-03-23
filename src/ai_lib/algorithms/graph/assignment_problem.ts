import { DiGraph } from '../../structures/graph';
import { DijkstraSP } from './dijkstra_sp';
import { Assert } from '../../../libs/assert/Assert';

/**
 *  The {@code AssignmentProblem} class represents a data type for computing
 *  an optimal solution to an <em>n</em>-by-<em>n</em> <em>assignment problem</em>.
 *  The assignment problem is to find a minimum weight matching in an
 *  edge-weighted complete bipartite graph.
 *  <p>
 *  The data type supplies methods for determining the optimal solution
 *  and the corresponding dual solution.
 *  <p>
 *  This implementation uses the <em>successive shortest paths algorithm</em>.
 *  The order of growth of the running time in the worst case is
 *  O(<em>n</em>^3 log <em>n</em>) to solve an <em>n</em>-by-<em>n</em>
 *  instance.
 *  <p>
 *  For additional documentation, see
 *  <a href="https://algs4.cs.princeton.edu/65reductions">Section 6.5</a>
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

const FLOATING_POINT_EPSILON = 1E-14;
const UNMATCHED = -1;

/**
 * Solve an n-by-n assignment problem in n^3 log n time using the
 * successive shortest path algorithm.
 */
export class AssignmentProblem {

    /** number of rows and columns */
    private n = 0;
    /** the n-by-n cost matrix */
    private _weight: number[][];
    /** minimum value of any weight */
    private minWeight = 0;
    /** px[i] = dual variable for row i */
    private px: number[];
    /** py[j] = dual variable for col j */
    private py: number[];
    /** xy[i] = j means i-j is a match */
    private xy: number[];
    /** yx[j] = i means i-j is a match */
    private yx: number[];

    /**
     * Determines an optimal solution to the assignment problem.
     *
     * @param  weight the NxN matrix of weights
     * @throws IllegalArgumentException unless all weights are nonnegative
     * @throws IllegalArgumentException if {@code weight} is {@code null}
     */
    public constructor(weight: number[][]) {
        this.n = weight.length;
        this._weight = [];
        for (let i = 0; i < this.n; i++) {
            this._weight[i] = [];
            for (let j = 0; j < this.n; j++) {
                if (Number.isNaN(weight[i][j])) {
                    throw new Error(`weight ${i}-${j} is NaN`);
                }
                if (weight[i][j] < this.minWeight) { this.minWeight = weight[i][j]; }
                this._weight[i][j] = weight[i][j];
            }
        }

        // dual variables
        this.px = Array(this.n).fill(0);
        this.py = Array(this.n).fill(0);

        // initial matching is empty
        this.xy = Array(this.n).fill(UNMATCHED);
        this.yx = Array(this.n).fill(UNMATCHED);

        // add n edges to matching
        for (let k = 0; k < this.n; k++) {
            this.throwIfDualNotFeasible();
            this.throwIfNotComplementarySlack();
            this.augment();
        }
        this.throwIfInvalid();
    }

    // find shortest augmenting path and update
    private augment() {

        // build residual graph
        const G = new DiGraph(2 * this.n + 2);
        const s = 2 * this.n, t = 2 * this.n + 1;
        for (let i = 0; i < this.n; i++) {
            if (this.xy[i] === UNMATCHED) {
                G.add_edge(s, i, 0.0);
            }
        }
        for (let j = 0; j < this.n; j++) {
            if (this.yx[j] === UNMATCHED) {
                G.add_edge(this.n + j, t, this.py[j]);
            }
        }
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (this.xy[i] === j) {
                    G.add_edge(this.n + j, i, 0.0);
                } else {
                    G.add_edge(i, this.n + j, this.reducedCost(i, j));
                }
            }
        }

        // compute shortest path from s to every other vertex
        const spt = new DijkstraSP(G, s);

        // augment along alternating path
        for (const e of spt.pathTo(t)) {
            const i = e.from, j = e.to - this.n;
            if (i < this.n) {
                this.xy[i] = j;
                this.yx[j] = i;
            }
        }

        // update dual variables
        for (let i = 0; i < this.n; i++) {
            this.px[i] += spt.distTo(i);
        }
        for (let j = 0; j < this.n; j++) {
            this.py[j] += spt.distTo(this.n + j);
        }
    }

    // reduced cost of i-j
    // (subtracting off minWeight reweights all weights to be non-negative)
    private reducedCost(i: number, j: number): number {
        const reducedCost = (this._weight[i][j] - this.minWeight) + this.px[i] - this.py[j];

        // to avoid issues with floating-point precision
        const magnitude = Math.abs(this._weight[i][j]) + Math.abs(this.px[i]) + Math.abs(this.py[j]);
        if (Math.abs(reducedCost) <= FLOATING_POINT_EPSILON * magnitude) { return 0.0; }

        Assert.isTrue(reducedCost >= 0.0, 'reduced cost must be > 0');
        return reducedCost;
    }

    /**
     * Returns the dual optimal value for the specified row.
     *
     * @param  i the row index
     * @return the dual optimal value for row {@code i}
     * @throws IllegalArgumentException unless {@code 0 <= i < n}
     *
     */
    // dual variable for row i
    public dualRow(i: number): number {
        this.validate(i);
        return this.px[i];
    }

    /**
     * Returns the dual optimal value for the specified column.
     *
     * @param  j the column index
     * @return the dual optimal value for column {@code j}
     * @throws IllegalArgumentException unless {@code 0 <= j < n}
     *
     */
    public dualCol(j: number): number {
        this.validate(j);
        return this.py[j];
    }

    /**
     * Returns the column associated with the specified row in the optimal solution.
     *
     * @param  i the row index
     * @return the column matched to row {@code i} in the optimal solution
     * @throws IllegalArgumentException unless {@code 0 <= i < n}
     *
     */
    public sol(i: number): number {
        this.validate(i);
        return this.xy[i];
    }

    /**
     * Returns the total weight of the optimal solution
     *
     * @return the total weight of the optimal solution
     *
     */
    public weight(): number {
        let total = 0.0;
        for (let i = 0; i < this.n; i++) {
            if (this.xy[i] !== UNMATCHED) {
                total += this._weight[i][this.xy[i]];
            }
        }
        return total;
    }

    private validate(i: number) {
        if (i < 0 || i >= this.n) {
            throw new Error(`index is not between 0 and ${this.n - 1}: ${i}`);
        }
    }


    /**************************************************************************
     *
     *  The code below is solely for testing correctness of the data type.
     *
     **************************************************************************/

    // check that dual variables are feasible
    private throwIfDualNotFeasible() {
        // check that all edges have >= 0 reduced cost
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (this.reducedCost(i, j) < 0) {
                    throw new Error('Dual variables are not feasible');
                }
            }
        }
    }

    // check that primal and dual variables are complementary slack
    private throwIfNotComplementarySlack() {
        // check that all matched edges have 0-reduced cost
        for (let i = 0; i < this.n; i++) {
            if ((this.xy[i] !== UNMATCHED) && (this.reducedCost(i, this.xy[i]) !== 0)) {
                throw new Error('Primal and dual variables are not complementary slack');
            }
        }
    }

    // check that primal variables are a perfect matching
    private throwIfNotPerfectMatching() {
        // check that xy[] is a perfect matching
        const perm = Array(this.n).fill(false);
        for (let i = 0; i < this.n; i++) {
            if (perm[this.xy[i]]) {
                throw new Error('Not a perfect matching');
            }
            perm[this.xy[i]] = true;
        }

        // check that this.xy[] and yx[] are inverses
        for (let j = 0; j < this.n; j++) {
            if (this.xy[this.yx[j]] !== j) {
                throw new Error('xy[] and yx[] are not inverses');
            }
        }
        for (let i = 0; i < this.n; i++) {
            if (this.yx[this.xy[i]] !== i) {
                throw new Error('xy[] and yx[] are not inverses');
            }
        }
    }

    // check optimality conditions
    private throwIfInvalid() {
        this.throwIfNotPerfectMatching();
        this.throwIfDualNotFeasible();
        this.throwIfNotComplementarySlack();
    }
}
