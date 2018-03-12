import { Frontier, GenericSearch } from './generic_search';
import { UniqueHashSet } from '../../structures/hash_set';
import { Hashable } from '../../structures/hash_set';
import { FifoQueue } from '../../structures/fifo_queue';
import { SearchNode, SearchProblem } from './search_problem';

/** BFS: nodes searched in FIFO order */
export class BreadthFirstSearch<TState extends Hashable, TAction> extends GenericSearch<TState, TAction> {

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number = Number.MAX_VALUE) {
        super(problem, path_cost_limit);
        this._frontier = new FifoFrontier();
        this._frontier.push(new SearchNode(problem.initial_state));
    }
}

class FifoFrontier<T extends Hashable> implements Frontier<T> {
    private readonly frontier_queue: FifoQueue<T>;
    private readonly frontier_set: UniqueHashSet<T>;

    constructor() {
        this.frontier_queue = new FifoQueue<T>();
        this.frontier_set = new UniqueHashSet;
    }

    push(search_node: T) {
        this.frontier_queue.push(search_node);
        this.frontier_set.add(search_node);
    }

    pop() : T {
        let node = this.frontier_queue.pop();
        this.frontier_set.remove(node);
        return node;
    }

    contains(node: T) : boolean {
        return this.frontier_set.contains(node);
    }

    getStates() : T[] {
        return this.frontier_set.items();
    }

    isEmpty() : boolean {
        return this.frontier_set.size() === 0;
    }
}
