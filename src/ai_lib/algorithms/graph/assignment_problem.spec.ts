import { AssignmentProblem } from './assignment_problem';

describe('AssignmentProblem', function() {

    it('2x2 simple', function() {
        const weights = [
            [10, 1],
            [1, 10]
        ];
        const ap = new AssignmentProblem(weights);
        expect(ap.sol(0)).toBe(1);
        expect(ap.sol(1)).toBe(0);
        expect(ap.weight()).toBe(2);
    });
});
