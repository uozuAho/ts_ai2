# Typescript ai playground

Typescript implementation of stuff from [Artificial Intelligence: A Modern Approach][aibook],
plus other 'ai' doodlings. Also amassing a fair few algorithms ported from java implementations at
[Algorithms, 4th ed.][algs4].

## Project structure

- ai_lib/ is a standalone 'ai' library
- console_apps/ contains 'ai' console apps. These can be run by compiling
  the project to js (`npm run tsc` or `yarn tsc`), then running with nodejs
- libs/ contains independent libraries for various things. These libs should
  only depend on libraries included in package.json
- everything else is part of the angular framework, which contains
  visualisations of some algorithms, and runs tests

## To do

- use d3/something to animate graph/network vertex order?
- categorise items in the side bar
- add search to side bar
- pandemic WIP
- graph alg viewer - make this a graph search viewer for now

## How to build/run/test

- run dev server: `ng serve`. Navigate to `http://localhost:4200/`.
- run tests: `ng test`
- debugging: Console apps can be debugged in VS Code - see
  .vscode/launch.json. Everything else can be debugged in
  the browser.

[aibook]: http://aima.cs.berkeley.edu/
[algs4]: http://algs4.cs.princeton.edu
