import { CellsGenerator } from '../cells_generator';
import { SccCellsCalculator } from './scc_cells_calculator';
import { Cell } from '../cell';

describe('SccCellsCalculator', function() {

    let calc = new SccCellsCalculator();

    beforeEach(function() {
        calc = new SccCellsCalculator();
    });

    it('simple', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        cells.forEach(c => {
            expect(c.value).toBe(0);
        });
    });

    it('should not converge with divergent cells', function() {
        const cells = CellsGenerator.divergentCycle();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
    });

    it('scc then single node', function() {
        // 0 <--> 1 --> 2
        // |------|
        //  SCC 0
        //
        // scc should finish iterating before cell 2's value is calculated
        const cells = [
            new Cell('0', 10),
            new Cell('1', 10),
            new Cell('2', 10),
        ];
        cells[0].dependsOn = [cells[1]];
        cells[1].dependsOn = [cells[0]];
        // cells 0 and 1 equal 0.9 x each other
        cells[0].calculateValue = () => 0.9 * cells[1].value;
        cells[1].calculateValue = () => 0.9 * cells[0].value;
        cells[2].dependsOn = [cells[1]];
        cells[2].calculateValue = () => cells[1].value;

        // low max calcs
        const max_calcs = 10;
        calc.calculationLimit = max_calcs;

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
        // at least one node in the scc should have reached the calculation limit
        expect(results.numCalculations[0]).toBeGreaterThanOrEqual(max_calcs - 1);
        expect(results.numCalculations[1]).toBeGreaterThanOrEqual(max_calcs - 1);
        expect(results.numCalculations[2]).toBe(1);

        expect(cells[0].value).toBeLessThan(10);
        expect(cells[1].value).toBeLessThan(10);
        expect(cells[2].value).toBe(cells[1].value);
    });

    it('single nodes should be calculated once while sccs should iterate', function() {
        // 0 <--> 1 --> 2 --> 3 <--> 4
        // |------|           |------|
        //   SCC 0             SCC 1
        //
        // expected calculations:
        // - scc 0 should finish iterating
        // - node 2 should be calculated once
        // - scc 1 should iterate until done
        const cells = [
            new Cell('0', 10),
            new Cell('1', 10),
            new Cell('2', 10),
            new Cell('3', 10),
            new Cell('4', 10),
        ];
        cells[0].dependsOn = [cells[1]];
        cells[1].dependsOn = [cells[0]];
        // cells 0 and 1 equal 0.9 x each other
        cells[0].calculateValue = () => 0.9 * cells[1].value;
        cells[1].calculateValue = () => 0.9 * cells[0].value;
        cells[2].dependsOn = [cells[1]];
        cells[2].calculateValue = () => cells[1].value;
        cells[3].dependsOn = [cells[2]];
        cells[3].dependsOn = [cells[4]];
        cells[4].dependsOn = [cells[3]];
        // cells 3 and 4 equal 0.9 x each other
        cells[3].calculateValue = () => 0.5 * cells[2].value + 0.9 * cells[4].value;
        cells[4].calculateValue = () => 0.9 * cells[3].value;

        // low max calcs
        const max_calcs = 10;
        calc.calculationLimit = max_calcs;

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
        // at least one node in one scc should have reached the calculation limit
        expect(results.numCalculations[0]).toBeGreaterThanOrEqual(max_calcs - 1);
        expect(results.numCalculations[1]).toBeGreaterThanOrEqual(max_calcs - 1);
        // cell 2 should only be calculated once
        expect(results.numCalculations[2]).toBe(1);
        // scc 1 should also reach iteration limit
        expect(results.numCalculations[3]).toBeGreaterThanOrEqual(max_calcs - 1);
        expect(results.numCalculations[4]).toBeGreaterThanOrEqual(max_calcs - 1);

        expect(cells[0].value).toBeLessThan(10);
        expect(cells[1].value).toBeLessThan(10);
        expect(cells[2].value).toBe(cells[1].value);
    });
});
