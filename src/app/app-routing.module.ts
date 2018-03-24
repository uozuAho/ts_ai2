import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AstarComponent } from './alg_views/search/astar/astar.component';
import { BreadthFirstSearchComponent } from './alg_views/search/breadth-first-search/breadth-first-search.component';
import { DepthFirstSearchComponent } from './alg_views/search/depth-first-search/depth-first-search.component';
import { GreedyBestFirstSearchComponent } from './alg_views/search/greedy-best-first-search/greedy-best-first-search.component';
import { IterativeDeepeningComponent } from './alg_views/search/iterative-deepening/iterative-deepening.component';
import { GraphAlgViewerComponent } from './graph-alg-viewer/graph-alg-viewer.component';
import { MstComponent } from './alg_views/graph_general/mst/mst.component';
import { TspComponent } from './alg_views/graph_general/tsp/tsp.component';
import { PandemicComponent } from './games/pandemic/pandemic.component';

const routes: Routes = [
  { path: 'search/astar', component: AstarComponent },
  { path: 'search/bfs', component: BreadthFirstSearchComponent },
  { path: 'search/dfs', component: DepthFirstSearchComponent },
  { path: 'search/greedy_bfs', component: GreedyBestFirstSearchComponent },
  { path: 'search/ids', component: IterativeDeepeningComponent },
  { path: 'graph_alg_viewer', component: GraphAlgViewerComponent },
  { path: 'graph_general/mst', component: MstComponent },
  { path: 'graph_general/tsp', component: TspComponent },
  { path: 'games/pandemic', component: PandemicComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
