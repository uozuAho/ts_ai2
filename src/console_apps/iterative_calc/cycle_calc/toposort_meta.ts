import { IGraph } from '../../../ai_lib/structures/igraph';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { MetaNode } from './meta_node';
import { MetaDag } from './meta_dag';

/** Finds a topological order for any directed graph. */
export class TopoSortMeta {

    public order: MetaNode[];

    /** Compute a topological order of any directed graph.
     *  Cycles are converted to MetaNodes.
     */
    constructor(graph: IGraph) {
        const metaDag = new MetaDag(graph);
        const topo = new TopoSort(metaDag.graph);
        this.order = Array.from(topo.order()).map(idx => metaDag.nodes[idx]);
    }
}
