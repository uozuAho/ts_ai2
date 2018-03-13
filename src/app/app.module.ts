import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatInputModule, MatButtonModule, MatSidenavModule } from '@angular/material';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AstarComponent } from './alg_views/search/astar/astar.component';
import { BreadthFirstSearchComponent } from './alg_views/search/breadth-first-search/breadth-first-search.component';
import { DepthFirstSearchComponent } from './alg_views/search/depth-first-search/depth-first-search.component';


@NgModule({
  declarations: [
    AppComponent,
    AstarComponent,
    BreadthFirstSearchComponent,
    DepthFirstSearchComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
