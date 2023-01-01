const Internal = (await import("./dist/Functions/Internal.js")).default.default;
const Strings = (await import("./dist/Functions/Strings.js")).default.default;
const Time = (await import("./dist/Functions/Time.js")).default.default;
const Utility = (await import("./dist/Functions/Utility.js")).default.default;
const Timer = (await import("./dist/Other/Timer.js")).default.default;
const ReNice = (await import("./dist/Other/ReNice.js")).default.default;
const EnvOverride = (await import("./dist/Other/EnvOverride.js")).default.default;
const pid = (await import("./dist/Other/pid.js")).default.default;

export {
    Internal,
    Strings,
    Time,
    Utility,
    Timer,
    ReNice,
    EnvOverride,
    pid
}
