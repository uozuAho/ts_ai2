import { Point2d } from '../structures/point2d';
import { GraphT } from '../structures/graphT';
import { CanvasDrawer } from './canvasDrawer';

export class Graph2dDiagram {
    private _width: number;
    private _height: number;
    private _draw: CanvasDrawer;

    constructor(canvasId: string, height: number, width: number) {
        this._height = height;
        this._width = width;
        this._draw = new CanvasDrawer(<HTMLCanvasElement>document.getElementById(canvasId), height, width);
    }

    public redraw(graph: GraphT<Point2d>) {
        let _this = this;
        this._draw.clear();
        graph.get_edgesT().forEach(edge => _this.drawEdge(edge.from, edge.to));
        // draw nodes on top of edges
        graph.get_nodes().forEach(node => _this.drawNode(node));
    }

    public drawNode(node: Point2d, colour: string = CanvasDrawer.GREY) {
        this._draw.circle(node.x, node.y, 3, colour);
    }

    public drawEdge(n1: Point2d, n2: Point2d, colour: string = CanvasDrawer.DARK_GREY) {
        this._draw.line(n1.x, n1.y, n2.x, n2.y, colour);
    }
}