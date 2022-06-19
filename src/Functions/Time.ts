import type { MsOptions, MsResponse as RawMS, MsBigInt as RawMSBigInt, MsResponse } from "../types";
import ms from "ms";
import chunk from "chunk";


export default class Time {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Convert milliseconds into readable time.
	 *
	 * @static
	 * @param {(Number | BigInt)} time - The time to convert.
	 * @param {boolean} [words=false] - If we should return full words or just letters.
	 * @param {boolean} [seconds=true] - If we should return seconds.
	 * @param {boolean} [millis=false] - If we should return milliseconds.
	 * @returns {(Promise<string | RawMS>)}
	 * @memberof Time
	 * @example ms(120000);
	 * @example ms(240000, true);
	 */
	static ms<R extends boolean = false>(time: number | bigint, options?: MsOptions<R>): R extends false ? string : RawMS;
	static ms<R extends boolean = false>(time: number | bigint, options: MsOptions<R> = {}): string | RawMS {
		if (typeof time !== "bigint") time = BigInt(Math.floor(time));
		options = options ?? {};
		options = {
			words:     false,
			seconds:   true,
			ms:        false,
			shortMS:   true,
			raw:       false as R,
			monthAbbr: "mn",
			...options
		};
		const r: RawMSBigInt = {
			milliseconds: 0n,
			seconds:      0n,
			minutes:      0n,
			hours:        0n,
			days:         0n,
			months:       0n,
			years:        0n
		};
		const convert = (obj: RawMSBigInt) => Object.entries(obj).map(([key, value]) => ({ [key]: Number(value) })).reduce((a, b) => ({ ...a, ...b }), {}) as unknown as MsResponse;
		if (time < 0n) throw new TypeError("Negative time provided.");
		if (time === 0n) {
			if (options.raw) return convert(r);
			else return options.words ? "0 seconds" : "0s";
		}
		// Number.EPSILON = https://stackoverflow.com/a/11832950
		r.milliseconds = time % 1000n;
		r.years = time / 31540000000n;
		time -= r.years * 31540000000n;
		r.months = time / 2628000000n;
		time -= r.months * 2628000000n;
		r.days = time / 86400000n;
		time -= r.days * 86400000n;
		r.hours = time / 3600000n;
		time -= r.hours * 3600000n;
		r.minutes = time / 60000n;
		time -= r.minutes * 60000n;
		r.seconds = time / 1000n;
		time -= r.seconds * 1000n;

		const total = (Object.values(r) as Array<bigint>).reduce((a, b) => a + b, 0n);
		if (options.raw) return convert(r);
		else {
			if (!options.ms && r.milliseconds === total) return options.words ? "less than one second" : "none";
			if (!options.seconds && r.seconds === total) return options.words ? "less than one minute" : "none";
		}

		const str: Array<string> = [];
		if (r.milliseconds > 0 && options.ms) str.push(`${r.milliseconds}${options.words && !options.shortMS ? ` millisecond${r.milliseconds === 1n ? "" : "s "}` : "ms"}`);
		if (r.seconds > 0 && options.seconds) str.push(`${r.seconds}${options.words ? ` second${r.seconds === 1n ? "" : "s"}` : "s"}`);
		if (r.minutes > 0) str.push(`${r.minutes}${options.words ? ` minute${r.minutes === 1n ? "" : "s"}` : "m"}`);
		if (r.hours > 0) str.push(`${r.hours}${options.words ? ` hour${r.hours === 1n ? "" : "s"}` : "h"}`);
		if (r.days > 0) str.push(`${r.days}${options.words ? ` day${r.days === 1n ? "" : "s"}` : "d"}`);
		if (r.months > 0) str.push(`${r.months}${options.words ? ` month${r.months === 1n ? "" : "s"}` : options.monthAbbr!}`);
		if (r.years > 0) str.push(`${r.years}${options.words ? ` year${r.years === 1n ? "" : "s"}` : "y"}`);

		if (options.words && str.length > 1) str[0] = `and ${str[0]}`;

		return  str.reverse().join(" ");
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
			case "ms": return input < 1000 ? `${input}ms` : this.ms(input, { words: true, seconds: true, ms: true });
			case "mi": return input < 1000 ? `${input}µs` : this.convert(input / 1000, "ms", dec);
			case "ns": return input < 1000 ? `${input}ns` : this.convert(input / 1000, "mi", dec);
			default: return `${input}${type as string}`;
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
		const v = Time.ms(t, { words: true, seconds });
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
	 * @example formatDateWithPadding();
	 * @example formatDateWithPadding(new Date());
	 * @example formatDateWithPadding(new Date(), true);
	 * @example formatDateWithPadding(new Date(), true, true);
	 */
	// @TODO convert options to object
	static formatDateWithPadding(d: Date | number = new Date(), hms = true, millis = false, words = false) {
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
		if (words) return `${days[d.getDay()]} ${months[d.getMonth()]} ${(d.getDate()).toString().padStart(2, "0")}, ${d.getFullYear()} ${h  === 0 ? 12 : h.toString().padStart(2, "0")}:${d.toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
		else return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${(d.getDate()).toString().padStart(2, "0")}/${d.getFullYear()}${hms ? ` ${(h  === 0 ? 12 : h).toString().padStart(2, "0")}:${(d.getMinutes()).toString().padStart(2, "0")}:${(d.getSeconds()).toString().padStart(2, "0")}` : ""}${millis ? `.${(d.getMilliseconds()).toString().padStart(3, "0")}` : ""}`;
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
		const hours: number = Math.floor(sec / 3600),
			minutes: number = Math.floor((sec - (hours * 3600)) / 60),
			seconds: number = Math.floor(sec - (hours * 3600) - (minutes * 60));

		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	/**
	 * Parse a string into milliseconds
	 *
	 * @deprecated candidate for removal
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
	 * @deprecated candidate for removal
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
}
