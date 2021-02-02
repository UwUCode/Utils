import IORedis, { Redis as RClent } from "ioredis";

export default class Redis {
	static r: RClent;
	static initialized = false;
	static init(host: string, port: number, password: string, db: number, connectionName: string) {
		this.r = new IORedis(port, host, {
			password,
			db,
			enableReadyCheck: true,
			autoResendUnfulfilledCommands: true,
			connectionName
		});
		this.initialized = true;
	}
}
