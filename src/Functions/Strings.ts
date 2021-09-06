// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../@types/legal-ass.d.ts" />

import LegalAss from "legal-ass";

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
	static truncate(str: string, limit: number, ellipsis = true) {
		return str.length > limit ? ellipsis === true ? `${str.slice(0, limit - 6)} (...)` : str.slice(0, limit) : str;
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
	static truncateWords(str: string, limit: number, ellipsis = true) {
		return LegalAss(str, {
			length: limit,
			splitWords: false,
			ellipses: ellipsis === false ? "" : " (...)"
		});
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
}
