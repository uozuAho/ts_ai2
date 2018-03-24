import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatInputModule, MatButtonModule, MatSidenavModule, MatExpansionModule,
  MatCheckboxModule, MatIconModule } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AstarComponent } from './alg_views/search/astar/astar.component';
import { BreadthFirstSearchComponent } from './alg_views/search/breadth-first-search/breadth-first-search.component';
import { DepthFirstSearchComponent } from './alg_views/search/depth-first-search/depth-first-search.component';
import { GreedyBestFirstSearchComponent } from './alg_views/search/greedy-best-first-search/greedy-best-first-search.component';
import { IterativeDeepeningComponent } from './alg_views/search/iterative-deepening/iterative-deepening.component';
import { GraphAlgViewerComponent } from './graph-alg-viewer/graph-alg-viewer.component';
import { GraphEditorComponent } from './shared/graph-editor/graph-editor.component';
import { EditNodeDialogComponent } from './shared/graph-editor/edit-node-dialog.component';
import { MstComponent } from './alg_views/graph_general/mst/mst.component';
import { TspComponent } from './alg_views/graph_general/tsp/tsp.component';


@NgModule({
  declarations: [
    AppComponent,
    AstarComponent,
    BreadthFirstSearchComponent,
    DepthFirstSearchComponent,
    GreedyBestFirstSearchComponent,
    IterativeDeepeningComponent,
    GraphAlgViewerComponent,
    GraphEditorComponent,
    EditNodeDialogComponent,
    MstComponent,
    TspComponent
  ],
  imports: [
    AppRoutingModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    EditNodeDialogComponent
  ]
})
export class AppModule { }
