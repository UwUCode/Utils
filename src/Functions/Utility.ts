import type { AnyObject } from "@uwu-codes/types";
import type Redis from "ioredis";
import { assert, is } from "tsafe";
import * as os from "os";

let warningEmitted = false;
export default class Utility {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Convert a class to a string format (usually for eval returns).
	 *
	 * @static
	 * @template T - The class' type.
	 * @param {T} d - The class.
	 * @returns {string}
	 * @memberof Utility
	 * @example Utility.toStringFormat(new Error());
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static toStringFormat<T = any>(d: T, names: Array<{
		test<V>(obj: V): boolean;
		props: Array<string>;
	}>) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function format(obj: any, props: Array<string>) {
			const str: Array<[string, string]> = [];
			for (const p of props) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (obj[p] instanceof Object) {
					let f = false;
					for (const o of names) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						if (o.test(obj[p])) {
							f = true;
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							str.push([p, format(obj[p] as AnyObject, o.props)]);
						} else continue;
					}

					if (!f) str.push([p, (obj as AnyObject<string>)[p].toString()]);
				} else str.push([p, (obj as AnyObject<string>)[p]]);
			}


			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
			return `<${obj.constructor.name}${str.reduce((a, b) => typeof b[1] === "string" && ["<"].some((j) => !b[1].startsWith(j)) ? `${a} ${b[0]}="${b[1]}"` : `${a} ${b[0]}=${b[1]}`, "")}>`;
		}

		for (const o of names) {
			if (o.test(d)) return format(d, o.props);
			else continue;
		}


		return String(d);
	}

	/**
	 * Get the longest string in an array.
	 *
	 * @static
	 * @param {((string | number)[])} arr - The array to check
	 * @returns {(string | number)}
	 * @memberof Utility
	 * @example Utility.getLongestString(["hi", "hello"]);
	 */
	static getLongestString(arr: Array<string | number>) {
		let longest = 0;
		for (const v of arr) if (v.toString().length > longest) longest = v.toString().length;
		return longest;
	}

	/**
	 * @typedef {object} GetPercentsResult
	 * @prop {number} input
	 * @prop {string} percent
	 */

	/**
	 * Convert an array of numbers into percentages.
	 *
	 * @static
	 * @param {number[]} arr - The array to convert.
	 * @returns {GetPercentsResult[]}
	 * @memberof Utility
	 * @example Utility.getPercents([1, 5, 4, 2]);
	 */
	static getPercents(arr: Array<number>) {
		const total = arr.reduce((a, b) => a + b, 0),
			a: Array<{
				input: number;
				percent: string;
			}> = [];
		for (const v of arr) {
			let s = (Math.round(((v / total) * 100) * 10) / 10).toString();
			if (!s.includes(".")) s = s.padStart(2, "0");
			else s = s.padStart(4, "0");

			s = s.padEnd(4, ".0");
			a.push({
				input:   v,
				percent: s
			});
		}
		return a;
	}

	/**
	 * Get keys from Redis.
	 *
	 * Because it came to my attention that I should *not* use KEYS in production.
	 *
	 * @static
	 * @param {Redis} client - the redis client to use
	 * @param {string} pattern - The seatch pattern to use.
	 * @param {string} [cursorStart="0"] - Internal use only.
	 * @param {Array<string>} [keys=[]] - Internal use only, provide undefined or an empty array.
	 * @param {number} [maxPerRun=2500] - The maximum amount of keys to fetch per round.
	 * @returns {Promise<Array<string>>}
	 * @memberof Utility
	 * @example getKeys("some:pattern":*);
	 * @example getKeys("some:*:pattern", undefined, undefined, 10000);
	 */
	static async getKeys(client: Redis, pattern: string, cursorStart = "0", keys = [] as Array<string>, maxPerRun = 2500): Promise<Array<string>> {
		const [cursorEnd, k] = await client.scan(cursorStart, "MATCH", pattern, "COUNT", maxPerRun);
		keys.push(...k);
		if (cursorEnd !== "0") return this.getKeys(client, pattern, cursorEnd, keys, maxPerRun);
		// by design duplicate keys can be returned
		else return Array.from(new Set(keys));
	}

	/**
	 * @typedef {object} CPUInfo
	 * @prop {number} idle
	 * @prop {number} total
	 * @prop {number} idleAverage
	 * @prop {number} totalAverage
	 */

	/**
	 * Get info about the CPU.
	 *
	 * @static
	 * @returns {CPUInfo}
	 * @memberof Utility
	 * @example Utility.getCPUInfo();
	 */
	static getCPUInfo() {
		const c = os.cpus();

		let total = 0, idle = 0;

		for (const { times } of c) {
			Object.values(times).map((t) => total += t);
			idle += times.idle;
		}

		return {
			idle,
			total,
			idleAverage:  (idle / c.length),
			totalAverage: (total / c.length)
		};
	}

	/**
	 * Get CPU Usage.
	 *
	 * @static
	 * @returns {number}
	 * @memberof Utility
	 * @example getCPUUsage();
	 */
	static async getCPUUsage() {
		const { idleAverage: i1, totalAverage: t1 } = this.getCPUInfo();
		//                                           what (https://butts-are.cool/Code_-_Insiders_07-22-2021_08-25-55.png)
		await new Promise((a) => setTimeout(a, 1e3, undefined));
		const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

		return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
	}

	/**
	 * chose a value with the provided bias
	 *
	 * @static
	 * @template K
	 * @param {Array<string>} values - the values to pick from
	 * @param {Array<number>} weights - the weight of the values
	 * @returns {K}
	 * @memberof Utility
	 * @example chooseWeighted([1,2,3,4], [60, 10, 25, 5])
	 */
	static chooseWeighted<K extends symbol | string | number = symbol | string | number>(values: Array<K>, weights: Array<number>): K;
	/** @deprecated candidate for removal */
	static chooseWeighted<K extends symbol | string | number = symbol | string | number>(values: Record<K, number>): K;
	static chooseWeighted<K extends symbol | string | number = symbol | string | number>(values: Record<K, number> | Array<K>, weights?: Array<number>) {
		if (typeof values === "object" && values.constructor.name === "Object") {
			if (!warningEmitted) {
				process.emitWarning("Utility#chooseWeighted called with deprecated key-value pair");
				warningEmitted = true;
			}
			weights = Object.values(values as Record<K, number>);
			values = Object.keys(values) as Array<K>;
		}
		assert(is<Array<string>>(values));
		assert(is<Array<K>>(weights));
		const sum = weights.reduce((a, b) => a + b, 0);
		let b = 0;
		weights = weights.map((a) => (b = a + b));
		const rand = Math.random() * sum;
		return values[weights.filter((el) => el <= rand).length] as K;
	}

	/**
	 * Merge two objects into one
	 *
	 * @deprecated candidate for removal
	 * @param {A} a - The object to merge properties on to
	 * @param {B} b - The object to merge properties from
	 * @template A
	 * @template B
	 * @returns {A & B}
	 */
	// I hate the way this function looks, but I would much rather do all of that than rewrite this function to be properly typesafe
	static mergeObjects<A extends AnyObject, B extends AnyObject>(a: A, b: B) {
		// avoid references
		const obj = JSON.parse(JSON.stringify(a)) as A & B,
			c = obj as AnyObject,
			d = a as AnyObject,
			e = b as AnyObject;
		for (const k of Object.keys(b)) {
			// handling arrays is a tricky thing since we can't just merge them because of duplicates, so we'll just assume arrays will be zero length if they're "wrong"
			if (Array.isArray(e[k])) c[k] = d[k] && (d as AnyObject<string>)[k]?.length !== 0 ? d[k] : e[k];
			else if (typeof e[k] === "object" && e[k] !== null) {
				if (typeof d[k] !== "object" || d[k] === null) d[k] = {};
				c[k] = this.mergeObjects((d as AnyObject<AnyObject>)[k], (e as AnyObject<AnyObject>)[k]);
			} else c[k] = typeof d[k] === "undefined" ? e[k] : d[k];
		}

		return obj;
	}
}
