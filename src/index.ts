import Internal from "./Functions/Internal";
import Request from "./Functions/Request";
import Strings from "./Functions/Strings";
import Time from "./Functions/Time";
import Utility from "./Functions/Utility";
import Variables from "./Other/Variables";
import Timers from "./Other/Timers";
import JSON5Helper from "./Other/JSON5Helper";
import SessionStore from "./Other/SessionStore";
import IORedis from "./Other/Redis";
export * from "./Other/Types";
const Redis = IORedis.r;

interface List {
	userAgent: string;
	"pastebin.userKey": string;
	"pastebin.devKey": string;
	redis: import("ioredis").Redis;
};

function setValue<K extends keyof List>(key: K, val: List[K]): typeof setValue;
function setValue<K extends keyof List>(key: K, val: any) {
	// typescript doesn't narrow val properly so we just any it
	Variables[
		key === "userAgent" ? "USER_AGENT" :
			key === "pastebin.devKey" ? "DEV_KEY" :
				key === "pastebin.userKey" ? "USER_KEY" :
					key === "redis" ? "REDIS" : null as never
	] = val;


	return setValue;
}

export {
	Internal,
	Request,
	Strings,
	Time,
	Utility,
	setValue,
	IORedis,
	Redis,
	Variables,
	Timers,
	JSON5Helper,
	SessionStore
};
