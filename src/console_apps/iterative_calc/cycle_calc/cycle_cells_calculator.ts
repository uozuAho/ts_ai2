import { CellsCalculator, BaseCalculator } from '../cells_calculator';
import { Cell, CellsGraph } from '../cell';
import { TopoSortMeta } from './toposort_meta';
import { IGraph } from '../../../ai_lib/structures/igraph';
import { MetaNode } from './meta_node';
import { DiGraph } from '../../../ai_lib/structures/graph';
import { CycleOrderer } from './cycle_orderer';

/**
 * Calculates cells in an efficient order, even when the
 * cells contain dependency cycles.
 */
export class CycleCellsCalculator extends BaseCalculator implements CellsCalculator {

    public calculate(cells: Cell[]) {
        const graph = CellsGraph.create(cells);
        const metaOrder = new TopoSortMeta(graph).order;
        const cycleOrders = this.getCycleOrders(graph, metaOrder);
    }

    private getCycleOrders(graph: IGraph, nodes: MetaNode[]): number[][] {
        const orders: number[][] = [];
        for (let i = 0; i < nodes.length; i++) {
            if (!nodes[i].isSet) {
                orders.push(null);
            } else {
                const subNodes = nodes[i].nodes;
                const subGraph = this.createSubGraph(graph, nodes[i].nodes);
                const subGraphOrder = new CycleOrderer(subGraph).order;
                // map subgraph node indexes back to graph node indexes
                const order = subGraphOrder.map(n => subNodes[n]);
                orders.push(order);
            }
        }
        return orders;
    }

    private createSubGraph(graph: IGraph, nodes: number[]): IGraph {
        const subGraph = new DiGraph(nodes.length);
        const nodesSet = new Set(nodes);
        // map node idxs to subgraph node idxs
        const snMap = new Map<number, number>();
        for (let i = 0; i < nodes.length; i++) {
            snMap.set(nodes[i], i);
        }
        // create edges between subgraph nodes
        for (const edge of graph.get_edges()) {
            if (nodesSet.has(edge.from) && nodesSet.has(edge.to)) {
                subGraph.add_edge(snMap.get(edge.from), snMap.get(edge.to));
            }
        }
        return subGraph;
    }
}
