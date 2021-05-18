import * as fs from "fs-extra";
import { dirname } from "node:path";
export default function pid(path: string) {
	const b = dirname(path);
	if (!fs.existsSync(b)) fs.mkdirpSync(b);
	fs.writeFileSync(path, process.pid.toString());
	function remove(code?: number, signal?: NodeJS.Signals) {
		try {
			fs.unlinkSync(path);
		} catch (e) {
			// not handling this error
		}
		process.kill(process.pid, code ?? signal);
	}

	process
		.on("exit", remove.bind(null))
		.on("SIGINT", remove.bind(null))
		.on("SIGTERM", remove.bind(null));
}
