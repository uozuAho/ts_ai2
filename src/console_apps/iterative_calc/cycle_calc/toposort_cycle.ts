import { IGraph } from '../../../ai_lib/structures/igraph';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { MetaNode } from './meta_node';
import { MetaDag } from './meta_dag';

/** Finds a topological order for any directed graph. */
export class TopoSortCycle {

    /** Compute a topological order of any directed graph. Cycles are converted to MetaNodes.
     * @returns an array of MetaNodes in a topological order
     */
    public static computeOrder(graph: IGraph): MetaNode[] {
        const metaDag = new MetaDag(graph);
        const topo = new TopoSort(metaDag.graph);
        return Array.from(topo.order()).map(idx => metaDag.nodes[idx]);
    }
}
