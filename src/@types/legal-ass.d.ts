declare module "legal-ass" {
	interface Options {
		length: number;
		splitWords?: boolean;
		ellipses?: string;
	}

	function LegalAss(phrase: string, options: Options): string;
	export = LegalAss;
}
