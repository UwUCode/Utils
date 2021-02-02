import * as pkg from "../../package.json"

export default class Variables {
	private constructor() { }

	static USER_AGENT = `@donovan_dmc\\utils/${pkg.version} (https://github.com/DonovanDMC)`;
	static USER_KEY: string | null = null;
	static DEV_KEY: string | null = null;
	static REDIS: import("ioredis").Redis | null = null;
}
