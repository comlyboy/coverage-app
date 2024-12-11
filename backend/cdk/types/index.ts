export interface IBaseConstructProps<TOptions = {}> {
	readonly stage?: 'development' | 'staging' | 'production';
	readonly stackId?: string;
	readonly stackName?: string;
	readonly options?: TOptions;
}