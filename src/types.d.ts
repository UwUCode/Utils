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
