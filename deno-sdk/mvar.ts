type VarHandler<T> = (v: T) => void;

export class MVar<T> {
    private vals: T[] = [];
    private wait: VarHandler<T>[] = [];

    constructor(val?: T) {
        if (val) {
            this.vals.push(val);
        }
    }

    empty(): boolean {
        return this.vals.length === 0;
    }

    put(elem: T): void {
        if (this.wait.length !== 0) {
            const task = this.wait.shift()!;
            task(elem);
        } else {
            this.vals.push(elem);
        }
    }

    async take(): Promise<T> {
        if (this.vals.length !== 0) {
            return this.vals.shift()!;
        } else {
            return new Promise(resolve => this.wait.push(resolve));
        }
    }
}