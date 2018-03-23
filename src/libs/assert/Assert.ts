export class Assert {
    public static isTrue(expression: boolean, msg: string = null) {
        if (!expression) {
            msg = msg || 'Assertion failed';
            throw new Error(msg);
        }
    }
}
