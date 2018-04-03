import { Cell } from './cell';
import { NaiveCalculator, CellsCalculator } from './cells_calculator';

// simple test set
const a = new Cell('a', 1);
const b = new Cell('b', 1, [a], () => 0.5 * a.value);
const c = new Cell('c', 1, [b], () => 0.5 * b.value);
const cell_set_1 = [a, b, c];

// random set
const random_cell_set: Cell[] = [];
for (let i = 0; i < 10; i++) {
    random_cell_set.push(new Cell('' + i, Math.random() * 100));
}
// create dependencies
for (const cell of random_cell_set) {
    // 0 - 3 dependencies
    const numDepends = Math.floor(Math.random() * 3);
    for (let i = 0; i < numDepends; i++) {
        const idx = Math.floor(Math.random() * random_cell_set.length);
        cell.dependsOn.push(random_cell_set[idx]);
    }
    if (numDepends > 0) {
        const coeff = 1 / numDepends;
        // (1 / num dependents) * sum (dependent values)
        cell.calculateValue = () => coeff * cell.dependsOn.reduce((prev, curr) => prev + curr.value, 0);
    }
}

function logStats(calculator: CellsCalculator, cells: Cell[]) {
    console.log('calcs: ' + calculator.totalCalculations);
    console.log('converged: ' + calculator.converged);
    console.log('calc limit reached: ' + calculator.calculationLimitReached);
    console.log('values:');
    console.log(cells.map(cell => cell.value));
}

function runAllCalculators(calculators: CellsCalculator[], cells: Cell[]) {
    const cell_start_values = cells.map(cell => cell.value);
    for (const key in calculators) {
        if (calculators.hasOwnProperty(key)) {
            // reset cell values for each calculator
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                cell.value = cell_start_values[i];
            }
            const calculator = calculators[key];
            console.log(key + ': ');
            calculator.calculate(cells);
            logStats(calculator, cells);
            console.log('');
        }
    }
}

const calcs = [];
calcs['naive'] = new NaiveCalculator();

console.log('##################');
console.log('simple set:');
runAllCalculators(calcs, cell_set_1);

console.log('##################');
console.log('random set:');
runAllCalculators(calcs, random_cell_set);
