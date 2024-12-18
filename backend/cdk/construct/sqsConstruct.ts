import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface ISqsConstructProps extends IBaseConstructProps<QueueProps> {
	name: string;
	lambdaFuntion: Function;
}

export class SqsConstruct extends Construct {
	readonly queue: Queue;

	constructor(scope: Construct, id: string, props: ISqsConstructProps) {
		super(scope, id);

		this.queue = new Queue(this, id, {
			...props.options,
			queueName: props.name
		});
		this.queue.grantConsumeMessages(props.lambdaFuntion);
	}
}
