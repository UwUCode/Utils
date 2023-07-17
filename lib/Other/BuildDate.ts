import Time from "../Functions/Time.js";
import { access, readFile, writeFile } from "node:fs/promises";

export default async function buildDate(dir: string) {
    const d = Date.now();
    const pkg = await readFile(`${dir}/package.json`, "utf8").then(JSON.parse) as { buildDate: number | null; };
    if (pkg.buildDate !== undefined && pkg.buildDate !== null && typeof pkg.buildDate !== "number") {
        console.log("Current build date is invalid, discarding.");
        pkg.buildDate = null;
    }
    console.log("Current Build Date:", pkg.buildDate === null ? "Unknown" : Time.formatDateWithPadding({ date: pkg.buildDate }));
    pkg.buildDate = d;
    console.log("New Build Date:", pkg.buildDate === null ? "Unknown" : Time.formatDateWithPadding({ date: d }));
    await writeFile(`${dir}/package.json`, JSON.stringify(pkg, undefined, "  "));
    // if built, write to build dir as well
    if (await access(`${dir}/dist/package.json`).then(() => true, () => false)) {
        await writeFile(`${dir}/dist/package.json`, JSON.stringify(pkg, undefined, "  "));
    }

}
