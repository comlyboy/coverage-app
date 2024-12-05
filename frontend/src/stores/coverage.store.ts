import { create } from "zustand";

import { ICoverage } from "../types";
import { sendHttpRequest } from "../http";

interface ICoverageStore {
	isLoading: boolean;
	coverages: ICoverage[];
	fetchCoverage: () => void;
}

export const useCoverageStore = create<ICoverageStore>((set) => ({
	coverages: [{
		id: Math.random().toString(),
		projectName: 'coverage-app'
	}] as any[],
	isLoading: false,
	fetchCoverage: async () => {
		try {
			set({ isLoading: true });
			const { data } = await sendHttpRequest<{ coverages: ICoverage[] }>({ url: 'coverages' });
			set({ coverages: data.coverages });
		} catch (error) {
			console.error(error);
		} finally {
			set({ isLoading: false });
		}
	}
}));