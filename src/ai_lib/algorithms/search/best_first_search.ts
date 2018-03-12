import { Frontier, GenericSearch } from './generic_search';
import { PriorityQueue } from '../../structures/priority_queue';
import { Hashable, UniqueHashSet } from '../../structures/hash_set';
import { SearchNode, SearchProblem } from './search_problem';

/** Best first - searches the frontier in the given priority order */
export abstract class BestFirstSearch<TState extends Hashable, TAction> extends GenericSearch<TState, TAction> {

    constructor(problem: SearchProblem<TState, TAction>, path_cost_limit: number = Number.MAX_VALUE) {
        super(problem, path_cost_limit);
        this._frontier = new PriorityFrontier<SearchNode<TState, TAction>>(
            (a, b) => this.compareStates(a, b));
        this._frontier.push(new SearchNode(problem.initial_state));
    }

    abstract _priorityFunc(node: SearchNode<TState, TAction>): number;

    // comparer for the priority queue
    private compareStates(a: SearchNode<TState, TAction>, b: SearchNode<TState, TAction>) : -1 | 0 | 1 {
        let h_a = this._priorityFunc(a);
        let h_b = this._priorityFunc(b);
        return h_a < h_b ? -1 : h_a > h_b ? 1 : 0;
    }
}

class PriorityFrontier<T extends Hashable> implements Frontier<T> {
    private readonly _queue: PriorityQueue<T>;
    private readonly _set: UniqueHashSet<T>;

    constructor(compare: (a: T, b: T) => -1 | 0 | 1) {
        this._queue = new PriorityQueue<T>([], compare);
        this._set = new UniqueHashSet();
    }

    push(search_node: T) {
        this._queue.push(search_node);
        this._set.add(search_node);
    }

    pop() : T {
        let item = this._queue.pop();
        this._set.remove(item);
        return item;
    }

    contains(node: T) : boolean {
        return this._set.contains(node)
    }

    getStates() : T[] {
        return this._set.items();
    }

    isEmpty() : boolean {
        return this._set.size() === 0;
    }
}