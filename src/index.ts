import Internal from "./Functions/Internal";
import LegalAss from "./Functions/LegalAss";
import Request from "./Functions/Request";
import Strings from "./Functions/Strings";
import Time from "./Functions/Time";
import Utility from "./Functions/Utility";
import Variables from "./Other/Variables";
import Timers from "./Other/Timers";
import Timing from "./Other/Timing";
import JSON5Helper from "./Other/JSON5Helper";
import SessionStore from "./Other/SessionStore";
import ReNice from "./Other/ReNice";
import pid from "./Other/pid";

interface List {
	userAgent: string;
	"pastebin.userKey": string;
	"pastebin.devKey": string;
}

function setValue<K extends keyof List>(key: K, val: List[K]) {
	// typescript doesn't narrow val properly so we just any it
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	Variables[
		key === "userAgent" ? "USER_AGENT" : null as never
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	] = val as any;


	return setValue;
}

export {
	Internal,
	LegalAss,
	Request,
	Strings,
	Time,
	Utility,
	setValue,
	Variables,
	Timers,
	Timing,
	JSON5Helper,
	SessionStore,
	ReNice,
	pid
};
