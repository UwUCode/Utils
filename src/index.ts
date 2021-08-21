import Internal from "./Functions/Internal";
import Request from "./Functions/Request";
import Strings from "./Functions/Strings";
import Time from "./Functions/Time";
import Utility from "./Functions/Utility";
import Variables from "./Other/Variables";
import Timers from "./Other/Timers";
import Timing from "./Other/Timing";
import JSON5Helper from "./Other/JSON5Helper";
import SessionStore from "./Other/SessionStore";
import IORedis from "./Other/Redis";
import ReNice from "./Other/ReNice";
import pid from "./Other/pid";
const Redis = IORedis.r;

interface List {
	userAgent: string;
	"pastebin.userKey": string;
	"pastebin.devKey": string;
	redis: import("ioredis").Redis;
}

function setValue<K extends keyof List>(key: K, val: List[K]) {
	// typescript doesn't narrow val properly so we just any it
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	Variables[
		key === "userAgent" ? "USER_AGENT" :
			key === "redis" ? "REDIS" : null as never
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	] = val as any;


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
	Timing,
	JSON5Helper,
	SessionStore,
	ReNice,
	pid
};
