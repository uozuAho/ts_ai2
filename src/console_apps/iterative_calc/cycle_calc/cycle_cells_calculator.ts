import { CellsCalculator, BaseCalculator } from '../cells_calculator';
import { Cell, CellsGraph } from '../cell';
import { DirectedCycle } from '../../../ai_lib/algorithms/graph/directed_cycle';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { Assert } from '../../../libs/assert/Assert';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { IGraph, Edge } from '../../../ai_lib/structures/igraph';

/**
 * Calculates cells in an efficient order, even when the
 * cells contain dependency cycles.
 */
export class CycleCellsCalculator implements CellsCalculator {
    public numCalculations: number[];
    public totalCalculations: number;
    public calculationLimitReached: boolean;
    public converged: boolean;

    constructor(public calculationLimit: number = 100, public convergenceThreshold: number = 1e-3) {}

    public calculate(cells: Cell[]) {
        throw new Error('Method not implemented.');
    }

    private convertCyclesToNodes(graph: DiGraphT<MetaCell>): DiGraphT<MetaCell> {
        const finder = new DirectedCycle(graph);
        if (!finder.hasCycle()) { return graph; }

        let cycleCount = 0;
        let tempGraph = graph;

        while (finder.hasCycle()) {
            const nodes = graph.get_nodes();
            const cycleIdxs = finder.getCycle();
            const cycle = cycleIdxs.map(idx => nodes[idx]);

            // get name of the first supernode in cycle, if it exists
            const superNodes = cycle.filter(c => !c.isNormalCell);
            const superNodeName = superNodes.length > 0 ? superNodes[0].cellCycle.label : 'cycle ' + cycleCount++;

            // create a new super node, containing all cells in the cycle
            const superNode = new CellCycle(superNodeName, this.calculationLimit, this.convergenceThreshold);
            for (const node of cycle) {
                if (node.isNormalCell) {
                    superNode.addCell(node.cell);
                } else {
                    node.cellCycle.cells.forEach(c => superNode.addCell(c));
                }
            }
            superNode.dependsOn = superNode.computeExternalDependsOn();

            // rebuild graph, replacing all cycle nodes with the single superNode
            const cycleSet = new Set<number>(cycleIdxs);
            const newNodes = nodes.filter((n, idx) => !cycleSet.has(idx)).concat(new MetaCell(null, superNode));
            tempGraph = this.toGraph(newNodes);
        }

        /* pseudo
        get original graph
        while graph has cycle:
            extract nodes in cycle to a 'super node'
                if any nodes in the cycle are super nodes
                    add other nodes to this super node
                else
                    create new super node
            rebuild graph, using the 'super node' in place of the cycle
                find all edges entering/leaving the super node
        */
    }

    private toGraph(cells: MetaCell[]): DiGraphT<MetaCell> {
        // create graph + nodes
        const graph = new DiGraphT<MetaCell>();
        cells.forEach(metaCell => graph.add_node(metaCell));
        // add edge for each 'dependsOn' --> 'cell'
        cells.forEach(mCell => mCell.dependsOn.forEach(dep => graph.add_edgeT(dep, mCell)));
        return graph;
    }

    private toMetaCells(cells: Cell[]): MetaCell[] {
        const cellIdxMap = new Map<Cell, number>();
        cells.forEach((c, idx) => cellIdxMap.set(c, idx));
        const metaCells = cells.map(c => new MetaCell(c));
        // map cell dependencies to metacell dependencies
        cells.forEach((cell, idx) =>
            cell.dependsOn.forEach(dep => {
                const metaDep = metaCells[cellIdxMap.get(dep)];
                metaCells[idx].dependsOn.push(metaDep);
            })
        );
        return metaCells;
    }

    private calculateTotalCalcs(): number {
        return this.numCalculations.reduce((sum, x) => sum + x, 0);
    }

    private allChangesBelowThreshold(changes: number[]): boolean {
        const maxChange = Math.max(...changes.map(x => Math.abs(x)));
        return maxChange < this.convergenceThreshold;
    }
}

class MetaCell {
    public isNormalCell = false;
    public dependsOn: MetaCell[] = [];

    constructor(public cell: Cell = null, public cellCycle: CellCycle = null) {
        Assert.isTrue(cell !== null || cellCycle !== null, 'one of cell or cellCycle must have a value');
        this.isNormalCell = cell !== null;
    }
}

/** A strongly connected group of cells */
class CellCycle extends BaseCalculator {

    public cells: Cell[];
    public dependsOn: Cell[];
    private _order: number[];
    private _cellSet: Set<Cell>;

    constructor(public label: string,
                calculationLimit: number,
                convergenceThreshold: number) {
        super(calculationLimit, convergenceThreshold);
        this._cellSet = new Set<Cell>();
    }

    /** Recalculate all cells until they converge, or calculation limit is reached */
    public calculate(calculationLimit: number, convergenceThreshold: number) {
        this.calculateInOrder(this.cells, this._order);
    }

    public addCell(cell: Cell) {
        if (this.containsCell(cell)) {
            throw new Error('cell already in cycle: ' + cell.label);
        }
        this.cells.push(cell);
        this._cellSet.add(cell);
    }

    public containsCell(cell: Cell): boolean {
        return this._cellSet.has(cell);
    }

    /** Determine all 'dependsOn' cells that are not in this set */
    public computeExternalDependsOn(): Cell[] {
        const deps: Cell[] = [];
        for (const cell of this.cells) {
            for (const dep of cell.dependsOn) {
                if (!this.containsCell(dep)) {
                    deps.push(dep);
                }
            }
        }
        return deps;
    }

    public computeOrder(): number[] {
        const graph = CellsGraph.create(this.cells);
        let finder = new DirectedCycle(graph);
        // while there's a cycle
        while (finder.hasCycle()) {
            const cycle = finder.getCycle();
            // remove an edge in the cycle
            graph.remove_edge(cycle[0], cycle[1]);
            finder = new DirectedCycle(graph);
        }
        const topo = new TopoSort(graph);
        Assert.isTrue(topo.hasOrder());
        return Array.from(topo.order());
    }
}
