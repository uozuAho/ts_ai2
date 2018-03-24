import { Component } from '@angular/core';

import { PandemicBoard, City } from './pandemic_board';
import { GraphEditorComponent } from '../../shared/graph-editor/graph-editor.component';
import { VisNode, VisNetworkDef, VisEdge } from '../../../libs/vis_wrappers/vis_network';

@Component({
  selector: 'app-pandemic-drawer',
  template: '<div #graphEditorDiv id="graphEditorDiv"></div>',
  styleUrls: []
})
export class PandemicDrawerComponent extends GraphEditorComponent {

    constructor() {
        super(null);
    }

    public redraw() {
        this.clear();
    }

    public drawBoard(board: PandemicBoard) {
        const nodes = board.getCities().map(c => this.cityToVisNode(c));
        const edges = board.getEdges().map(e => new VisEdge(e.from.name, e.to.name));
        const def = new VisNetworkDef(nodes, edges);
        this.isPhysicsEnabled = false;
        this.setGraph(def);
    }

    // city names are used for vis node ids
    private cityToVisNode(city: City): VisNode {
        const node = new VisNode(city.name, city.name, city.location.x, city.location.y);
        node.color = city.colour;
        return node;
    }
}
