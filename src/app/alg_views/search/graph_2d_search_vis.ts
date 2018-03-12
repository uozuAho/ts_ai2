import { SearchProblem } from '../../../ai_lib/algorithms/search/search_problem';
import { SearchAlgorithm } from '../../../ai_lib/algorithms/search/search_algorithm';
import { Graph2dSearchDiagram } from '../../../ai_lib/vis/graph_2d_search_diagram';
import { Point2d } from '../../../ai_lib/structures/point2d';
import { GraphSearchProblem } from '../../../ai_lib/algorithms/search/graph_search_problem';
import * as graphs from '../../../ai_lib/structures/graphT';

export class Graph2dSearchVisualiser {

    private _canvasId: string;
    private _width: number;
    private _height: number;
    private _problem: GraphSearchProblem<Point2d>;
    private _generateSolver: (problem: SearchProblem<Point2d, Point2d>, goal: Point2d) =>
        SearchAlgorithm<Point2d, Point2d>;

    constructor(canvasId: string, height: number, width: number,
            generateSolver: (problem: SearchProblem<Point2d, Point2d>, goal: Point2d) =>
            SearchAlgorithm<Point2d, Point2d>) {
        this._canvasId = canvasId;
        this._height = height;
        this._width = width;
        this._problem = this.generateProblem();
        this._generateSolver = generateSolver;
    }

    private generateProblem() {
        const graph = graphs.randomSquareGraph(this._height, this._width, 500);
        const nodes = graph.get_nodes();
        return new GraphSearchProblem<Point2d>(graph, nodes[0], nodes[100]);
    }

    public run() {
        let solver: SearchAlgorithm<Point2d, Point2d>;
        let diagram: Graph2dSearchDiagram;
        const max_edge_cost = Math.max(...this._problem.graph.get_edgesT().map(e => e.cost));

        const init = () => {
            solver = this._generateSolver(this._problem, this._problem.goal);
            diagram = new Graph2dSearchDiagram(this._canvasId, this._height, this._width,
                this._problem, solver, max_edge_cost);
            step();
        };

        let interval: any;
        const step = () => {
            solver.step();
            diagram.redraw();
            if (solver.isFinished) {
                clearInterval(interval);
            }
        };

        document.getElementById('btn_go').onclick = () => { interval = setInterval(step, 100); };
        document.getElementById('btn_stop').onclick = () => clearInterval(interval);
        document.getElementById('btn_step').onclick = step;
        document.getElementById('btn_reset').onclick = init;

        init();
        document.getElementById('btn_go').click();
    }
}
