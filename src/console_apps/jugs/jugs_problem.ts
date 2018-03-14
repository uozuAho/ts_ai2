import { Hashable } from '../../ai_lib/structures/hash_set';
import { SearchProblem } from '../../ai_lib/algorithms/search/search_problem';

/**
 * The 'jugs' problem from AI book page 114, ch3, exercise 3.6d. You've
 * got N jugs of capacity X, and a tap with infinite water. You need to
 * measure out exactly Y. You can pour any jug onto the ground to empty
 * it.
 */
export class JugsProblem implements SearchProblem<JugsState, JugsAction> {
    public initial_state: JugsState;

    private _goalAmount: number;

    private constructor(initial_state: JugsState, goal_amount: number) {
        this.initial_state = initial_state;
        this._goalAmount = goal_amount;
    }

    public static createNew(capacities: number[], goal_amount: number) : JugsProblem {
        let initial_state = createJugsState(capacities);
        return new JugsProblem(initial_state, goal_amount);
    }

    public getActions(state: JugsState): JugsAction[] {
        let actions: JugsAction[] = [];
        state.jugs.forEach(jug1 => {
            // jug1 is empty. all we can do is fill from the tap.
            // Other jugs will check if they can pour into jug1.
            if (jug1.isEmpty())
                actions.push(this.createPourAction(TAP, jug1));
            else {
                // jug1 is not empty. Can pour onto ground or another non-full jug
                actions.push(this.createPourAction(jug1, GROUND));
                state.jugs.forEach(jug2 => {
                    if (jug1 === jug2) return;
                    if (jug2.isFull()) return;
                    actions.push(this.createPourAction(jug1, jug2));
                });
            }
        });
        return actions;
    }

    public doAction(state: JugsState, action: JugsAction): JugsState {
        let newState = state.clone();
        let newFrom = newState.getJugById(action.jugFrom.id);
        let newTo = newState.getJugById(action.jugTo.id);
        this.doPourAction(newFrom, newTo);
        return newState;
    }

    public isGoal(state: JugsState): boolean {
        return state.jugs.findIndex(j => j.contents == this._goalAmount) >= 0;
    }

    public pathCost(state: JugsState, action: JugsAction): number {
        return 1;
    }

    private createPourAction(from: Jug, to: Jug) : JugsAction {
        return {jugFrom: from, jugTo: to};
    }

    private doPourAction(from: Jug, to: Jug) : void {
        if (to === TAP) throw new Error("can't pour into tap");
        if (from === GROUND) throw new Error("can't pour from ground");
        if (from === TAP)
            to.contents = to.capacity;
        else if (to === GROUND)
            from.contents = 0;
        else {
            let transferAmount = Math.min(from.contents, to.remaining());
            from.contents -= transferAmount;
            to.contents += transferAmount;
        }
    }
}

export class Jug {
    public id: number;
    public capacity: number;
    public contents: number;

    constructor(id: number, capacity: number, contents: number) {
        this.id = id;
        this.capacity = capacity;
        this.contents = contents;
    }

    public isFull() : boolean {
        return this.contents === this.capacity;
    }

    public isEmpty() : boolean {
        return this.contents === 0;
    }

    public remaining() : number {
        return this.capacity - this.contents;
    }

    public clone() : Jug {
        return new Jug(this.id, this.capacity, this.contents);
    }
}

/** Tap is a special jug that never runs out */
export const TAP_ID = -1;
export const TAP = new Jug(TAP_ID, -1, -1);

/** Ground is a special jug that never gets full */
export const GROUND_ID = -2;
export const GROUND = new Jug(GROUND_ID, -1, -1);

export function createJugsState(capacities: number[]) : JugsState {
    let state = new JugsState();
    for (let i = 0; i < capacities.length; i++) {
        state.jugs.push(new Jug(i, capacities[i], 0));
    }
    return state;
}

export class JugsState implements Hashable {
    public jugs: Jug[] = [];

    public getJugById(id: number) {
        if (id === TAP_ID) return TAP;
        if (id === GROUND_ID) return GROUND;
        return this.jugs[id];
    }

    public hash() : string {
        return this.jugs.map(j => j.contents).join(",");
    }

    public clone() : JugsState {
        let copy = new JugsState();
        copy.jugs = this.jugs.map(j => j.clone());
        return copy;
    }
}

export class JugsAction {
    public jugFrom: Jug;
    public jugTo: Jug;
}