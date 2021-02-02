import * as os from "os";
import y from "yargs";
import Redis from "../Other/Redis";

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
	static toStringFormat<T extends object>(d: T, names: {
		test<T>(obj: T): boolean;
		props: string[];
	}[]) {
		function format(obj: T, props: string[]) {
			const str: [string, string][] = [] as any;
			for (const p of props) {
				if ((obj as any)[p] instanceof Object) {
					let f = false;
					for (const o of names) {
						if (o.test((obj as any)[p])) {
							f = true;
							str.push([p, format((obj as any)[p], o.props)]);
						} else continue;
					}
					if (!f) str.push([p, (obj as any)[p].toString()]);
				} else str.push([p, (obj as any)[p]]);
			}

			return `<${obj.constructor.name}${str.reduce((a, b) => typeof b[1] === "string" && ["<"].some(j => !b[1].startsWith(j)) ? `${a} ${b[0]}="${b[1]}"` : `${a} ${b[0]}=${b[1]}`, "")}>`;
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
	static getLongestString(arr: (string | number)[]) {
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
	static getPercents(arr: number[]) {
		const total = arr.reduce((a, b) => a + b, 0);
		const a: {
			input: number;
			percent: string;
		}[] = [];
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
	static async getKeys(pattern: string, cur: string, keys = [] as string[], maxPerRun = 10000): Promise<string[]> {
		if (!Redis.initialized) throw new TypeError("Redis has not been initialized.");
		const s = await Redis.r.scan(cur, "MATCH", pattern, "COUNT", maxPerRun);
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
			Object.values(times).map(t => total += t);
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
		await new Promise((a, b) => setTimeout(a, 1e3));
		const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

		return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
	}

	static chooseWeighted<K extends string = string>(values: {
		[k in K]: number;
	}) {
		const items = Object.keys(values);
		let chances: number[] = Object.values(values);
		const sum = chances.reduce((a, b) => a + b, 0);
		let b = 0;
		chances = chances.map(a => (b = a + b));
		const rand = Math.random() * sum;
		return items[chances.filter(el => el <= rand).length] as K;
	}

	/**
	 * Merge two objects into one
	 * @param {A} a - The object to merge properties on to
	 * @param {B} b - The object to merge properties from
	 * @template A
	 * @template B
	 */
	static mergeObjects<A extends object, B extends object>(a: A, b: B) {
		// avoid references
		const obj = JSON.parse(JSON.stringify(a)) as A & B;

		// I hate this, but I would much rather do that than rewrite this function
		const c = obj as any;
		const d = a as any;
		const e = b as any;
		for (const k of Object.keys(b)) {
			// handling arrays is a tricky thing since we can't just merge them because of duplicates, so we'll just assume arrays will be zero length if they're "wrong"
			if (Array.isArray(e[k])) c[k] = d[k] && d[k]?.length !== 0 ? d[k] : e[k];
			else if (typeof e[k] === "object" && e[k] !== null) {
				if (typeof d[k] !== "object" || d[k] === null) d[k] = {};
				c[k] = this.mergeObjects(d[k], e[k]);
			} else c[k] = typeof d[k] === "undefined" ? e[k] : d[k];
		}
		return obj;
	}

	static average<O extends { time: number; type: T; } = any, T extends string = string>(items: O[], sampleSize?: number, type?: T) {
		const s: {
			[k: number]: number;
		} = {};
		if (type) items = items.filter(i => i.type === type);

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
}
