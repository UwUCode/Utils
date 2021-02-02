import fs from "fs";
import JSON5 from "json5";

export default class JSON5Helper {
	private static JSON_ORIGINAL: ((m: NodeJS.Module, filename: string) => any) | undefined;
	private static JSON5_ORIGINAL: ((m: NodeJS.Module, filename: string) => any) | undefined;

	static enable() {
		this.JSON_ORIGINAL = require.extensions[".json"];
		this.JSON5_ORIGINAL = require.extensions[".json5"];
		require.extensions[".json5"] = JSON5Helper.parse;
		require.extensions[".json"] = JSON5Helper.parse;
	}

	static disable() {
		require.extensions[".json5"] = this.JSON5_ORIGINAL;
		require.extensions[".json"] = this.JSON_ORIGINAL!;
		this.JSON5_ORIGINAL = undefined;
		this.JSON_ORIGINAL = undefined;
	}


	private static parse(m: NodeJS.Module, filename: string) {
		const content = fs.readFileSync(filename, "utf8");
		try {
			m.exports = JSON5.parse(content);
		} catch (err) {
			err.message = `${filename}: ${err.message}`;
			throw err;
		}
	}
}
