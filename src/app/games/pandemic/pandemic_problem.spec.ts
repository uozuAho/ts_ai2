import { Point2d } from '../../../ai_lib/structures/point2d';
import { City, PandemicBoard } from './pandemic_board';
import { PandemicProblem, PandemicState } from './pandemic_problem';
import * as tmoq from 'typemoq';

describe('PandemicProblem', function() {
    it('asdf', function() {
        const board = tmoq.Mock.ofType(PandemicBoard);
        const cities = [
            new City('city1', new Point2d(1, 2), 'red'),
            new City('city2', new Point2d(2, 2), 'blue')
        ];
        board.setup(b => b.getCities()).returns(() => cities);
        board.setup(b => b.getAdjacentCities(cities[0])).returns(() => [cities[1]]);

        const init_state = PandemicState.createNew(board.object, cities[0]);
        const problem = new PandemicProblem(board.object, init_state);
        problem.getActions(problem.initial_state);
    });
});
