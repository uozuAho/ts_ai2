interface CellsCalculator {
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
    calculate();
}

/** Naive cells calculator. Calculates cells in order that they are given. */
class NaiveCalculator implements CellsCalculator {
    public numCalculations: number[];
    public totalCalculations = 0;
    public calculationLimitReached = false;
    public converged = false;

    constructor(private _cells: Cell[], public calculationLimit: number = 100, public convergenceThreshold: number = 1e-3) {}

    public calculate() {
        this.numCalculations = Array(this._cells.length).fill(0);
        const prevValues = this._cells.map(x => x.value);
        const changes = Array(this._cells.length).fill(Number.MAX_VALUE);
        while (!this.calculationLimitReached && !this.allChangesBelowThreshold(changes)) {
            for (let i = 0; i < this._cells.length; i++) {
                const cell = this._cells[i];
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

class Cell {
    constructor(
        public label: string,
        public value = 0,
        public dependsOn: Cell[] = [],
        public calculateValue: () => number = null) {}

    public calculate(): number {
        if (this.calculateValue !== null) {
            this.value = this.calculateValue();
        }
        return this.value;
    }
}

const a = new Cell('a', 1);
const b = new Cell('b', 1, [a], () => 0.5 * a.value);
const c = new Cell('c', 1, [b], () => 0.5 * b.value);

const calc = new NaiveCalculator([a, b, c]);
calc.calculate();

console.log('calcs: ' + calc.totalCalculations);
console.log('converged: ' + calc.converged);
console.log('calc limit reached: ' + calc.calculationLimitReached);
console.log('values:');
console.log([a, b, c].map(cell => cell.value));
