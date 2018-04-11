import { Cell, CellsGraph } from './cell';
import { NaiveCalculator, CellsCalculator, TopoSortCalculator, CalculationResults } from './cells_calculator';
import { DirectedCycle } from '../../ai_lib/algorithms/graph/directed_cycle';
import { CycleCellsCalculator } from './cycle_calc/cycle_cells_calculator';

class ConsoleRunner {

    private _cellInitialValues: Map<string, number[]> = new Map();
    private _cellSets: Map<string, Cell[]> = new Map();
    private _calculators: Map<string, CellsCalculator> = new Map();

    constructor() {}

    public run() {
        for (const cellsLabel of this._cellSets.keys()) {
            const cells = this._cellSets.get(cellsLabel);
            const containsCyle = CellsGraph.containsCycle(CellsGraph.create(cells));
            console.log('-----------------------------------');
            console.log('cell set: ' + cellsLabel);
            console.log('number of cells: ' + cells.length);
            console.log('contains cycle: ' + containsCyle);
            let firstCalcValues: number[];
            for (const calcLabel of this._calculators.keys()) {
                this.resetCellValues(cellsLabel);
                const calculator = this._calculators.get(calcLabel);
                const results = calculator.calculate(cells);
                console.log('calculator: ' + calcLabel);
                this.logStats(results, cells);
                if (firstCalcValues === undefined) {
                    if (results.converged) {
                        // only treat converged calculated cells' values as valid
                        firstCalcValues = cells.map(c => c.value);
                    }
                } else {
                    if (results.converged) {
                        const thisVals = cells.map(c => c.value);
                        this.logCellsNotWithinTolerance(firstCalcValues, thisVals);
                    }
                }
                console.log('');
            }
        }
    }

    public addCalculator(label: string, calculator: CellsCalculator) {
        this._calculators.set(label, calculator);
    }

    public addCellSet(label: string, cells: Cell[]) {
        this._cellSets.set(label, cells);
        this._cellInitialValues.set(label, cells.map(c => c.value));
    }

    private logStats(results: CalculationResults, cells: Cell[]) {
        console.log('calcs: ' + results.totalCalculations);
        console.log('converged: ' + results.converged);
        console.log('calc limit reached: ' + results.calculationLimitReached);
    }

    private resetCellValues(label: string) {
        const cells = this._cellSets.get(label);
        const initVals = this._cellInitialValues.get(label);
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.value = initVals[i];
        }
    }

    private logCellsNotWithinTolerance(vals1: number[], vals2: number[]) {
        for (let i = 0; i < vals1.length; i++) {
            const val1 = vals1[i];
            const val2 = vals2[i];
            if (Math.abs(val1 - val2) > 1e-3) {
                console.log(`cells at index ${i} differ: ${val1} != ${val2}`);
            }
        }
    }
}

class CellsGenerator {
    public static simpleSet(): Cell[] {
        const a = new Cell('a', 1);
        const b = new Cell('b', 1, [a], () => 0.5 * a.value);
        const c = new Cell('c', 1, [b], () => 0.5 * b.value);
        return [a, b, c];
    }

    /** cells 0, 1, 2, ... n
     *  dependencies 0 --> 1 --> 2 ... ---> n
     *  Calculating in cell order should converge very slowly
     */
    public static reverseDeps(num_cells: number): Cell[] {
        const cells: Cell[] = [];
        for (let i = 0; i < num_cells; i++) {
            cells.push(new Cell('' + i, Math.random() * 100));
        }
        for (let i = 0; i < num_cells - 1; i++) {
            cells[i].dependsOn.push(cells[i + 1]);
            cells[i].calculateValue = () => 0.9 * cells[i + 1].value;
        }
        return cells;
    }

    /**
     * Create a set of cells with random values and formulas
     * @param numCells number of cells
     * @param connectedness each cell depends on 0 - N other cells, N is connectedness
     */
    public static createRandomCellSet(numCells: number, connectedness: number): Cell[] {
        const cells: Cell[] = [];
        for (let i = 0; i < numCells; i++) {
            cells.push(new Cell('' + i, Math.random() * 100));
        }
        // create dependencies
        for (const cell of cells) {
            const numDepends = Math.floor(Math.random() * connectedness);
            for (let i = 0; i < numDepends; i++) {
                const idx = Math.floor(Math.random() * numCells);
                cell.dependsOn.push(cells[idx]);
            }
            if (numDepends > 0) {
                const coeff = 1.6 / numDepends;
                // cell formula = (1 / num dependents) * sum (dependent values)
                cell.calculateValue = () => coeff * cell.dependsOn.reduce((prev, curr) => prev + curr.value, 0);
            }
        }
        return cells;
    }
}

const runner = new ConsoleRunner();

runner.addCalculator('naive', new NaiveCalculator());
runner.addCalculator('topo', new TopoSortCalculator());
runner.addCalculator('cycle', new CycleCellsCalculator());
runner.addCellSet('simple', CellsGenerator.simpleSet());
runner.addCellSet('reverse deps', CellsGenerator.reverseDeps(20));
runner.addCellSet('random', CellsGenerator.createRandomCellSet(50, 2));

runner.run();
