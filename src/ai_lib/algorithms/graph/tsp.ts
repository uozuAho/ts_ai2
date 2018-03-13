import {IGraph} from '../../structures/igraph';
import {Graph} from '../../structures/graph';
import {Mst} from './mst';

/** Solves travelling salesman problem (TSP) with 1.5x approximation (1.5x optimal)
 *  Uses algorithm described in recitation 9 of the AI book.
*/
export class TspSolver {
    public solve(graph: IGraph): void {
        const num_nodes = graph.num_nodes();

        const mst = new Mst(graph);

        // get indices of nodes with odd degree in mst
        const odd_degree_nodes: number[] = [];
        for (let i = 0; i < num_nodes; i++) {
            if (mst.degree(i) % 2 !== 0) {
                odd_degree_nodes.push(i);
            }
        }
    }
}
