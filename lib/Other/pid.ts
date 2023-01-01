import { rmSync } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export default async function pid(path: string) {
    const b = dirname(path);
    if (!await access(b).then(() => true, () => false)) {
        await mkdir(b, { recursive: true });
    }
    await writeFile(path, process.pid.toString());
    // some handlers do not support async code
    function remove(type: string | null) {
        try {
            rmSync(path, { force: true });
        } catch {
            // ignore
        }
        process.kill(process.pid, type ?? undefined);
    }

    process
        .once("SIGINT", remove.bind(null, "SIGINT"))
        .once("SIGHUP", remove.bind(null, "SIGHUP"))
        .once("SIGQUIT", remove.bind(null, "SIGQUIT"))
        .once("SIGTERM", remove.bind(null, "SIGTERM"))
        .once("exit", remove.bind(null, null));
}
