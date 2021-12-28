import LegalAss from "./LegalAss";
import stringArgv from "string-argv";
import crypto from "crypto";
import { URL } from "url";

export default class Strings {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * first letter of every word uppercase.
	 *
	 * @static
	 * @param {string} str - The string to perform the operation on.
	 * @returns {string}
	 * @memberof Strings
	 * @example Strings.ucwords("some string of words");
	 */
	static ucwords(str: string) {
		return str.toString().toLowerCase().replace(/^(.)|\s+(.)/g, (r) => r.toUpperCase());
	}

	static formatString(str: string, formatArgs: Array<string | number>) {
		formatArgs.map((a, i) => {
			str = str?.replace(new RegExp(`\\{${i}\\}`, "g"), a?.toString());
		});
		return str;
	}

	/**
	 * Format byte measurements for human readability.
	 *
	 * @static
	 * @param {(string | number)} str - The amount to format.
	 * @param {number} [precision] - Where to cut off floating point numbers at.
	 * @returns {string}
	 * @memberof Strings
	 * @example Strings.formatBytes("10000000");
	 * @example Strings.formatBytes("1000000000", 2);
	 */
	static formatBytes(str: string | number, precision = 2) {
		str = Number(str);
		const { KB, MB, GB } = {
			KB: 1000,
			MB: 1000000,
			GB: 1000000000
		};
		if (str >= GB) return `${(str / GB).toFixed(precision)} GB`;
		else if (str >= MB) return `${(str / MB).toFixed(precision)} MB`;
		else if (str >= KB) return `${(str / KB).toFixed(precision)} KB`;
		else return `${str} B`;
	}

	/**
	 * Limit a string to a maximum length.
	 *
	 * @param {string} str - the string to truncate
	 * @param {number} limit - the location to truncate at
	 * @param {boolean} [ellipses] - if ellipses should be included
	 * @returns {string}
	 */
	static truncate(str: string, len: number, ellipses = true) {
		return str.length > len ? ellipses === true ? `${str.slice(0, len - 6)} (...)` : str.slice(0, len) : str;
	}

	// I'm using legal-ass just because of the name, this is easy to implement
	/**
	 * Limit a string to a maximum length, respecting word boundaries.
	 *
	 * @param {string} str - the string to truncate
	 * @param {number} limit - the location to truncate at
	 * @param {boolean} [ellipses] - if ellipses should be included
	 * @returns {string}
	 */
	static truncateWords(str: string, limit: number, ellipses = true) {
		return LegalAss.call(this, str, limit, ellipses);
	}

	/**
	 * Convert camelCase to snake_case
	 *
	 * @param {string} str - The string to change
	 * @returns {string}
	 */
	static camelCaseToSnakeCase(str: string) {
		return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
	}
	/**
	 * Returns the provided string with an s provided if the array length is not 1
	 *
	 * @param {string} str - the provided string
	 * @param {Array<any> | number} arr - the provided array or number
	 * @returns {string}
	 */
	static plural(str: string, val: ArrayLike<unknown> | number) {
		return `${str}${(Array.isArray(val) ? val.length : val) !== 1 ? "s" : ""}`;
	}

	/**
	 * Returns the array joined together with an and
	 *
	 * @param {Array<string>} arr - the provided array
	 * @returns {string}
	 */
	static joinAnd(arr: Array<unknown>, joiner = ", ") {
		if (arr.length === 1) return String(arr[0]);
		const last = arr.splice(arr.length - 1, 1)[0];
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		return `${arr.join(joiner)}, and ${last}`;
	}

	/**
	 * Parse a provided string into its respective key-value/value flag values
	 *
	 * @param {String} str - the string to parse
	 * @param {(name: string) => boolean} [nameFilter] a function to filter flag names
	 * @returns {{ normalArgs: string[]; keyValue: Record<string, string>; value: string[]; }}
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static parseFlags(str: string, nameFilter = (name: string) => true) {
		const parse = stringArgv(str);
		const normalArgs = [] as Array<string>;
		const keyValue = {} as Record<string, string>;
		const value = [] as Array<string>;
		parse.forEach(v => {
			if (!v.startsWith("-")) return normalArgs.push(v);
			else if (!v.includes("=")) {
				if (!nameFilter(v.slice(1))) return normalArgs.push(v);
				else return value.push(v.slice(1));
			} else {
				const parts = v.split("-").filter(Boolean);
				const nameIndex = parts.findIndex(p => p.includes("="));
				const [name] = parts.slice(0, nameIndex + 1).join("-").split("=");
				if (!nameFilter(name)) return normalArgs.push(v);
				const val = parts.splice(nameIndex).join("-").split("=")[1];
				if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) keyValue[name] = val.slice(1, -1);
			}
		});

		return {
			normalArgs,
			keyValue,
			value
		};
	}

	/**
	 * Make an md5 hash from a string
	 *
	 * @param {string} input  - The string to md5
	 * @returns {string}
	 */
	static md5Hash(input: string) {
		return crypto.createHash("md5").update(input).digest("hex");
	}

	/**
	 * Generate a random value
	 *
	 * @param {number} len - The length of the output
	 * @returns {string}
	 */
	static randomValue(len: number) {
		if ((len % 2) !== 0) len = len++;
		return crypto.randomBytes(len / 2).toString("hex");
	}

	/**
	 * Get a random uuid
	 *
	 * @param {number} [disableEntropyCache=false] - If the nodejs entropy cache should be disabled
	 * @returns {string}
	 */
	static randomUUID(disableEntropyCache = false) {
		return crypto.randomUUID({ disableEntropyCache });
	}

	/**
	 * Validate a string is a url
	 *
	 * @param {string} str - the string to validate
	 * @returns {boolean}
	 */
	static validateURL(str: string) {
		return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(str);
	}

	static esmDir(metaURL: string, ...parts: Array<string>) {
		return `${new URL(".", metaURL).pathname}${parts.join("/")}`;
	}
}
