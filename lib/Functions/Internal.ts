import type { DiskUsage } from "../types";
import { exec } from "node:child_process";
import { EOL } from "node:os";

export default class Internal extends null {
    /** Get the local disk usage. */
    static async getDiskUsage(): Promise<DiskUsage> {
        // UNIX = df -Pk "/"
        // WINDOWS = wmic logicaldisk get size,freespace,caption

        const drives: Record<string, {
                free: number;
                total: number;
            }> = {},
            unix = process.platform !== "win32",
            out = await new Promise<Array<Array<string>>>((resolve, reject) => exec(unix ? "df -Pk \"/\"" : "wmic logicaldisk get size,freespace,caption", (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }
                resolve(
                    (stdout + stderr)
                        .split(EOL)
                        .slice(1)
                        .map(v => v.trim().split(/\s+(?=[\d/])/))
                        .filter(v => v.length !== 0 && v[0] !== "")
                );
            }));

        for (const line of out) {
            if (unix) {
                drives[line[5]] = {
                    free:  Number(line[3]) * 1024,
                    total: Number(line[1]) * 1024
                };
            } else {
                drives[line[0]] = {
                    free:  Number(line[1]),
                    total: Number(line[2])
                };
            }
        }

        return {
            drives,
            unix
        };
    }
}
