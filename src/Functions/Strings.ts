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

	static formatString(str: string, formatArgs: (string | number)[]) {
		formatArgs.map((a, i) => {
			// console.log("1", new RegExp(`\\{${i}\\}`, "g"));
			// console.log("2", str);
			// console.log("3", a);
			// console.log("4", str?.replace(new RegExp(`\\{${i}\\}`, "g"), a?.toString()));
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
	 * @param {string} str - the string to truncate 
	 * @param {number} limit - the location to truncate at 
	 */
	static truncate(str: string, limit: number) {
		return str.length > limit ? `${str.slice(limit - 6)} (...)` : str;
	}
}
