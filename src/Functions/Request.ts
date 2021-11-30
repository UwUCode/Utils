import Variables from "../Other/Variables";
import * as fs from "fs-extra";
import * as http from "http";
import * as https from "https";
import { URL } from "url";

export default class Request {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * get the image at a url as a buffer
	 *
	 * @static
	 * @param {string} url
	 * @returns {Promise<Buffer>}
	 * @memberof Request
	 * @example Request.fetchURL("https://api.furry.bot/V2/furry/yiff/gay/image");
	 * @example Request.fetchURL("https://api.furry.bot/V2/furry/yiff/gay/image", true);
	 */
	static async fetchURL(url: string, withHeaders: true): Promise<{
		headers: http.IncomingHttpHeaders;
		body: Buffer;
		statusCode: number;
		statusMessage: string;
	}>;
	static async fetchURL(url: string, withHeaders?: false): Promise<Buffer>;
	static async fetchURL(url: string, withHeaders?: boolean): Promise<Buffer | {
		headers: http.IncomingHttpHeaders;
		body: Buffer;
		statusCode: number;
		statusMessage: string;
	}> {
		withHeaders = !!withHeaders;
		return new Promise((a, b) => {
			const uri = new URL(url);
			(uri.protocol === "https:" ? https : http).request({
				method: "GET",
				host: uri.host,
				path: uri.pathname,
				protocol: uri.protocol,
				port: uri.port || uri.protocol === "https:" ? 443 : 80,
				timeout: 3e4,
				headers: {
					"User-Agent": Variables.USER_AGENT
				},
				rejectUnauthorized: false
			}, (res) => {
				const data: Array<Buffer> = [];
				res
					.on("data", (d: Buffer) => data.push(d))
					.on("error", (err) => b(err))
					.on("end", () => a(withHeaders === true ? ({
						headers: res.headers,
						body: Buffer.concat(data),
						statusCode: res.statusCode!,
						statusMessage: res.statusMessage!
					}) : Buffer.concat(data))
					);
			}).end();
		});
	}

	static get getImageFromURL() {
		return this.fetchURL.bind(this);
	}

	/**
	 * Download an image to a directory
	 *
	 * @static
	 * @param {string} url - The url of the image to download.
	 * @param {string} filename - The filename to save the image to
	 * @returns {Promise<void>}
	 * @memberof Request
	 * @example Request.downloadImage("https://api.furry.bot/V2/furry/bulge/image", "/opt/FurryBot/bulge.png");
	 */
	static async downloadImage(url: string, filename: string): Promise<void> {
		return this.fetchURL(url, false).then((img) => fs.writeFileSync(filename, img));
	}
}
