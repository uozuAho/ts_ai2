import { PandemicBoard, City } from './pandemic_board';
import { CanvasDrawer } from '../../ai_lib/vis/canvasDrawer';
import { Edge } from '../../ai_lib/structures/graph';

export class PandemicDrawer {

    private _height: number;
    private _width: number;
    private _draw: CanvasDrawer;
    private _board: PandemicBoard;

    constructor(canvasId: string, height: number, width: number,
            board: PandemicBoard) {
        let canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        this._draw = new CanvasDrawer(canvas, height, width);
        this._height = height;
        this._width = width;
        this._board = board;
    }

    public redraw() {
        this._draw.clear();
    }

    public drawBoard() {
        this._draw.rect(0, 0, this._width, this._height, this._draw.DARK_GREY);
        this._board.getEdges().forEach(edge => {
            this.drawEdge(edge);
        });
        this._board.getCities().forEach(city => {
            this.drawCity(city);
        });
    }

    private drawCity(city: City) {
        let getColour = (city: City) => {
            if (city.colour == PandemicBoard.RED) return this._draw.RED;
            if (city.colour == PandemicBoard.BLUE) return this._draw.BLUE;
            if (city.colour == PandemicBoard.BLACK) return this._draw.BLACK;
            if (city.colour == PandemicBoard.YELLOW) return this._draw.YELLOW;
        };
        this._draw.circle(city.location.x, city.location.y, 3, getColour(city));
    }

    private drawEdge(edge: Edge<City>) {
        let p1 = edge.from.location;
        let p2 = edge.to.location;
        this._draw.line(p1.x, p1.y, p2.x, p2.y, this._draw.GREY);
    }
}