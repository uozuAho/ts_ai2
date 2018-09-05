import { Cell } from '../cell';
import { CycleCellsCalculator } from './cycle_cells_calculator';
import { CellsGenerator } from '../cells_generator';

describe('CycleCellsCalculator', function() {
    it('simple', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();
        const calc = new CycleCellsCalculator();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('simple cycle', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZeroCycle();
        const calc = new CycleCellsCalculator();

        const results = calc.calculate(cells);

        // should break cycle and get same results as 3 cells with no cycle
        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        expect(results.totalCalculations).toBe(6);
    });

    it('divergent cell', function() {
        const cells = CellsGenerator.singleDivergentCell();
        const calc = new CycleCellsCalculator();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
    });

    it('divergent cycle', function() {
        const cells = CellsGenerator.divergentCycle();
        const calc = new CycleCellsCalculator();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
    });
});
