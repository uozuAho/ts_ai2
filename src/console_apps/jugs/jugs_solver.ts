import { BreadthFirstSearch } from '../../ai_lib/algorithms/search/breadth_first_search';
import { JugsAction, JugsProblem, JugsState } from './jugs_problem';

export class JugsSolver {

    public isFinished: boolean = false;

    private _problem: JugsProblem;
    private _searcher: BreadthFirstSearch<JugsState, JugsAction>;

    constructor(problem: JugsProblem) {
        this._problem = problem;
        this._searcher = new BreadthFirstSearch<JugsState, JugsAction>(problem);
    }

    public solve() : boolean {
        this._searcher.solve();
        return this._searcher.isSolved;
    }

    public getSolution() : JugsAction[] {
        return this._searcher.getSolution();
    }
}