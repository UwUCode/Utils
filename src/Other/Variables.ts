import * as pkg from "../../package.json";

export default class Variables {

	static USER_AGENT = `@uwu-codes\\utils/${pkg.version} (https://github.com/DonovanDMC)`;
	static REDIS: import("ioredis").Redis | null = null;
}
