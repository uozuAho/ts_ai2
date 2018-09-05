import { Cell } from './cell';

export class CellsGenerator {
    /** 3 cells, cell i + 1 depends on i. 'calculate' sets cell value to zero */
    public static threeCellsLinearDepEqualsZero(): Cell[] {
        const cells: Cell[] = [
            new Cell('a', 1, [], () => 0),
            new Cell('b', 1),
            new Cell('c', 1)
        ];
        for (let i = 1; i < cells.length; i++) {
            // each cell depends on the cell before it
            cells[i].dependsOn = [cells[i - 1]];
            // 'calculate': set cell value to zero
            cells[i].calculateValue = () => 0;
        }
        return cells;
    }

    /** Same as threeCellsLinearDepEqualsZero, by has cycle */
    public static threeCellsLinearDepEqualsZeroCycle(): Cell[] {
        const cells = CellsGenerator.threeCellsLinearDepEqualsZero();
        cells[0].dependsOn = [cells[2]];
        return cells;
    }

    /** 1 cell, calculate => incrementing value so will never converge */
    public static singleDivergentCell(): Cell[] {
        let i = 0;
        return [
            new Cell('a', 0, [], () => ++i)
        ];
    }

    public static divergentCycle(): Cell[] {
        const cells: Cell[] = [
            new Cell('a', 1, [], () => 0),
            new Cell('b', 1),
            new Cell('c', 1)
        ];
        for (let i = 0; i < cells.length; i++) {
            const prevIdx = i === 0 ? cells.length - 1 : i - 1;
            const prevCell = cells[prevIdx];
            cells[i].dependsOn = [prevCell];
            cells[i].calculateValue = () => 1.1 * prevCell.value;
        }
        return cells;
    }
}
