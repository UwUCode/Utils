export default class Strings extends null {
    /**
     * Make the first letter of every word uppercase.
     * @param str The string to perform the operation on.
     */
    static ucwords(str: string) {
        return str.toString().toLowerCase().replace(/^(.)|\s+(.)/g, r => r.toUpperCase());
    }

    /**
     * Format byte measurements for human readability.
     * @param str The amount to format.
     * @param precision Where to cut off floating point numbers at.
     */
    static formatBytes(str: string | number, precision = 2) {
        str = Number(str);
        const { KB, MB, GB } = {
            KB: 1000,
            MB: 1000000,
            GB: 1000000000
        };
        if (str >= GB) {
            return `${(str / GB).toFixed(precision)} GB`;
        } else if (str >= MB) {
            return `${(str / MB).toFixed(precision)} MB`;
        } else if (str >= KB) {
            return `${(str / KB).toFixed(precision)} KB`;
        } else {
            return `${str} B`;
        }
    }

    /**
     * Limit a string to a maximum length.
     * @param str The string to truncate.
     * @param limit The location to truncate at.
     * @param ellipses If ellipses should be included.
     */
    static truncate(str: string, len: number, ellipses = true) {
        return str.length > len ? (ellipses === true ? `${str.slice(0, len - 6)} (...)` : str.slice(0, len)) : str;
    }

    /**
     * Limit a string to a maximum length, respecting word boundaries.
     * @param str The string to truncate.
     * @param limit The location to truncate at.
     * @param ellipses If ellipses should be included.
     */
    static truncateWords(str: string, limit: number, ellipses = true) {
        if (str.length <= limit) {
            return str;
        }
        let result = "";
        for (const part of str.split(" ")) {
            if (result.length + part.length + (ellipses ? 6 : 0) > limit) {
                break;
            }
            result += `${part} `;
        }
        return `${result}${ellipses === true ? " (...)" : ""}`;
    }

    /**
     * Convert camelCase to snake_case.
     * @param str The string to change.
     */
    static camelCaseToSnakeCase(str: string) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
    /**
     * Returns the provided string with the plural character if the array length or value is not 1.
     * @deprecated Candidate for removal.
     * @param str The provided string.
     * @param arr The provided array or number.
     * @param plural The character to add if plural.
     */
    static plural(str: string, val: ArrayLike<unknown> | number, plural = "s") {
        return `${str}${(Array.isArray(val) ? val.length : val) === 1 ? "" : plural}`;
    }

    /**
     * Returns the array joined together with an and.
     * @deprecated Candidate for removal.
     * @param arr The provided array.
     */
    static joinAnd(arr: Array<unknown>, joiner = ", ") {
        if (arr.length === 1) {
            return String(arr[0]);
        }
        const last = arr.splice(- 1, 1)[0];
        return `${arr.join(joiner)}, and ${last as string}`;
    }

    /**
     * Validate a string is a url.
     * @param str The string to validate.
     */
    static validateURL(str: string) {
        return /https?:\/\/(www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)/.test(str);
    }
}
