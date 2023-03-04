import type { AnyObject } from "@uwu-codes/types";
import type Redis from "ioredis";
import { cpus } from "node:os";

export default class Utility extends null {
    /**
     * chose a value with the provided bias.
     * @param values The values to pick from.
     * @param weights The weight of the values.
     */
    static chooseWeighted<K extends symbol | string | number = symbol | string | number>(values: Array<K>, weights: Array<number>): K;
    static chooseWeighted<K extends symbol | string | number = symbol | string | number>(values: Array<K>, weights: Array<number>) {
        const sum = weights.reduce((a, b) => a + b, 0);
        let b = 0;
        weights = weights.map(a => (b = a + b));
        const rand = Math.random() * sum;
        return values[weights.filter(el => el <= rand).length];
    }

    /** Get info about the CPU. */
    static getCPUInfo() {
        const c = cpus();

        let total = 0, idle = 0;

        for (const { times } of c) {
            Object.values(times).map(t => total += t);
            idle += times.idle;
        }

        return {
            idle,
            total,
            idleAverage:  (idle / c.length),
            totalAverage: (total / c.length)
        };
    }

    /** Get CPU Usage. */
    static async getCPUUsage() {
        const { idleAverage: i1, totalAverage: t1 } = this.getCPUInfo();
        //                                           what (https://butts-are.cool/Code_-_Insiders_07-22-2021_08-25-55.png)
        await new Promise(a => setTimeout(a, 1e3));
        const { idleAverage: i2, totalAverage: t2 } = this.getCPUInfo();

        return (10000 - Math.round(10000 * (i2 - i1) / (t2 - t1))) / 100;
    }

    /**
     * Get SCAN to get keys in a redis database.
     * @param client The redis client to use.
     * @param pattern The seatch pattern to use.
     * @param maxPerRun The maximum amount of keys to fetch per round.
     * @param cursorStart Internal use only.
     * @param keys Internal use only, provide undefined or an empty array.
     * @deprecated candidate for removal
     */
    static async getKeys(client: Redis, pattern: string, maxPerRun = 2500, cursorStart = "0", keys = [] as Array<string>): Promise<Array<string>> {
        const [cursorEnd, k] = await client.scan(cursorStart, "MATCH", pattern, "COUNT", maxPerRun);
        keys.push(...k);
        return cursorEnd === "0" ? Array.from(new Set(keys)) : this.getKeys(client, pattern, maxPerRun, cursorEnd, keys);
    }

    /**
     * Get the longest string in an array.
     * @param arr The array to check.
     */
    static getLongestString(arr: Array<string | number>) {
        let longest = 0;
        for (const v of arr) {
            if (v.toString().length > longest) {
                longest = v.toString().length;
            }
        }
        return longest;
    }

    /**
     * Convert an array of numbers into percentages.
     * @param arr The array to convert.
     */
    static getPercents(arr: Array<number>) {
        const total = arr.reduce((a, b) => a + b, 0),
            a: Array<{
                input: number;
                percent: string;
            }> = [];
        for (const v of arr) {
            let s = (Math.round(((v / total) * 100) * 10) / 10).toString();
            s = s.includes(".") ? s.padStart(4, "0") : s.padStart(2, "0");

            s = s.padEnd(4, ".0");
            a.push({
                input:   v,
                percent: s
            });
        }
        return a;
    }

    /**
     * Convert a class to a string format (usually for eval returns).
     * @param clazz - The class.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toStringFormat<T = any>(clazz: T, names: Array<{
        props: Array<string>;
        test<V>(obj: V): boolean;
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
                        } else {
                            continue;
                        }
                    }

                    if (!f) {
                        str.push([p, (obj as AnyObject<string>)[p].toString()]);
                    }
                } else {
                    str.push([p, (obj as AnyObject<string>)[p]]);
                }
            }


            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            return `<${obj.constructor.name}${str.reduce((a, b) => typeof b[1] === "string" && ["<"].some(j => !b[1].startsWith(j)) ? `${a} ${b[0]}="${b[1]}"` : `${a} ${b[0]}=${b[1]}`, "")}>`;
        }

        for (const o of names) {
            if (o.test(clazz)) {
                return format(clazz, o.props);
            } else {
                continue;
            }
        }

        return String(clazz);
    }
}
