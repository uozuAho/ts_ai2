export class Cell {
    constructor(
        public label: string,
        public value = 0,
        public dependsOn: Cell[] = [],
        public calculateValue: () => number = null) {}

    public calculate(): number {
        if (this.calculateValue !== null) {
            this.value = this.calculateValue();
        }
        return this.value;
    }
}
