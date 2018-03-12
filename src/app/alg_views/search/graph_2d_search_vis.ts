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
    private _solver: SearchAlgorithm<Point2d, Point2d>;
    private _diagram: Graph2dSearchDiagram;
    private _interval: any;

    constructor(canvasId: string, height: number, width: number,
            generateSolver: (problem: SearchProblem<Point2d, Point2d>, goal: Point2d) =>
            SearchAlgorithm<Point2d, Point2d>) {
        this._canvasId = canvasId;
        this._height = height;
        this._width = width;
        this._problem = this.generateProblem();
        this._generateSolver = generateSolver;
        this.reset();
    }

    private generateProblem() {
        const graph = graphs.randomSquareGraph(this._height, this._width, 500);
        const nodes = graph.get_nodes();
        return new GraphSearchProblem<Point2d>(graph, nodes[0], nodes[100]);
    }

    public reset() {
        this._solver = this._generateSolver(this._problem, this._problem.goal);
        const max_edge_cost = Math.max(...this._problem.graph.get_edgesT().map(e => e.cost));
        this._diagram = new Graph2dSearchDiagram(this._canvasId, this._height, this._width,
            this._problem, this._solver, max_edge_cost);
        this.step();
    }

    public step() {
        this._solver.step();
        this._diagram.redraw();
        if (this._solver.isFinished) {
            clearInterval(this._interval);
        }
    }

    public go() {
        this._interval = setInterval(() => this.step(), 100);
    }

    public stop() {
        clearInterval(this._interval);
    }
}
