import * as pkg from "../../package.json";

export default class Variables {

	static USER_AGENT = `@uwu-codes\\utils/${pkg.version} (https://github.com/DonovanDMC)`;
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	static REDIS: import("ioredis").Redis | null = null;
}
