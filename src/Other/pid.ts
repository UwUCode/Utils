import * as fs from "fs-extra";
import { dirname } from "node:path";
export default function pid(path: string) {
	const b = dirname(path);
	if (!fs.existsSync(b)) fs.mkdirpSync(b);
	fs.writeFileSync(path, process.pid.toString());
	function remove() {
		try {
			fs.unlinkSync(path);
		} catch (e) {
			// not handling this error
		}
	}

	process
		.once("exit", remove.bind(null))
		.once("SIGINT", remove.bind(null));
}
