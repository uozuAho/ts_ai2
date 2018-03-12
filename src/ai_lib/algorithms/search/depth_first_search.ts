import { Frontier, GenericSearch } from './generic_search';
import { UniqueHashSet } from '../../structures/hash_set';
import { Hashable } from '../../structures/hash_set';
import { FifoQueue } from '../../structures/fifo_queue';
import { SearchProblem, SearchNode } from './search_problem';
import { SearchAlgorithm } from './search_algorithm';

/** DFS: nodes searched in LIFO order */
export class DepthFirstSearch<TState extends Hashable, TAction> extends GenericSearch<TState, TAction> {

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number = Number.MAX_VALUE) {
        super(problem, path_cost_limit);
        this._frontier = new LifoFrontier();
        this._frontier.push(new SearchNode(problem.initial_state));
    }
}

class LifoFrontier<T extends Hashable> implements Frontier<T> {
    private readonly frontier_queue: T[]

    constructor() {
        this.frontier_queue = [];
    }

    push(search_node: T) {
        this.frontier_queue.push(search_node);
    }

    pop() : T {
        return this.frontier_queue.pop();
    }

    contains(node: T) : boolean {
        return this.frontier_queue.indexOf(node) >= 0;
    }

    getStates() : T[] {
        return this.frontier_queue;
    }

    isEmpty() : boolean {
        return this.frontier_queue.length == 0;
    }
}
