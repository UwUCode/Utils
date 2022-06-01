import Time from "../Functions/Time";
import crypto from "crypto";

interface Timer {
	start: bigint | null;
	end: bigint | null;
}

/** @deprecated candidate for removal */
export default class Timers {
	id: string;
	private timers: Record<string, Timer>;
	private log: (label: string, info: string) => void;
	constructor(log?: ((label: string, info: string) => void) | boolean, id?: string) {
		this.id = id || crypto.randomBytes(10).toString("hex");
		this.timers = {};
		this.log = log === true ? (label: string, info: string) => console.debug(label, info) : log === false ? () => undefined : log as Timers["log"];
	}

	start(label: string) {
		if (Object.keys(this.timers).includes(label)) throw new TypeError(`Timer with the label "${label}" has already been started.`);
		// if (this.log) console.info(`Timers[${this.id}]`, `Timer with label ${label} started.`);
		const t = this.timers[label] = {
			start: process.hrtime.bigint(),
			end:   null
		};
		return t.start;
	}

	end(label: string, dec?: number) {
		if (!Object.keys(this.timers).includes(label)) throw new TypeError(`[${this.id}] Timer with the label "${label}" has not been started.`);
		if (this.timers[label].end !== null) throw new TypeError(`[${this.id}] Timer with the label "${label}" has already ended.`);

		this.timers[label].end = process.hrtime.bigint();
		this.log(`Timers[${this.id}]`, `${label} took ${this.calc(label, dec)}`);
		return this.timers[label].end!;
	}

	calc(label: string, dec: number | undefined, raw: true): number;
	calc(label: string, dec?: number, raw?: false): string;
	calc(label: string, dec?: number, raw = false) {
		const v = Number((this.timers[label]?.end ?? 0n) - (this.timers[label]?.start ?? 0n));
		return raw === true ? parseFloat((v).toFixed(dec)) : Time.convert(parseFloat((v).toFixed(dec)), "ns", dec);
	}
}
