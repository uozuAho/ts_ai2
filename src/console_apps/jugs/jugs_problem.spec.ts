import { createJugsState, GROUND, Jug, JugsAction, JugsProblem, JugsState, TAP } from './jugs_problem';

describe('JugsProblem', function() {

    let problem: JugsProblem;

    beforeEach(function() {
        problem = JugsProblem.createNew([1, 1], 1);
    });

    it('initial state should not be a goal state', function() {
        expect(problem.isGoal(problem.initial_state)).toBe(false);
    });

    it('2 available actions: fill jug 1 or 2', function() {
        let actions = problem.getActions(problem.initial_state);
        expect(actions.length).toBe(2);
    });

    it('all actions available', function() {
        let state = createJugsState([1, 1]);
        state.jugs[0].contents = 1;
        let actions = problem.getActions(state);
        expect(actions.length).toBe(3, 'should have actions: tap to 1, 0 to ground, 0 to 1');
    });

    it('pour jug to jug', function() {
        let jug0 = new Jug(0, 1, 1);
        let jug1 = new Jug(1, 1, 0);
        let stateBefore = new JugsState();
        stateBefore.jugs = [jug0, jug1];
        let action = <JugsAction>{jugFrom: jug0, jugTo: jug1};
        let stateAfter = problem.doAction(stateBefore, action);

        let jug0after = stateAfter.jugs[0];
        let jug1after = stateAfter.jugs[1];

        expect(jug0after.contents).toBe(0);
        expect(jug1after.contents).toBe(1);
    });

    it('pour tap to jug', function() {
        let jug = new Jug(0, 1, 0);
        let stateBefore = new JugsState();
        stateBefore.jugs = [jug];
        let action = <JugsAction>{jugFrom: TAP, jugTo: jug};
        let stateAfter = problem.doAction(stateBefore, action);
        let jugAfter = stateAfter.jugs[0];

        expect(jugAfter.contents).toBe(1);
    });

    it('pour jug to ground', function() {
        let jug = new Jug(0, 1, 1);
        let stateBefore = new JugsState();
        stateBefore.jugs = [jug];
        let action = <JugsAction>{jugFrom: jug, jugTo: GROUND};
        let stateAfter = problem.doAction(stateBefore, action);
        let jugAfter = stateAfter.jugs[0];

        expect(jugAfter.contents).toBe(0);
    });
});