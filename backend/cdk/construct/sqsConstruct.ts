import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';

export interface ISqsConstructProps extends IBaseConstructProps { }

export class SqsConstruct extends Construct {
	readonly queue: Queue;

	constructor(scope: Construct, id: string, props: ISqsConstructProps) {
		super(scope, id);

		this.queue = new Queue(this, `${props.stackId}Queue`, {

		});

	}
}
