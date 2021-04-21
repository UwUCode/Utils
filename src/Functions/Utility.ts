import { AnyObject } from "../Other/Types";
import { Variables } from "..";
import * as os from "node:os";

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
	static toStringFormat<T extends AnyObject = AnyObject>(d: T, names: Array<{
		test<V>(obj: V): boolean;
		props: Array<string>;
	}>) {
		function format(obj: AnyObject, props: Array<string>) {
			const str: Array<[string, string]> = [];
			for (const p of props) {
				if (obj[p] instanceof Object) {
					let f = false;
					for (const o of names) {
						if (o.test(obj[p])) {
							f = true;
							str.push([p, format(obj[p] as AnyObject, o.props)]);
						} else continue;
					}

					if (!f) str.push([p, (obj as AnyObject<string>)[p].toString()]);
				} else str.push([p, (obj as AnyObject<string>)[p]]);
			}


			return `<${obj.constructor.name}${str.reduce((a, b) => typeof b[1] === "string" && ["<"].some((j) => !b[1].startsWith(j)) ? `${a} ${b[0]}="${b[1]}"` : `${a} ${b[0]}=${b[1]}`, "")}>`;
		}

		for (const o of names) {
			if (o.test(d)) return format(d, o.props);
			else continue;
		}


		return d.toString();
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
			if (s.indexOf(".") === -1) s = s.padStart(2, "0");
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
	 * @param {string} pattern - The seatch pattern to use.
	 * @param {(number | string)} cur - Internal use only, provide "0".
	 * @param {string[]} [keys] - Internal use only, Provide none or null.
	 * @param {number} [maxPerRun] - The maximum amount of keys to fetch per round.
	 * @returns {Promise<string[]>}
	 * @memberof Utility
	 * @example Utility.getKeys("some:pattern", "0");
	 * @example Utility.getKeys("some:pattern", "0", null, 10000);
	 */
	static async getKeys(pattern: string, cur = "0", keys = [] as Array<string>, maxPerRun = 10000): Promise<Array<string>> {
		if (!Variables.REDIS) throw new TypeError("Redis has not been initialized.");
		const s = await Variables.REDIS.scan(cur, "MATCH", pattern, "COUNT", maxPerRun);
		keys.push(...s[1]);
		if (s[0] !== "0") return this.getKeys(pattern, s[0], keys, maxPerRun);
		else return keys;
	}

	/**
	 * @typedef {object} LogErrorResult
	 * @prop {Eris.Message<Eris.TextableChannel>} message
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
		await new Promise((a) => setTimeout(a, 1e3));
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
		const s: {
			[k: number]: number;
		} = {};
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
}
