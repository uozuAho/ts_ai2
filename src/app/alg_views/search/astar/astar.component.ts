import { Component, AfterViewInit } from '@angular/core';

import { AStarSearch } from '../../../../ai_lib/algorithms/search/astar_search';
import { SearchProblem } from '../../../../ai_lib/algorithms/search/search_problem';
import { Graph2dSearchVisualiser } from '../graph_2d_search_vis';
import { Point2d } from '../../../../ai_lib/structures/point2d';

@Component({
  selector: 'app-astar',
  templateUrl: './astar.component.html',
  styleUrls: ['./astar.component.css']
})
export class AstarComponent implements AfterViewInit {

  constructor() { }

  public ngAfterViewInit() {
    this.run('aStarCanvas');
  }

  createSolver(problem: SearchProblem<Point2d, Point2d>, goal: Point2d) {
      const heuristic = (node: Point2d) => Point2d.distanceSquared(node, goal);
      return new AStarSearch<Point2d, Point2d>(problem, Number.MAX_VALUE, heuristic);
  }

  run(canvasId: string) {
      const vis = new Graph2dSearchVisualiser(canvasId, 500, 500, this.createSolver);
      vis.run();
  }
}
