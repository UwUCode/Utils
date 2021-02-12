/* eslint-disable deprecation/deprecation */
import { AnyFunction } from "./Types";
import JSON5 from "json5";
import fs from "fs";

export default class JSON5Helper {
	private static JSON_ORIGINAL: ((m: NodeJS.Module, filename: string) => unknown) | undefined;
	private static JSON5_ORIGINAL: ((m: NodeJS.Module, filename: string) => unknown) | undefined;

	static enable() {
		this.JSON_ORIGINAL = require.extensions[".json"];
		this.JSON5_ORIGINAL = require.extensions[".json5"];
		require.extensions[".json5"] = JSON5Helper.parse.bind(this);
		require.extensions[".json"] = JSON5Helper.parse.bind(this);
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
			(m as NodeJS.Module & {exports: unknown; }).exports = (JSON5.parse as AnyFunction<[string], unknown>)(content);
		} catch (err) {
			if(err instanceof Error) {
				err.message = `${filename}: ${err.message}`;
				throw err;
			} else throw err;
		}
	}
}
