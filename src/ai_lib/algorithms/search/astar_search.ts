import { BestFirstSearch } from './best_first_search';
import { Frontier, GenericSearch } from './generic_search';
import { PriorityQueue } from '../../structures/priority_queue';
import { Hashable, UniqueHashSet } from '../../structures/hash_set';
import { SearchNode, SearchProblem } from './search_problem';

/** A* search - uses the node path cost + heuristic as priority
 */
export class AStarSearch<TState extends Hashable, TAction> extends BestFirstSearch<TState, TAction> {

    _heuristic: (node: TState) => number;

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number = Number.MAX_VALUE,
        heuristic: (node: TState) => number) {
        super(problem, path_cost_limit);
        this._heuristic = heuristic;
    }

    // f(n) = g(n) + h(n)
    // priority function = cost of N + heuristic of N
    _priorityFunc(node: SearchNode<TState, TAction>) : number {
        return node.path_cost + this._heuristic(node.state);
    }
}
