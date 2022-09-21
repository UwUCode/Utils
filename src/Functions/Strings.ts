import crypto from "crypto";
import { URL } from "url";
import { resolve } from "path";

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
		if (str.length <= limit) return str;
		let result = "";
		for (const part of str.split(" ")) {
			if (result.length + part.length + (ellipses ? 6 : 0) > limit) break;
			result += `${part} `;
		}
		return `${result}${ellipses === true ? " (...)" : ""}`;
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
		return `${arr.join(joiner)}, and ${last as string}`;
	}

	/**
	 * Make an md5 hash from a string
	 *
	 * @deprecated candidate for removal
	 * @param {string} input  - The string to md5
	 * @returns {string}
	 */
	static md5Hash(input: string) {
		return crypto.createHash("md5").update(input).digest("hex");
	}

	/**
	 * Generate a random value
	 *
	 * @deprecated candidate for removal
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
	 * @deprecated candidate for removal
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

	/**
	 * join strings together as an esm url
	 *
	 * @deprecated candidate for removal
	 * @param {(URL | string)} metaURL - import.meta.url
	 * @param {...Array<string>} parts - the parts to join
	 * @returns
	 */
	static joinESM(metaURL: URL | string, ...parts: Array<string>) {
		if (metaURL instanceof URL) metaURL = metaURL.pathname;
		return resolve(`${new URL(".", metaURL.startsWith("file://") ? metaURL : `file://${metaURL}`).pathname}${parts.join("/")}`);
	}

	/** @deprecated candidate for removal */
	static get esm() { return this.joinESM.bind(this); }
}
