import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AstarComponent } from './alg_views/search/astar/astar.component';
import { BreadthFirstSearchComponent } from './alg_views/search/breadth-first-search/breadth-first-search.component';
import { DepthFirstSearchComponent } from './alg_views/search/depth-first-search/depth-first-search.component';

const routes: Routes = [
  { path: 'search/astar', component: AstarComponent },
  { path: 'search/bfs', component: BreadthFirstSearchComponent },
  { path: 'search/dfs', component: DepthFirstSearchComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
