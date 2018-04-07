import { Cell } from './cell';
import { NaiveCalculator, TopoSortCalculator } from './cells_calculator';

/** 3 cells, cell i + 1 depends on i. 'calculate' sets cell value to zero */
function createSimpleCells(): Cell[] {
    const cells: Cell[] = [
        new Cell('a', 1, [], () => 0),
        new Cell('b', 1),
        new Cell('c', 1)
    ];
    for (let i = 1; i < cells.length; i++) {
        // each cell depends on the cell before it
        cells[i].dependsOn = [cells[i - 1]];
        // 'calculate': set cell value to zero
        cells[i].calculateValue = () => 0;
    }
    return cells;
}

/** 1 cell, calculate => incrementing value so will never converge */
function createDivergentCells(): Cell[] {
    let i = 0;
    return [
        new Cell('a', 0, [], () => ++i)
    ];
}

describe('NaiveCalculator', function() {
    it('simple cells', function() {
        const cells = createSimpleCells();
        const calc = new NaiveCalculator();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('divergent cells', function() {
        const cells = createDivergentCells();
        const calcLimit = 20;
        const calc = new NaiveCalculator(calcLimit);

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
        expect(results.totalCalculations).toBe(calcLimit);
    });
});

describe('TopoCalculator', function() {
    it('simple cells', function() {
        const cells = createSimpleCells();
        const calc = new TopoSortCalculator();

        const results = calc.calculate(cells);

        // topological order is the same as existing cell order, so results should be the same as naive
        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('divergent cells', function() {
        const cells = createDivergentCells();
        const calcLimit = 20;
        const calc = new TopoSortCalculator(calcLimit);

        const results = calc.calculate(cells);

        // topo sort doesn't help if the cells' formulas cause them to
        // diverge - should get same result as naive calculator
        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
        expect(results.totalCalculations).toBe(calcLimit);
    });
});
