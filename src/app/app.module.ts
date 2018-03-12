import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatInputModule, MatButtonModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AstarComponent } from './alg_views/search/astar/astar.component';


@NgModule({
  declarations: [
    AppComponent,
    AstarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
