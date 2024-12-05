import { ICoverage } from "../types";

export function parseHtmlDom() {

}

export function parseJsonDom() {

}

export function parseCoveragePercentage(coverage: ICoverage) {
	let sum = 0;
	if (!coverage) return 0;
	const coveredList = [coverage.statementsCovered, coverage.branchesCovered, coverage.functionsCovered, coverage.linesCovered];
	coveredList.forEach(covers => { sum += covers });
	return sum / coveredList.length;
}

export function parseCoverageStateLabel(coverage: ICoverage) {
	if (!coverage) return ' ';
	const percentage = parseCoveragePercentage(coverage);
	if (percentage < 40) return 'Poor';
	if (percentage >= 40 && percentage < 65) return 'Decent';
	return 'Good';
}