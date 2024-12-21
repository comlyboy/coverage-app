import { StageType } from "cdk/constant";

export interface IBaseConstructProps<TOptions = any> {
	readonly stage?: StageType;
	readonly stackName?: string;
	readonly options?: TOptions;
}