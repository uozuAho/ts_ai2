import { Cell } from './cell';
import { NaiveCalculator, TopoSortCalculator } from './cells_calculator';
import { CellsGenerator } from './cells_generator';

describe('NaiveCalculator', function() {
    it('3 linear cells', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();
        const calc = new NaiveCalculator();

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('divergent cell', function() {
        const cells = CellsGenerator.singleDivergentCell();
        const calcLimit = 20;
        const calc = new NaiveCalculator(calcLimit);

        const results = calc.calculate(cells);

        expect(results.calculationLimitReached).toBe(true);
        expect(results.converged).toBe(false);
        expect(results.totalCalculations).toBe(calcLimit);
    });
});

describe('TopoCalculator', function() {
    it('3 linear cells', function() {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();
        const calc = new TopoSortCalculator();

        const results = calc.calculate(cells);

        // topological order is the same as existing cell order, so results should be the same as naive
        expect(results.calculationLimitReached).toBe(false);
        expect(results.converged).toBe(true);
        // first run through sets all cells with dependencies to 0
        // no values change in the second run, so calculation terminates after 2 sets
        expect(results.totalCalculations).toBe(6);
    });

    it('divergent cell', function() {
        const cells = CellsGenerator.singleDivergentCell();
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
