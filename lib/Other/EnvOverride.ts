export default function EnvOverride<T extends object>(envPrefix: string, obj: T) {
    return new Proxy(obj, {
        get(target, prop) {
            const envName = `${envPrefix}${String(prop).replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`;
            const envValue = process.env[envName];
            const existingValue = target[prop as keyof typeof target] as unknown;
            if (envValue === undefined) {
                return existingValue;
            } else {
                if (existingValue === undefined) {
                    if (["0", "1", "false", "true"].includes(envValue)) {
                        return envValue === "true" || envValue === "1";
                    } else {
                        return isNaN(Number(envValue)) ? envValue : Number(envValue);
                    }
                } else {
                    switch (typeof existingValue) {
                        case "number": {
                            return Number(envValue);
                        }
                        case "bigint": {
                            return BigInt(envValue);
                        }
                        case "boolean": {
                            return envValue === "true" || envValue === "1";
                        }
                        default: {
                            return envValue;
                        }
                    }
                }
            }
        }
    });
}
