import { DepthFirstSearch } from './depth_first_search';
import { SearchProblem } from './search_problem';
import { SearchAlgorithm } from './search_algorithm';
import { Hashable } from '../../structures/hash_set';

export class IterativeDeepeningSearch<TState extends Hashable, TAction> implements SearchAlgorithm<TState, TAction> {

    public isFinished: boolean;

    private _problem: SearchProblem<TState, TAction>;
    private _dfsSolver: DepthFirstSearch<TState, TAction>;
    private _current_limit: number;

    constructor(problem: SearchProblem<TState, TAction>) {
        this._problem = problem;
        this._current_limit = 1;
        this._dfsSolver = this.createDfsSolver();
    }

    public getCurrentState(): TState {
        return this._dfsSolver.getCurrentState();
    }

    public getSolutionTo(state: TState): TAction[] {
        return this._dfsSolver.getSolutionTo(state);
    }

    public isExplored(state: TState): boolean {
        return this._dfsSolver.isExplored(state);
    }

    public step(): void {
        if (this._dfsSolver.isFinished) {
            if (!this._dfsSolver.isSolved) {
                // couldn't solve problem with current depth limit, increase and try again
                this._current_limit += 1;
                this._dfsSolver = this.createDfsSolver();
                this._dfsSolver.step();
            }
            // else a solution has been found - do nothing
        }
        else {
            this._dfsSolver.step();
        }
    }

    private createDfsSolver() {
        return new DepthFirstSearch(this._problem, this._current_limit);
    }
}