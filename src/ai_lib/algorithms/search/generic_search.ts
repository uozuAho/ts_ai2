import { SearchAlgorithm } from './search_algorithm';
import { Hashable, UniqueHashSet } from '../../structures/hash_set';
import { SearchNode, SearchProblem } from './search_problem';

export interface Frontier<T> {
    push(state: T): void;
    pop() : T;
    contains(state: T) : boolean;
    getStates() : T[];
    isEmpty() : boolean;
}

/** Generic search algorithm. The order in which states are popped from the
 *  frontier determines the type of search, eg. breadth/depth-first, best-first
 *  etc.
 */
export abstract class GenericSearch<TState extends Hashable, TAction> implements SearchAlgorithm<TState, TAction> {

    /** A path to a goal state has been found, or all reachable states have been explored */
    public isFinished: boolean = false;

    /** Search is finished and a path to a goal state has been found */
    public isSolved: boolean = false;

    protected _frontier: Frontier<SearchNode<TState, TAction>>;

    private readonly _problem: SearchProblem<TState, TAction>;
    private readonly _explored: UniqueHashSet<SearchNode<TState, TAction>>;
    private _goal: SearchNode<TState, TAction> = null;
    private _currentState: TState;
    private _path_cost_limit: number;

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number) {
        this._problem = problem;
        this._currentState = problem.initial_state;
        this._explored = new UniqueHashSet();
        this._path_cost_limit = path_cost_limit;
    }

    public getFrontier() : TState[] {
        return this._frontier.getStates().map(s => s.state);
    }

    public getExplored() : TState[] {
        return this._explored.items().map(i => i.state);
    }

    public isExplored(state: TState): boolean {
        return this._explored.containsHash(state.hash());
    }

    public solve() {
        while (!this.isFinished) {
            this.step();
        }
    }

    public getCurrentState() : TState {
        return this._currentState;
    }

    /** Returns a list of actions that lead from the initial state to the goal state.
     *  Returns an empty array if not finished or unsolvable.
     */
    public getSolution() : TAction[] {
        if (!this.isFinished) return [];
        if (this._goal === null) return[];
        return this.getSolutionTo(this._goal.state);
    }

    /** Returns a list of actions that lead from the initial state to the given state.
     *  Throws error if given state hasn't been explored.
    */
    public getSolutionTo(state: TState) : TAction[] {
        if (!this._explored.containsHash(state.hash()))
            throw new Error("cannot get solution to unexplored state");
        let actions = [];
        let currentNode = this._explored.getItemByHash(state.hash());
        while (currentNode.action !== null) {
            actions.push(currentNode.action);
            currentNode = currentNode.parent;
        }
        return actions.reverse();
    }

    /** expand the next state on the frontier */
    public step() {
        if (this.isFinished) return;
        if (this._frontier.isEmpty()) {
            this.isFinished = true;
            return;
        }

        let _this = this;
        let node = this._frontier.pop();
        while (node !== undefined && this._explored.contains(node)) {
            node = this._frontier.pop();
        }
        this._explored.add(node);
        this._currentState = node.state;
        let actions = this._problem.getActions(node.state);
        actions.forEach(function(action) {
            let child_state = _this._problem.doAction(node.state, action);
            let child_cost = node.path_cost + _this._problem.pathCost(node.state, action);
            let child = new SearchNode(child_state, node, action, child_cost);
            if (!_this._explored.contains(child) && !_this._frontier.contains(child)) {
                if (_this._problem.isGoal(child.state)) {
                    _this._goal = child;
                    _this._currentState = child.state;
                    _this.isFinished = true;
                    _this.isSolved = true;
                    // add goal to explored to allow this.getSolutionTo(goal)
                    _this._explored.add(child);
                }
                else if (child.path_cost <= _this._path_cost_limit) {
                    _this._frontier.push(child);
                }
            }
        });
    }
}
