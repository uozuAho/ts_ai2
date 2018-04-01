# Typescript ai playground

Typescript implementation of stuff from [Artificial Intelligence: A Modern Approach][aibook],
plus other 'ai' doodlings.

## Project structure

- ai_lib/ is a standalone 'ai' library
- console_apps/ contains 'ai' console apps. These can be run by compiling
  the project to js (`npm run tsc` or `yarn tsc`), then running with nodejs
- libs/ contains independent libraries for various things. These libs should
  only depend on libraries included in package.json
- everything else is part of the angular framework, which contains
  visualisations of some algorithms, and runs tests

## To do

- categorise items in the side bar
- add search to side bar
- pandemic WIP
- graph alg viewer - make this a graph search viewer for now


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


[aibook]: http://aima.cs.berkeley.edu/
