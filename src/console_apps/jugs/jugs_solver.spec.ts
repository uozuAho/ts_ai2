import { JugsSolver } from './jugs_solver';
import { JugsProblem } from './jugs_problem';

describe('JugsSolver', function() {

    it('simple', function() {
        let problem = JugsProblem.createNew([1], 1);
        let solver = new JugsSolver(problem);

        let isSolved = solver.solve();
        expect(isSolved).toBe(true, "should be able to solve");

        let solution = solver.getSolution();
        expect(solution.length).toBe(1, "there's only 1 action required");
    });

    it('simple2', function() {
        let problem = JugsProblem.createNew([2, 3], 1);
        let solver = new JugsSolver(problem);

        let isSolved = solver.solve();
        expect(isSolved).toBe(true, "should be able to solve");

        let solution = solver.getSolution();
        expect(solution.length).toBe(2, "optimal solution takes 2 moves");
    });
});