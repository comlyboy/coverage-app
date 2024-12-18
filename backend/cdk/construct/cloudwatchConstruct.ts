import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LogGroup, LogGroupProps } from 'aws-cdk-lib/aws-logs';

import { IBaseConstructProps } from '../types';

export interface ILogGroupConstructProps extends IBaseConstructProps<LogGroupProps> {
	name: string
}

export class CloudWatchLogGroupConstruct extends Construct {
	readonly logGroup: LogGroup;

	constructor(scope: Construct, id: string, props: ILogGroupConstructProps) {
		super(scope, id);
		this.logGroup = new LogGroup(this, id, {
			...props.options,
			removalPolicy: RemovalPolicy.DESTROY,
			// retention: RetentionDays.INFINITE,
			logGroupName: props.name
		});
	}
}
