import { execSync } from "child_process";
import ts from "typescript";
import * as fs from "fs-extra";
import * as os from "os";
import JSON5 from "json5";

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
		if (typeof str !== "string") str = (str as any).toString();
		["*", "_", "@"].map(s => str = str.replace(new RegExp(`\\${s}`, "gi"), `\\${s}`));
		return str;
	}

	/**
	 * Sanitize console output to remove special characters.
	 *
	 * @static
	 * @param {string} str - The string to sanitize-
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.consoleSanitize("someString");
	 */
	static consoleSanitize(str: string) {
		if (typeof str !== "string") str = (str as any).toString();
		return str.replace(/\u001B\[[0-9]{1,2}m/g, "");
	}

	/**
	 * Get the number of days in a given month.
	 *
	 * Not zero based.
	 *
	 * @static
	 * @param {number} month
	 * @returns {number}
	 * @memberof Internal
	 * @example Internal.getDaysInMonth(2);
	 */
	static getDaysInMonth(month: number) {
		return new Date(new Date().getFullYear(), month, 0).getDate();
	}


	/**
	 * Get the paid time for a dollar amount.
	 *
	 * @static
	 * @param {("db" | "main")} type - The type we're calculating for.
	 * @param {number} amount - The amount we're calculating for.
	 * @param {number} [month] - The month we're calculating for. (Zero based)
	 * @returns
	 * @memberof Internal
	 * @example Internal.getPaidTime("db", 3);
	 * @example Internal.getPaidTime("db", 5, 1);
	 * @example Internal.getPaidTime("main", 7);
	 * @example Internal.getPaidTime("main", 10, 4);
	 */
	static getPaidTime(type: "db" | "main", amount: number, month?: number) {
		month = month ?? new Date().getMonth() + 1;
		const PRICE_DB = 25;
		const PRICE_MAIN = 20;
		const DAYS = this.getDaysInMonth(month);
		const HOURLY = type === "db" ? PRICE_DB / DAYS : PRICE_MAIN / DAYS;

		return ((Math.ceil((amount / HOURLY) * 10 / 5) * 5) / 10) * 24 * 60 * 60 * 1000;
	}

	/**
	 * @typedef {object} DiskUsage
	 * @prop {Object.<string, DUsage>} drives
	 * @prop {boolean} unix
	 */

	/**
	 * @typedef {object} DUsage
	 * @prop {number} total
	 * @prop {number} free
	 */

	/**
	 * Get the local disk usage.
	 *
	 * @static
	 * @returns {DiskUsage}
	 * @memberof Internal
	 * @example Internal.getDiskUsage()
	 */
	static getDiskUsage() {
		// UNIX = df -Pk "/"
		// WINDOWS = wmic logicaldisk get size,freespace,caption

		const drives: {
			[k: string]: {
				total: number;
				free: number;
			};
		} = {};
		const unix = process.platform !== "win32";
		const out = execSync(unix ? "df -Pk \"/\"" : "wmic logicaldisk get size,freespace,caption")
			.toString()
			.split(os.EOL)
			.slice(1)
			.map(v => v.trim().split(/\s+(?=[\d/])/))
			.filter(v => v.length > 0 && v[0] !== "");

		for (const line of out) {
			if (unix) drives[line[5]] = {
				free: Number(line[3]) * 1024,
				total: Number(line[1]) * 1024
			}; else drives[line[0]] = {
				free: Number(line[1]),
				total: Number(line[2])
			};
		}

		return {
			drives,
			unix
		};
	}

	/**
	 * Get our tsconfig file in a json format.
	 *
	 * @static
	 * @param {(string | null)} [file] - A file to read from.
	 * @returns {ts.TranspileOptions}
	 * @memberof Internal
	 * @example Internal.getTSConfig();
	 * @example Internal.getTSConfig("/opt/NPMBot/tsconfig.json");
	 */
	static getTSConfig(file: string) {
		const c = JSON5.parse(fs.readFileSync(file).toString());
		return {
			...c,
			compilerOptions: {
				...c.compilerOptions,
				target: ts.ScriptTarget.ESNext,
				moduleResolution: ts.ModuleResolutionKind.NodeJs,
				module: ts.ModuleKind.CommonJS,
				lib: [
					"lib.es2015.d.ts",
					"lib.es2016.d.ts",
					"lib.es2017.d.ts",
					"lib.es2018.d.ts",
					"lib.es2019.d.ts",
					"lib.es2020.d.ts",
					"lib.esnext.d.ts"
				]
			}
		} as ts.TranspileOptions;
	}

	/**
	 * Transpile a single file, returning the transpiled contents.
	 *
	 * @static
	 * @param {string} mod - The code to transpile
	 * @param {(ts.TranspileOptions | string)} [tsconfig] - the tsconfig to use
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.transpile(fs.readFileSync("/opt/NPMBot/index.ts"));
	 * @example Internal.transpile(fs.readFileSync("/opt/NPMBot/index.ts"), "/opt/NPMBot/tsconfig.json");
	 */
	static transpile(mod: string, tsconfig: ts.TranspileOptions | string) {
		const cnf = typeof tsconfig === "string" ? this.getTSConfig(tsconfig) : tsconfig;

		return ts.transpileModule(mod, cnf).outputText;
	}
}
