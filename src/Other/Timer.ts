import Time from "../Functions/Time";

export default class Timer {
	static getTime() { return process.hrtime.bigint(); }
	/** @deprecated candidate for removal */
	static get start() { return this.getTime.bind(this); }
	/** @deprecated candidate for removal */
	static get end() { return this.getTime.bind(this); }

	static calc(start: bigint, end: bigint, dec: number, raw: false): string;
	static calc(start: bigint, end: bigint, dec: number, raw?: true): number;
	static calc(start: bigint, end: bigint, dec = 3, raw = true) {
		const v = Number(end - start);
		return raw === true ? parseFloat((v).toFixed(dec)) : Time.convert(parseFloat((v).toFixed(dec)), "ns", dec);
	}
}
