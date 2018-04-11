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
            if (calcs >= this.calculationLimit) {
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
        const changes = Array(metaCells.length).fill(Number.MAX_VALUE);
        let calcLimitReached = false;

        function addNumCalcs(cell: Cell, num: number): number {
            const value = numCalculations.get(cell);
            const newValue = value === undefined ? num : value + num;
            numCalculations.set(cell, newValue);
            return newValue;
        }

        let loopCounter = 0;
        // todo: allchanges never below - -- changes not updated?
        while (!calcLimitReached && !this.allChangesBelowThreshold(changes)) {
            if (loopCounter++ > 1000) {
                throw new Error('infinite loop detected');
            }
            for (let i = 0; i < metaCells.length; i++) {
                const metaCell = metaCells[i];
                if (!metaCell.isCycle) {
                    // single cell
                    const cell = metaCell.cell;
                    const prevValue = cell.value;
                    prevValues.set(cell, prevValue);
                    const value = cell.calculate();
                    changes[i] = value - prevValue;
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
                        const numCalcs = addNumCalcs(cell, results.numCalculations[j]);
                        if (numCalcs > this.calculationLimit) {
                            calcLimitReached = true;
                        }
                    }
                    // hack: don't track all changes in the cycle, since
                    // the cycle does that for us. If the cycle converged,
                    // set the change for its metacell to zero, otherwise
                    // set a large value. This allows easy reuse of
                    // allChangesBelowThreshold
                    changes[i] = results.converged ? 0 : Number.MAX_VALUE;
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
