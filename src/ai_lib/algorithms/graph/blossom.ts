import * as ebloss from 'edmonds-blossom';

/** Edmond's blossom algorithm for finding the max weight matching
 *  of an edge-weighted, undirected graph. This is a typed wrapper around
 *  the edmonds-blossom npm package.
 */
export class Blossom {

    public static readonly NO_MATCH = -1;

    private _result: number[];

    /**
     * @param edges array of [from, to, weight]
     */
    constructor(edges: number[][]) {
        this._result = ebloss(edges);
    }

    /** Returns true if the given node is in the optimal matching */
    public hasMatch(node: number): boolean {
        return this._result[node] !== Blossom.NO_MATCH;
    }

    /** Returns the matching node index for the given node, or NO_MATCH if it doesn't exist */
    public getMatch(node: number) {
        return this.hasMatch(node) ? this._result[node] : Blossom.NO_MATCH;
    }

    /** Returns an array of each node's match in the max weight matching.
     *  Eg. [1, 0, -1] means 0 matches 1, 1 matches 0, 2 has no matches
     */
    public getMatches() {
        return this._result;
    }
}
