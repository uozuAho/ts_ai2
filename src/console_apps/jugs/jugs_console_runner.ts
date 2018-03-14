import { JugsSolver } from './jugs_solver';
import { GROUND, JugsProblem, TAP } from './jugs_problem';

// let problem = JugsProblem.createNew([12, 8, 3], 1);
let problem = JugsProblem.createNew([240, 201, 17], 5);
let solver = new JugsSolver(problem);
let solutionFound = solver.solve();

if (!solutionFound) {
    console.log("No solution!");
}
else {
    solver.getSolution().forEach(action => {
        let fromCap = action.jugFrom.capacity;
        let fromCon = action.jugFrom.contents;
        let toCap = action.jugTo.capacity;
        let toCon = action.jugTo.contents;
        let fromStr = action.jugFrom === TAP ? "tap" : `${fromCap} (${fromCon})`;
        let toStr = action.jugTo === GROUND ? "ground" : `${toCap} (${toCon})`;
        console.log(`pour ${fromStr} into ${toStr}`);
    });
}