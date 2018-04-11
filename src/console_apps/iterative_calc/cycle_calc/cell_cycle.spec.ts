import { Cell } from '../cell';
import { CellCycle } from './cell_cycle';
import { CellsGenerator } from '../cells_generator';

describe('CellCycle', function() {
    it('3 cells, no cycle', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();
        const cycle = new CellCycle(cells, 100, 1e-3);

        const results = cycle.calculate();

        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('3 cells with cycle', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZeroCycle();
        const cycle = new CellCycle(cells, 100, 1e-3);

        const results = cycle.calculate();

        // should get same results as no cycle
        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        expect(results.totalCalculations).toBe(6);
    });
});
