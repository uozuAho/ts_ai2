import { BestFirstSearch } from './best_first_search';
import { Frontier } from './generic_search';
import { PriorityQueue } from '../../structures/priority_queue';
import { Hashable, UniqueHashSet } from '../../structures/hash_set';
import { SearchNode, SearchProblem } from './search_problem';

/** 'Greedy' best first - simply uses the given heuristic as the priority
 */
export class GreedyBestFirstSearch<TState extends Hashable, TAction> extends BestFirstSearch<TState, TAction> {

    private _heuristic: (node: TState) => number;

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number = Number.MAX_VALUE,
            heuristic: (node: TState) => number) {
        super(problem, path_cost_limit);
        this._heuristic = heuristic;
    }

    _priorityFunc(node: SearchNode<TState, TAction>) : number {
        return this._heuristic(node.state);
    }
}
