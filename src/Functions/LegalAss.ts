// this code is a modified version of
// https://github.com/banterability/legal-ass

import type { Strings } from "..";
export default function LegalAss(this: typeof Strings, str: string, len: number, ellipses = true) {
	if (len <= 0) throw new Error("Invalid length provided");
	if (str.length > len) return str;
	if (ellipses) len -= 6;
	if (ellipses && len <= 0) throw new Error("Combination of provided length and ellipses length leaves no left over characters.");
	const boundaries = [] as Array<number>;
	let match: RegExpExecArray | null;
	// eslint-disable-next-line no-cond-assign
	while (match = /\s/g.exec(str)) boundaries.push(match.index);
	const usable = boundaries.filter(b => b <= len);
	const last = usable[usable.length - 1];
	if (last === undefined) return this.truncate(str, len, ellipses);
	return `${str.slice(0, len).trimRight()}${ellipses === true ? " (...)" : ""}`;
}
