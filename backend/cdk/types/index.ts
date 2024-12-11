export interface IBaseConstructProps {
	stage: 'development' | 'staging' | 'production';
	stackId: string;
	stackName: string;
}