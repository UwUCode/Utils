import { access, readFile, writeFile } from "node:fs/promises";

export default async function buildDate(dir: string) {
    const pkg = await readFile(new URL("package.json", dir), "utf8").then(JSON.parse) as { buildDate: string | null; };
    console.log("Current Build Date:", pkg.buildDate === null ? "Unknown" : `${String(pkg.buildDate).slice(0, 2)}/${String(pkg.buildDate).slice(2, 4)}/${String(pkg.buildDate).slice(4, 8)}`);
    const d = new Date();
    (pkg.buildDate) = `${d.getMonth().toString().padStart(2, "0")}${(d.getDate() + 1).toString().padStart(2, "0")}${d.getFullYear()}`;
    console.log("New Build Date:", pkg.buildDate === null ? "Unknown" : `${String(pkg.buildDate).slice(0, 2)}/${String(pkg.buildDate).slice(2, 4)}/${String(pkg.buildDate).slice(4, 8)}`);
    await writeFile(new URL("package.json", dir), JSON.stringify(pkg, undefined, "  "));
    // if built, write to build dir as well
    if (await access(new URL("dist", dir)).then(() => true, () => false)) {
        await writeFile(new URL("dist/package.json", dir), JSON.stringify(pkg, undefined, "  "));
    }

}
