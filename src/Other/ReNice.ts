import * as os from "os";

export default class ReNice {
	private static OLD?: number;
	static apply(level: keyof typeof os["constants"]["priority"]) {
		this.OLD = os.getPriority(process.pid);
		os.setPriority(process.pid, os.constants.priority[level]);
	}

	static undo() {
		os.setPriority(this.OLD!);
		this.OLD = undefined;
	}
}
