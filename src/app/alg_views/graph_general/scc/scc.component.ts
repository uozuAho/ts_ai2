import { Component, ViewChild } from '@angular/core';
import { GraphEditorComponent } from '../../../shared/graph-editor/graph-editor.component';
import { TarjanSCC } from '../../../../ai_lib/algorithms/graph/tarjan_scc';

@Component({
  selector: 'app-scc',
  templateUrl: './scc.component.html',
  styleUrls: ['./scc.component.css']
})
export class SccComponent {

  private instructions: string;
  private nextButtonText = 'Done';

  @ViewChild(GraphEditorComponent) private _graphEditor: GraphEditorComponent;

  constructor() {}

  public updateScc() {
    const graph = this._graphEditor.getDiGraph();
    const nodes = graph.get_nodes();
    const scc = new TarjanSCC(graph);
    console.log(`found ${scc.count()} components`);
    const colours = this.createRandomColours(scc.count());
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const component_id = scc.id(i);
      const colour = colours[component_id];
      this._graphEditor.editNode(node.id, n => n.color = colour);
    }
  }

  private createRandomColours(n: number): string[] {
    const colours = [];
    for (let i = 0; i < n; i++) {
      colours.push(this.createRandomColour());
    }
    return colours;
  }

  private createRandomColour(): string {
    return `rgb(${this.random256()}, ${this.random256()}, ${this.random256()})`;
  }

  private random256(): number {
    return Math.floor(Math.random() * 256);
  }
}
