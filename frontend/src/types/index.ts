export interface IBaseApiResponse<TResponse extends Record<string, any>> {
	StatusCode: number;
	message: string;
	error: Record<string, any>;
	data: TResponse;
}
export interface ICoverage {
	id: string;
	createdAt: string;
	updatedAt?: string;
	projectName: string; // Repository name
	linesCovered: number;
	branchesCovered: number;
	functionsCovered: number;
	statementsCovered: number;
}