import type { AnyObject } from "@uwu-codes/types";
import type IORedis from "ioredis";
import * as os from "os";
import { URL } from "url";

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
				input: v,
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
	 * @param {IORedis.Redis} client - the redis client to use
	 * @param {string} pattern - The seatch pattern to use.
	 * @param {string} [cursorStart="0"] - Internal use only.
	 * @param {Array<string>} [keys=[]] - Internal use only, provide undefined or an empty array.
	 * @param {number} [maxPerRun=2500] - The maximum amount of keys to fetch per round.
	 * @returns {Promise<Array<string>>}
	 * @memberof Utility
	 * @example Utility.getKeys("some:pattern":*);
	 * @example Utility.getKeys("some:*:pattern", undefined, undefined, 10000);
	 */
	static async getKeys(client: IORedis.Redis, pattern: string, cursorStart = "0", keys = [] as Array<string>, maxPerRun = 2500): Promise<Array<string>> {
		const [cursorEnd, k] = await client.scan(cursorStart, "MATCH", pattern, "COUNT", maxPerRun);
		keys.push(...k);
		if (cursorEnd !== "0") return this.getKeys(client, pattern, cursorEnd, keys, maxPerRun);
		// by design duplicate keys can be returned
		else return this.dedupeArray(keys);
	}

	/**
	 * @typedef {object} LogErrorResult
	 * @prop {import("eris").Message<import("eris").TextableChannel>} message
	 * @prop {string} code
	 */

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
			idleAverage: (idle / c.length),
			totalAverage: (total / c.length)
		};
	}

	/**
	 * Get CPU Usage.
	 *
	 * @static
	 * @returns {number}
	 * @memberof Utility
	 * @example Utility.getCPUUsage();
	 */
	static async getCPUUsage() {
		const { idleAverage: i1, totalAverage: t1 } = this.getCPUInfo();
		//                                           what (https://butts-are.cool/Code_-_Insiders_07-22-2021_08-25-55.png)
		await new Promise((a) => setTimeout(a, 1e3, undefined));
		const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

		return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
	}

	static chooseWeighted<K extends string = string>(values: {
		[k in K]: number;
	}) {
		const items = Object.keys(values);
		let chances: Array<number> = Object.values(values);
		const sum = chances.reduce((a, b) => a + b, 0);
		let b = 0;
		chances = chances.map((a) => (b = a + b));
		const rand = Math.random() * sum;
		return items[chances.filter((el) => el <= rand).length] as K;
	}

	/**
	 * Merge two objects into one
	 *
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

	static average<O extends { time: number; type: T; } = never, T extends string = string>(items: Array<O>, sampleSize?: number, type?: T) {
		const s: Record<number, number> = {};
		if (type) items = items.filter((i) => i.type === type);

		for (const v of items) {
			const sec = Number(Math.floor(v.time / 1000).toString().slice(-1));
			if (!s[sec]) s[sec] = 0;
			s[sec]++;
		}

		const sample = Object.values(s).slice(0, sampleSize);

		return {
			avg: Math.floor(sample.reduce((a, b) => a + b, 0) / sample.length) || 0,
			sample
		};
	}

	static roundExponent(exp: number, num: number) {
		return Math.pow(exp, Math.round(Math.log(num) / Math.log(exp)));
	}

	static calcHeightSlice(slices: number, height: number) {
		const res: Array<number> = [];
		for (let i = 1; i <= slices; i++) for (let ii = 1; ii <= slices; ii++) res.push((height / slices) * i);
		return res;
	}

	static calcWidthSlice(slices: number, width: number) {
		const res: Array<number> = [];
		for (let i = 1; i <= slices; i++) for (let ii = 1; ii <= slices; ii++) res.push((width / slices) * ii);
		return res;
	}

	static calcSlices(slicesH: number, slicesW: number, height: number, width: number): [height: Array<number>, width: Array<number>] {
		return [this.calcHeightSlice(slicesH, height), this.calcWidthSlice(slicesW, width)];
	}

	static calcSlicesSame(slices: number, height: number, width: number) {
		return this.calcSlices(slices, slices, height, width);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static definePropertyIfNotPresent<T>(obj: T, prop: PropertyKey, attr: PropertyDescriptor & ThisType<any>): boolean {
		if (prop in obj) return false;
		Object.defineProperty(obj, prop, attr);
		return true;
	}

	/**
	 * Check if the provided object is of the type
	 *
	 * @param {object} obj - the object to test
	 * @param {Function} type - the type to test against
	 * @returns
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	static isOfType<T extends Function>(obj: unknown, type: T): obj is T {
		return obj instanceof type;
	}

	/**
	 * Remove duplicates from an array
	 *
	 * @param {Array<any>} arr - the array to remove duplicates from
	 * @returns
	 */
	static dedupeArray<T>(arr: Array<T>): Array<T> {
		return Array.from(new Set(arr));
	}

	static esmDir(metaURL: string, ...parts: Array<string>) {
		return `${new URL(".", metaURL).pathname}${parts.join("/")}`;
	}
}
