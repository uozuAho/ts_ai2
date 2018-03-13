import { Component, AfterViewInit } from '@angular/core';

import { DepthFirstSearch } from '../../../../ai_lib/algorithms/search/depth_first_search';
import { SearchProblem } from '../../../../ai_lib/algorithms/search/search_problem';
import { Graph2dSearchVisualiser } from '../graph_2d_search_vis';
import { Point2d } from '../../../../ai_lib/structures/point2d';

@Component({
  selector: 'app-depth-first-search',
  templateUrl: './depth-first-search.component.html',
  styleUrls: ['./depth-first-search.component.css']
})
export class DepthFirstSearchComponent implements AfterViewInit {

  private _searchVis: Graph2dSearchVisualiser;

  constructor() { }

  ngAfterViewInit(): void {
    this.restart('canvas');
  }

  createSolver(problem: SearchProblem<Point2d, Point2d>) {
      return new DepthFirstSearch<Point2d, Point2d>(problem);
  }

  public restart(canvasId: string) {
      this._searchVis = new Graph2dSearchVisualiser(canvasId, 500, 500, this.createSolver);
      this.go();
  }

  public go(): void {
    this._searchVis.go();
  }

  public stop(): void {
    this._searchVis.stop();
  }

  public step(): void {
    this._searchVis.step();
  }

  public reset(): void {
    this._searchVis.reset();
  }
}
