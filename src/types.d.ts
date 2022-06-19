export interface DiskUsage {
	drives: Record<string, DriveUsage>;
	unix: boolean;
}

export interface DriveUsage {
	total: number;
	free: number;
}

export interface MsResponse {
	milliseconds: number;
	seconds: number;
	minutes: number;
	hours: number;
	days: number;
	months: number;
	years: number;
}

export interface MsBigInt {
	milliseconds: bigint;
	seconds: bigint;
	minutes: bigint;
	hours: bigint;
	days: bigint;
	months: bigint;
	years: bigint;
}

export interface MsOptions<R extends boolean = boolean> {
	words?: boolean;
	seconds?: boolean;
	ms?: boolean;
	shortMS?: boolean;
	monthAbbr?: string;
	raw?: R;
}
