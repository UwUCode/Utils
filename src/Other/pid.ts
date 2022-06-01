import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
export default function pid(path: string) {
	const b = dirname(path);
	if (!existsSync(b)) mkdirSync(b, { recursive: true });
	writeFileSync(path, process.pid.toString());
	// some handlers do not support async code,
	function remove(type: string | null) {
		try {
			rmSync(path, { force: true });
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
