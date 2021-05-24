import * as fs from "fs-extra";
import { dirname } from "path";
export default function pid(path: string) {
	const b = dirname(path);
	if (!fs.existsSync(b)) fs.mkdirpSync(b);
	fs.writeFileSync(path, process.pid.toString());
	function remove(type: string | null) {
		try {
			fs.unlinkSync(path);
		} catch (e) {
			// not handling this error
		}

		process.kill(process.pid, type ?? undefined);
	}

	process
		.once("SIGINT", remove.bind(null, "SIGINT"))
		.once("SIGHUP", remove.bind(null, "SIGHUP"))
		.once("SIGQUIT", remove.bind(null, "SIGQUIT"))
		.once("SIGTERM", remove.bind(null, "SIGTERM"))
		.once("exit", remove.bind(null, null));
}
