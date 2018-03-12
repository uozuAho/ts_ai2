import { DepthFirstSearch } from './depth_first_search';
import { SearchProblem, SearchNode } from './search_problem';
import { Hashable } from '../../structures/hash_set';
import * as tmoq from 'typemoq';

class StateMock implements Hashable {
    public data: string;
    constructor(data: string) { this.data = data; }
    hash() {return this.data};
}

class ActionMock {}

describe('DepthFirstSearch', function() {
    let initial_state = new StateMock("initial state");
    let problem = tmoq.Mock.ofType<SearchProblem<StateMock, ActionMock>>();
    let dfs : DepthFirstSearch<StateMock, ActionMock>;

    beforeEach(function() {
    });

    var initialiseOneStateProblem = function() {
        problem = tmoq.Mock.ofType<SearchProblem<StateMock, ActionMock>>();
        problem.setup(p => p.initial_state).returns(() => initial_state);
        problem.setup(p => p.getActions(tmoq.It.isAny())).returns(() => []);
        problem.setup(p => p.isGoal(tmoq.It.isAny())).returns(() => false);
        dfs = new DepthFirstSearch(problem.object);
    }

    it('initial state', function() {
        initialiseOneStateProblem();
        expect(dfs.getExplored()).toEqual([]);
        expect(dfs.isFinished).toBe(false);
        expect(dfs.getFrontier().length).toBe(1);
        expect(dfs.getFrontier()[0].data).toBe("initial state");
    });

    it('solve one state problem should finish', function() {
        initialiseOneStateProblem();
        dfs.solve();
        expect(dfs.isFinished).toBe(true);
    });

    it('first step', function() {
        let action1 = new ActionMock();
        let action2 = new ActionMock();
        let state1 = new StateMock("state 1");
        let state2 = new StateMock("state 2");
        problem = tmoq.Mock.ofType<SearchProblem<StateMock, ActionMock>>();
        problem.setup(p => p.initial_state).returns(() => initial_state);
        problem.setup(p => p.getActions(initial_state)).returns(() => [action1, action2]);
        problem.setup(p => p.doAction(initial_state, action1)).returns(() => state1);
        problem.setup(p => p.doAction(initial_state, action2)).returns(() => state2);
        problem.setup(p => p.pathCost(tmoq.It.isAny(), tmoq.It.isAny())).returns(() => 1);
        dfs = new DepthFirstSearch(problem.object);

        dfs.step();

        expect(dfs.getExplored()).toEqual([initial_state]);
        expect(dfs.getFrontier()).toEqual([state1, state2]);
        expect(dfs.isFinished).toBe(false);
    });

    it('solvable should solve and return correct solution', function() {
        let action1 = new ActionMock();
        let action2 = new ActionMock();
        let state1 = new StateMock("state 1");
        let state2 = new StateMock("state 2");
        problem = tmoq.Mock.ofType<SearchProblem<StateMock, ActionMock>>();
        problem.setup(p => p.initial_state).returns(() => initial_state);
        problem.setup(p => p.getActions(initial_state)).returns(() => [action1]);
        problem.setup(p => p.doAction(initial_state, action1)).returns(() => state1);
        problem.setup(p => p.getActions(state1)).returns(() => [action2]);
        problem.setup(p => p.doAction(state1, action2)).returns(() => state2);
        problem.setup(p => p.isGoal(state2)).returns(() => true);
        problem.setup(p => p.pathCost(tmoq.It.isAny(), tmoq.It.isAny())).returns(() => 1);
        dfs = new DepthFirstSearch(problem.object);

        dfs.solve();

        expect(dfs.isFinished).toBe(true);
        expect(dfs.getSolution()).toEqual([action1, action2]);
        expect(dfs.getSolutionTo(state1)).toEqual([action1]);
    });
});