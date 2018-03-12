import { Hashable } from './hash_set';

export class Point2d implements Hashable {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static distanceSquared(p1: Point2d, p2: Point2d) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    public hash(): string {
        return this.x + ',' + this.y;
    }
}