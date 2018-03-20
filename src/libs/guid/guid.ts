export class Guid {
    /** Create a new GUID. Note that this implementation is probably not very collision-proof */
    public static newGuid(): string {
        return this.uuidv4();
    }

    /** from https://stackoverflow.com/a/2117523.
     *  Note that this implementation is probably not very collision-proof */
    public static uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
