import { SearchProblem, SearchNode } from './search_problem';
import { Hashable } from '../../structures/hash_set';
import { GraphT } from '../../structures/graphT';

export class GraphSearchProblem<TNode extends Hashable> implements SearchProblem<TNode, TNode> {

    public readonly initial_state: TNode;
    public readonly graph: GraphT<TNode>
    public readonly goal: TNode;

    constructor(graph: GraphT<TNode>, initial: TNode, goal: TNode) {
        this.graph = graph;
        this.initial_state = initial;
        this.goal = goal;
    }

    /** Actions from state (node) are 'go to adjacent node' */
    public getActions(state: TNode) : TNode[] {
        return this.graph.adjacentT(state).map(a => a.to);
    }

    /** Action = 'go to node' */
    public doAction(state: TNode, action: TNode) {
        return action;
    }

    public isGoal(thing: TNode) : boolean {
        return thing === this.goal;
    }

    public pathCost(state: TNode, action: TNode): number {
        return this.graph.edge_cost(state, action);
    }
}
