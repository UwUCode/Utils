import ms from "ms";
import chunk from "chunk";
import type { AnyObject } from "@uwu-codes/types";

export interface MsResponse {
	ms: number;
	s: number;
	m: number;
	h: number;
	d: number;
	mn: number;
	y: number;
}


export default class Time {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Convert milliseconds into readable time.
	 *
	 * @static
	 * @param {number} time - The time to convert.
	 * @param {boolean} [words=false] - If we should return full words or just letters.
	 * @param {boolean} [seconds=true] - If we should return seconds.
	 * @param {boolean} [millis=false] - If we should return milliseconds.
	 * @returns {(Promise<string | MsResponse>)}
	 * @memberof Time
	 * @example Time.ms(120000);
	 * @example Time.ms(240000, true);
	 */
	static ms(time: number, words?: boolean, seconds?: boolean, millis?: boolean, obj?: false): string;
	static ms(time: number, words: boolean, seconds: boolean, millis: boolean, obj: true): MsResponse;
	static ms(time: number, words = false, seconds = true, millis = false, obj = false) {
		if (time < 0) throw new TypeError("Negative time provided.");
		// @FIXME language :sweats:
		if (time === 0) return words ? "0 seconds" : "0s";
		const r = {
			// Number.EPSILON = https://stackoverflow.com/a/11832950
			ms: Math.round(((time % 1000) + Number.EPSILON) * 100) / 100,
			s: 0,
			m: 0,
			h: 0,
			d: 0,
			mn: 0,
			y: 0
		};
		r.y = Math.floor(time / 3.154e+10);
		time -= r.y * 3.154e+10;
		r.mn = Math.floor(time / 2.628e+9);
		time -= r.mn * 2.628e+9;
		r.d = Math.floor(time / 8.64e+7);
		time -= r.d * 8.64e+7;
		r.h = Math.floor(time / 3.6e+6);
		time -= r.h * 3.6e+6;
		r.m = Math.floor(time / 6e4);
		time -= r.m * 6e4;
		r.s = Math.floor(time / 1e3);
		time -= r.s * 1e3;

		if (obj) return r;

		const str: Array<string> = [];
		if (r.ms > 0 && ms) str.push(`${r.ms} millisecond${r.ms === 1 ? "" : "s"}`);
		if (r.s > 0) str.push(`${r.s} second${r.s === 1 ? "" : "s"}`);
		if (r.m > 0) str.push(`${r.m} minute${r.m === 1 ? "" : "s"}`);
		if (r.h > 0) str.push(`${r.h} hour${r.h === 1 ? "" : "s"}`);
		if (r.d > 0) str.push(`${r.d} day${r.d === 1 ? "" : "s"}`);
		if (r.mn > 0) str.push(`${r.mn} month${r.mn === 1 ? "" : "s"}`);
		if (r.y > 0) str.push(`${r.y} year${r.y === 1 ? "" : "s"}`);

		if (words && str.length > 1) str[0] = `and ${str[0]}`;

		if (!seconds) {
			if (words) {
				const e = str.find((v) => v.includes("second"));
				if (e) {
					str.splice(str.indexOf(e), 1);
					if (str.length < 1) str.push("less than 1 minute");
				}
			} else delete (r as AnyObject<number>).s;
		}


		if (!millis) {
			if (words) {
				const e = str.find((v) => v.includes("millisecond"));
				if (e) {
					str.splice(str.indexOf(e), 1);
					if (str.length < 1) str.push("less than 1 second");
				}
			} else {
				delete (r as AnyObject<number>).ms;
			}
		}


		return words ? str.reverse().join(", ") : Object.keys(r).filter((k) => (r as AnyObject<number>)[k] > 0).map((k) => `${Math.floor((r as AnyObject<number>)[k])}${k}`).reverse().reduce((a, b) => a + b, "");
	}

	/**
	 * Convert ms/mi/ns to the highest possible value
	 *
	 * @param {number} input
	 * @param {("ms" | "mi" | "ns")} type
	 * @returns {string}
	 */
	static convert(input: number, type: "ms" | "mi" | "ns", dec = 3): string {
		input = parseFloat(input.toFixed(dec));
		switch (type) {
			case "ms": return input < 1000 ? `${input}ms` : this.ms(input, true, true, true);
			case "mi": return input < 1000 ? `${input}µs` : this.convert(input / 1000, "ms", dec);
			case "ns": return input < 1000 ? `${input}ns` : this.convert(input / 1000, "mi", dec);
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			default: return `${input}${type}`;
		}
	}

	/**
	 * Format milliseconds ago.
	 *
	 * @static
	 * @param {(number | Date)} t - The milliseconds to format.
	 * @param {boolean} [sub] - If we should sub the ms provided from the current time.
	 * @param {boolean} [seconds] - If seconds should be included in the return.
	 * @param {boolean} [firstOnly] - if only the first value should be returned
	 * @returns {string}
	 * @memberof Time
	 * @example()
	 */
	static formatAgo(t: number | Date, sub?: boolean, seconds?: boolean, firstOnly?: boolean) {
		if (t instanceof Date) t = t.getTime();
		if (sub) t = Date.now() - t;
		const v = Time.ms(t, true, seconds);
		return `${firstOnly ? v.split(",")[0] : v} ago`;
	}

	/**
	 * format a date into dd/mm/yyyy hh:mm:ss.ms
	 *
	 * @static
	 * @param {(Date | number)} [d=new Date()] - The date to format.
	 * @param {boolean} [hms=true] - If hh:mm:ss should be returned.
	 * @param {boolean} [millis=false] - If milliseconds should be returned.
	 * @returns {string}
	 * @memberof Time
	 * @example Time.formatDateWithPadding();
	 * @example Time.formatDateWithPadding(new Date());
	 * @example Time.formatDateWithPadding(new Date(), true);
	 * @example Time.formatDateWithPadding(new Date(), true, true);
	 */
	static formatDateWithPadding(d: Date | number = new Date(), hms = true, millis = false, words = false, useLang = false) {
		if (typeof d === "number") d = new Date(d);
		const months = [
				"January", "February", "March", "April",
				"May", "June", "July", "August",
				"September", "October", "November", "December"
			],
			days = [
				"Sunday", "Monday", "Tuesday",
				"Wednesday", "Thursday", "Friday",
				"Saturday"
			],
			h = d.getHours() % 12;
		if (words) return `${useLang ? `{lang:other.dayOfWeek.${d.getDay()}}` : days[d.getDay()]} ${useLang ? `{lang:other.months.${d.getMonth()}}` : months[d.getMonth()]} ${(d.getDate()).toString().padStart(2, "0")}, ${d.getFullYear()} ${h  === 0 ? 12 : h} ${useLang ? `{lang:other.words.${d.getHours() < 12 ? "am" : "pm"}$upper$}` : d.getHours() < 12 ? "AM" : "PM"}`;
		else return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${(d.getDate()).toString().padStart(2, "0")}/${d.getFullYear()}${hms ? ` ${(h  === 0 ? 12 : h).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${millis ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`;
	}

	/**
	 * Convert seconds to HH:MM:SS
	 *
	 * @static
	 * @param {number} sec - The seconds to convert.
	 * @returns {string}
	 * @memberof Time
	 * @example Time.secondsToHMS(1800);
	 */
	static secondsToHMS(sec: number) {
		let hours: string | number = Math.floor(sec / 3600),
			minutes: string | number = Math.floor((sec - (hours * 3600)) / 60),
			seconds: string | number = Math.floor(sec - (hours * 3600) - (minutes * 60));

		if (hours < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Parse a string into milliseconds
	 *
	 * @param {string} str - the string to parse
	 * @returns {number}
	 */
	static parseTime(str: string) {
		return str
			.split(",")
			.map((v) => ms(v.replace(/and/gi, "").toLowerCase().trim()))
			.filter((v) => v !== undefined)
			.reduce((a, b) => a + b, 0);
	}

	/**
	 * Parse time, but with proper word support (experimental!)
	 *
	 * @param {string} str - The string to parse
	 * @returns {number}
	 */
	static parseTime2(str: string) {
		if (!str) return 0;
		const s = str.replace(/and/gi, "").toLowerCase().trim().split(" ").filter(Boolean);
		if (s.length === 0) return ms(s[0]);
		let t = 0;
		// we run over them in pairs, since most people that will use "5 seconds" will
		// use the same for all values they provide
		chunk(s, 2).map(v => t += (ms(v.join(" ").trim()) ?? 0));
		// we run back over it for things like 5m, and we assume numbers on their own
		// had an identifier after, and were already handled
		s.map(v => t += !isNaN(Number(v.trim())) ? 0 : (ms(v.trim()) ?? 0));

		return t;
	}

	/**
	 * Get the number of days in a given month.
	 *
	 * Not zero based.
	 *
	 * @static
	 * @param {number} month
	 * @returns {number}
	 * @memberof Internal
	 * @example Time.getDaysInMonth(2);
	 */
	static getDaysInMonth(month: number) {
		return new Date(new Date().getFullYear(), month, 0).getDate();
	}

	/**
	 * Convert a date object into DD/MM/YYYY HH:MM:SS
	 *
	 * @param {(Date | number | string)} d - The object to convert
	 * @returns {string}
	 */
	static dateToReadable(d: Date | number | string) {
		if (!(d instanceof Date)) d = new Date(d);
		return `${[d.getMonth().toString().padStart(2, "0"),
			(d.getDate() + 1).toString().padStart(2, "0"),
			d.getFullYear()].join("/")} ${[
			d.getHours().toString().padStart(2, "0"),
			d.getMinutes().toString().padStart(2, "0"),
			d.getSeconds().toString().padStart(2, "0")].join(":")}`;
	}
}
