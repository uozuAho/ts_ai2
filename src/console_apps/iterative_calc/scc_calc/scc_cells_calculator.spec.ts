import { CellsGenerator } from '../cells_generator';
import { SccCellsCalculator } from './scc_cells_calculator';

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
});
