import { Hashable } from '../../structures/hash_set';

export interface SearchProblem<TState extends Hashable, TAction> {
    readonly initial_state: TState;

    getActions(state: TState) : TAction[];
    doAction(state: TState, action: TAction) : TState;
    isGoal(state: TState) : boolean;
    pathCost(state: TState, action: TAction) : number;
}


/** Similar to child node, p79 in AI book */
export class SearchNode<TState extends Hashable, TAction> implements Hashable {
    /** Problem state at this node */
    public readonly state: TState;
    /** Action that resulted in this state */
    public readonly action: TAction;
    public readonly parent: SearchNode<TState, TAction>;
    /** Path cost at this node = parent.path_cost + step_cost(parent, action) */
    public readonly path_cost: number;

    constructor(state: TState, parent: SearchNode<TState, TAction> = null, action: TAction = null,
        path_cost: number = 0) {
        this.state = state;
        this.parent = parent;
        this.action = action;
        this.path_cost = path_cost;
    }

    public hash() {
        return this.state.hash();
    }
}
