import { CellsCalculator, BaseCalculator, CalculationResults } from '../cells_calculator';
import { Cell, CellsGraph } from '../cell';
import { TopoSortMeta } from './toposort_meta';
import { IGraph } from '../../../ai_lib/structures/igraph';
import { MetaNode } from './meta_node';
import { DiGraph } from '../../../ai_lib/structures/graph';
import { CycleOrderer } from './cycle_orderer';
import { Assert } from '../../../libs/assert/Assert';
import { CellCycle } from './cell_cycle';

/**
 * Calculates cells in an efficient order, even when the
 * cells contain dependency cycles.
 */
export class CycleCellsCalculator extends BaseCalculator implements CellsCalculator {

    public calculate(cells: Cell[]): CalculationResults {
        const metaCells = this.computeOrderedMetaCells(cells);
        const numCalcsMap = this.calculateInMetaOrder(metaCells);
        const numCalcs = cells.map(c => numCalcsMap.get(c));
        let converged = true;
        for (const calcs of numCalcs) {
            if (calcs === this.calculationLimit) {
                converged = false;
                break;
            }
        }
        return <CalculationResults> {
            numCalculations: numCalcs,
            calculationLimitReached: !converged,
            converged: converged,
            totalCalculations: this.sum(numCalcs)
        };
    }

    /** Calculate all cells until convergence or calculation limit.
     * @returns map of cell: number of calculations
     */
    private calculateInMetaOrder(metaCells: MetaCell[]): Map<Cell, number> {
        const numCalculations = new Map<Cell, number>();
        const prevValues = new Map<Cell, number>();
        const changes = new Map<Cell, number>();
        // initialise change values to max to ensure convergence check isn't tripped early
        for (const c of metaCells) {
            if (c.isCycle) {
                for (const mc of c.cycle.cells) {
                    changes.set(mc, Number.MAX_VALUE);
                }
            } else {
                changes.set(c.cell, Number.MAX_VALUE);
            }
        }
        let calcLimitReached = false;

        function addNumCalcs(cell: Cell, num: number): number {
            const value = numCalculations.get(cell);
            const newValue = value === undefined ? num : value + num;
            numCalculations.set(cell, newValue);
            return newValue;
        }

        while (!calcLimitReached && !this.allChangesBelowThreshold(Array.from(changes.values()))) {
            for (let i = 0; i < metaCells.length; i++) {
                const metaCell = metaCells[i];
                if (!metaCell.isCycle) {
                    // single cell
                    const cell = metaCell.cell;
                    const prevValue = cell.value;
                    prevValues.set(cell, prevValue);
                    const value = cell.calculate();
                    changes.set(cell, value - prevValue);
                    const numCalcs = addNumCalcs(cell, 1);
                    if (numCalcs === this.calculationLimit) {
                        calcLimitReached = true;
                    }
                } else {
                    // cycle of cells
                    const cycle = metaCell.cycle;
                    const results = cycle.calculate();
                    // Update number of calcs for all cells in cycle.
                    // Note that cells in a cycle are calculated until
                    // convergence, so may have been calculated > 1 times.
                    for (let j = 0; j < cycle.cells.length; j++) {
                        const cell = cycle.cells[j];
                        addNumCalcs(cell, results.numCalculations[j]);
                    }
                    // Don't need to track cell changes in a cycle, since the cycle
                    // does that for us. Just check if the calculation limit was reached.
                    if (results.calculationLimitReached) {
                        calcLimitReached = true;
                    }
                }
            }
        }

        return numCalculations;
    }

    /** Return a topological order of 'meta cells', which are either single cells,
     *  or sets of cells that form a cycle.
     */
    private computeOrderedMetaCells(cells: Cell[]): MetaCell[] {
        const graph = CellsGraph.create(cells);
        const metaOrder = new TopoSortMeta(graph).order;
        const metaCells: MetaCell[] = [];
        for (const metaNode of metaOrder) {
            if (metaNode.isSet) {
                const cycleCells = metaNode.nodes.map(n => cells[n]);
                const cycle = new CellCycle(cycleCells, this.calculationLimit, this.convergenceThreshold);
                metaCells.push(new MetaCell(true, null, cycle));
            } else {
                const cell = cells[metaNode.node];
                metaCells.push(new MetaCell(false, cell, null));
            }
        }
        return metaCells;
    }
}

class MetaCell {
    constructor(
        public isCycle: boolean,
        public cell: Cell,
        public cycle: CellCycle
    ) {}
}
