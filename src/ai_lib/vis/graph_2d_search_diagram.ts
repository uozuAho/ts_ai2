import { SearchAlgorithm } from '../algorithms/search/search_algorithm';
import { GraphSearchProblem } from '../algorithms/search/graph_search_problem';
import { Point2d } from '../structures/point2d';
import { EdgeT, GraphT } from '../structures/graphT';
import { CanvasDrawer } from './canvasDrawer';

export class Graph2dSearchDiagram {

    private _draw: CanvasDrawer;
    private _problem: GraphSearchProblem<Point2d>;
    private _searcher: SearchAlgorithm<Point2d, Point2d>;
    private _max_edge_cost: number;

    constructor(canvasId: string, height: number, width: number,
            problem: GraphSearchProblem<Point2d>,
            searcher: SearchAlgorithm<Point2d, Point2d>,
            max_edge_cost: number) {
        this._draw = new CanvasDrawer(<HTMLCanvasElement>document.getElementById(canvasId), height, width);
        this._problem = problem;
        this._searcher = searcher;
        this._max_edge_cost = max_edge_cost;
    }

    public redraw() {
        let _this = this;
        let graph = this._problem.graph;

        this._draw.clear();
        graph.get_edgesT().forEach(edge => {
            let colour = _this.getEdgeColour(edge);
            _this.drawEdge(edge.from, edge.to, colour);
        });
        this.drawNodes();
        this.drawCurrentStatePath();
    }

    private getEdgeColour(edge: EdgeT<Point2d>) : string {
        // edge weight is inversely proportional to cost
        let weight = (1 - (edge.cost / this._max_edge_cost)) * 60;
        let w = weight.toFixed();
        return `rgb(${w},${w},${w})`;
    }

    private drawNodes() {
        let _this = this;
        let graph = this._problem.graph;
        let current_node = this._searcher.getCurrentState();
        graph.get_nodes().forEach(node => {
            if (node === _this._problem.initial_state)
                _this.drawNode(node, 5, CanvasDrawer.BLUE);
            else if (node === _this._problem.goal)
                _this.drawNode(node, 5, CanvasDrawer.GREEN);
            else if (node === _this._searcher.getCurrentState())
                _this.drawNode(node, 5, CanvasDrawer.YELLOW)
            else if (_this._searcher.isExplored(node))
                _this.drawNode(node, 3, CanvasDrawer.GREY)
            else
                _this.drawNode(node, 3, CanvasDrawer.DARK_GREY);
        });
    }

    private drawCurrentStatePath() {
        let _this = this;
        let currentState = this._searcher.getCurrentState();
        let path = this._searcher.getSolutionTo(currentState);
        let previous_node: Point2d = this._problem.initial_state;
        path.forEach(node => {
            _this.drawNode(node, 3, CanvasDrawer.RED);
            _this.drawEdge(previous_node, node, CanvasDrawer.RED);
            previous_node = node;
        });
    }

    private drawNode(node: Point2d, radius: number, colour: string) {
        this._draw.circle(node.x, node.y, radius, colour);
    }

    private drawEdge(n1: Point2d, n2: Point2d, colour: string) {
        this._draw.line(n1.x, n1.y, n2.x, n2.y, colour);
    }
}