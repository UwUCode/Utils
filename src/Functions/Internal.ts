import type { DiskUsage } from "../types";
import * as os from "os";
import { exec } from "child_process";

export default class Internal {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}


	/**
	 * Sanitize text to replace certain characters
	 *
	 * @static
	 * @param {string} str - The string to sanitize.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.sanitize("Some (at)everyone text here");
	 */
	static sanitize(str: string) {
		if (typeof str !== "string") str = (str as string).toString();
		["*", "_", "@"].map((s) => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	/**
	 * Sanitize console output to remove special characters.
	 *
	 * @static
	 * @param {string} str - The string to sanitize.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.consoleSanitize("someString");
	 */
	static consoleSanitize(str: string) {
		if (typeof str !== "string") str = (str as string).toString();
		// eslint-disable-next-line no-control-regex
		return str.replace(/\u001B\[[0-9]{1,2}m/g, "");
	}

	/**
	 * Get the local disk usage.
	 *
	 * @static
	 * @returns {DiskUsage}
	 * @memberof Internal
	 * @example Internal.getDiskUsage()
	 */
	static async getDiskUsage(): Promise<DiskUsage> {
		// UNIX = df -Pk "/"
		// WINDOWS = wmic logicaldisk get size,freespace,caption

		const drives: Record<string, {
				total: number;
				free: number;
			}> = {},
			unix = process.platform !== "win32",
			out = await new Promise<Array<Array<string>>>((resolve, reject) => exec(unix ? "df -Pk \"/\"" : "wmic logicaldisk get size,freespace,caption", (err, stdout, stderr) => {
				if (err) return reject(err);
				resolve(
					(stdout + stderr)
						.split(os.EOL)
						.slice(1)
						.map((v) => v.trim().split(/\s+(?=[\d/])/))
						.filter((v) => v.length > 0 && v[0] !== "")
				);
			}));

		for (const line of out) {
			if (unix) {
				drives[line[5]] = {
					free:  Number(line[3]) * 1024,
					total: Number(line[1]) * 1024
				};
			} else {
				drives[line[0]] = {
					free:  Number(line[1]),
					total: Number(line[2])
				};
			}
		}


		return {
			drives,
			unix
		};
	}
}
