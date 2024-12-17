import { StageType } from "cdk/constant";

export interface IBaseConstructProps<TOptions = {}> {
	readonly stage?: StageType;
	readonly stackId?: string;
	readonly stackName?: string;
	readonly options?: TOptions;
}