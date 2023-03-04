import { constants, getPriority, setPriority } from "node:os";


export default class ReNice extends null {
    private static OLD?: number;
    static apply(level: keyof typeof constants["priority"] | number) {
        this.OLD = getPriority(process.pid);
        setPriority(process.pid, typeof level === "number" ? level : constants.priority[level]);
    }

    static undo() {
        setPriority(this.OLD!);
        this.OLD = undefined;
    }
}
