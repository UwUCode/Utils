#!/usr/bin/env node
import { access } from "fs/promises";
import buildDate from "../dist/Other/BuildDate.js";

console.log(buildDate);
if(process.argv[2] === undefined || !await access(process.argv[2]).then(() => true, () => false)) {
    console.error("Invalid path");
    process.exit(1);
}

await buildDate(process.argv[2]);
