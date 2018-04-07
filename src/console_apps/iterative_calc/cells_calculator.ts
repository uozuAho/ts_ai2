import { Cell, CellsGraph } from './cell';
import { TopoSort } from '../../ai_lib/algorithms/graph/toposort';
import { DiGraphT } from '../../ai_lib/structures/graphT';
import { DirectedCycle } from '../../ai_lib/algorithms/graph/directed_cycle';
import { Assert } from '../../libs/assert/Assert';

export interface CellsCalculator {
    /** Number of calculations per cell */
    numCalculations: number[];
    /** Sum of all cell calculations */
    totalCalculations: number;
    /** True if any cell reached the max number of calculations limit */
    calculationLimitReached: boolean;
    /** Max number of calculations for any cell */
    calculationLimit: number;
    /** True if calculation ceased due to all cells' change being below threshold */
    converged: boolean;
    /** Deemed to have converged if all cell changes are below this value */
    convergenceThreshold: number;
    /** Calculate all cells until values converge or calculation limit is reached */
    calculate(cells: Cell[]);
}

export class BaseCalculator {
    public numCalculations: number[];
    public totalCalculations = 0;
    public calculationLimitReached = false;
    public converged = false;

    constructor(public calculationLimit: number = 100, public convergenceThreshold: number = 1e-3) {}

    protected calculateTotalCalcs(): number {
        return this.numCalculations.reduce((sum, x) => sum + x, 0);
    }

    protected allChangesBelowThreshold(changes: number[]): boolean {
        const maxChange = Math.max(...changes.map(x => Math.abs(x)));
        return maxChange < this.convergenceThreshold;
    }

    /** Calculate all cells in the given order until values converge or limit is reached */
    protected calculateInOrder(cells: Cell[], order: number[]) {
        Assert.isTrue(cells.length === order.length);
        this.numCalculations = Array(cells.length).fill(0);
        const prevValues = cells.map(x => x.value);
        const changes = Array(cells.length).fill(Number.MAX_VALUE);
        while (!this.calculationLimitReached && !this.allChangesBelowThreshold(changes)) {
            for (let i = 0; i < order.length; i++) {
                const cellIdx = order[i];
                const cell = cells[cellIdx];
                prevValues[cellIdx] = cell.value;
                const value = cell.calculate();
                changes[cellIdx] = value - prevValues[cellIdx];
                if (++this.numCalculations[cellIdx] === this.calculationLimit) {
                    this.calculationLimitReached = true;
                }
            }
        }
        this.totalCalculations = this.calculateTotalCalcs();
        // if we reached the calculation limit, we broke out early, ie. didn't converge.
        this.converged = !this.calculationLimitReached;
    }
}

/** Naive cells calculator. Calculates cells in order that they are given. */
export class NaiveCalculator extends BaseCalculator implements CellsCalculator {

    public calculate(cells: Cell[]) {
        this.calculateInOrder(cells, range(cells.length));
    }
}

/** Calculate cells in topo order. Reverts to naive if cell dependencies contain any cycles. */
export class TopoSortCalculator extends BaseCalculator implements CellsCalculator {

    public calculate(cells: Cell[]) {
        const cellsGraph = CellsGraph.create(cells);

        const cycleFinder = new DirectedCycle(cellsGraph);
        const order = cycleFinder.hasCycle()
            ? range(cells.length)
            : Array.from(new TopoSort(cellsGraph).order());

        this.calculateInOrder(cells, order);
    }
}

// create an array of numbers from 0 to i
function range(n: number): number[] {
    const r = [];
    for (let i = 0; i < n; i++) {
        r.push(i);
    }
    return r;
}
