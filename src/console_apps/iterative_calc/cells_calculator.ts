import { Cell } from './cell';

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

/** Naive cells calculator. Calculates cells in order that they are given. */
export class NaiveCalculator implements CellsCalculator {
    public numCalculations: number[];
    public totalCalculations = 0;
    public calculationLimitReached = false;
    public converged = false;

    constructor(public calculationLimit: number = 100, public convergenceThreshold: number = 1e-3) {}

    public calculate(cells: Cell[]) {
        this.numCalculations = Array(cells.length).fill(0);
        const prevValues = cells.map(x => x.value);
        const changes = Array(cells.length).fill(Number.MAX_VALUE);
        while (!this.calculationLimitReached && !this.allChangesBelowThreshold(changes)) {
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                prevValues[i] = cell.value;
                const value = cell.calculate();
                changes[i] = value - prevValues[i];
                if (++this.numCalculations[i] === this.calculationLimit) {
                    this.calculationLimitReached = true;
                }
            }
        }
        // no sum in javascript??? come on...
        this.totalCalculations = this.numCalculations.reduce((sum, x) => sum + x, 0);
        // if we reached the calculation limit, we broke out early, ie. didn't converge.
        this.converged = !this.calculationLimitReached;
    }

    private allChangesBelowThreshold(changes: number[]): boolean {
        const maxChange = Math.max(...changes.map(x => Math.abs(x)));
        return maxChange < this.convergenceThreshold;
    }
}
