export class CanvasDrawer {
    public static readonly RED: string = 'rgb(255,0,0)';
    public static readonly GREEN: string = 'rgb(0,255,0)';
    public static readonly BLUE: string = 'rgb(0,0,255)';
    public static readonly YELLOW: string = 'rgb(255,255,0)';
    public static readonly WHITE: string = 'rgb(255,255,255)';
    public static readonly GREY: string = 'rgb(128,128,128)';
    public static readonly DARK_GREY: string = 'rgb(64,64,64)';

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    private readonly TWO_PI: number = 2 * Math.PI;

    constructor(canvas: HTMLCanvasElement, height: number, width: number) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.height = height;
        this.width = width;
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    public circle(x: number, y: number, radius: number, fill: string) {
        this.ctx.fillStyle = fill;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, this.TWO_PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

    public line(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 1) {
        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.closePath();
    }
}