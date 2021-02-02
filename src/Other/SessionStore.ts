class SessionStore<D> {
	entries: Map<string, Partial<D>>;
	constructor() {
		this.entries = new Map();
	}

	get(id: string) {
		return this.entries.get(id) || {};
	}
	set(id: string, d: Partial<D>) {
		return this.entries.set(id, d);
	}
	delete(id: string) {
		return this.entries.delete(id);
	}
}

export default SessionStore;
