import { ICoverage } from '../types';

interface IProps {
	coverage: ICoverage;
}

export default function CoverageCard({ coverage }: IProps) {
	return (
		<div className='p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700'>{coverage.projectName}</div>
	)
}