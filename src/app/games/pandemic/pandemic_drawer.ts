import { Component, AfterViewInit } from '@angular/core';

import { PandemicBoard, City } from './pandemic_board';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode, VisNetworkDef } from '../../../libs/vis_wrappers/vis_network';

@Component({
  selector: 'app-pandemic-drawer',
  template: '<p>drawer</p>',
  styleUrls: []
})
export class PandemicDrawerComponent extends GraphEditorComponent {

    private _height: number;
    private _width: number;
    private _board: PandemicBoard;

    constructor() {
        super(null);
        // this._height = height;
        // this._width = width;
        // this._board = board;
    }

    public redraw() {
        this.clear();
    }

    public drawBoard(board: PandemicBoard) {
        // this._board.getEdges().forEach(edge => {
        //     this.drawEdge(edge);
        // });
        // this._board.getCities().forEach(city => {
        //     this.drawCity(city);
        // });
        const nodes = this._board.getCities().map(c => this.cityToVisNode(c));
        // todo: edges
        const def = new VisNetworkDef(nodes);
        this.setGraph(def);
    }

    private cityToVisNode(city: City): VisNode {
        const node = new VisNode(city.name, city.name, city.location.x, city.location.y);
        node.color = city.colour;
        return node;
     }

    // private drawEdge(edge: Edge<City>) {
    //     let p1 = edge.from.location;
    //     let p2 = edge.to.location;
    //     this._draw.line(p1.x, p1.y, p2.x, p2.y, this._draw.GREY);
    // }
}
