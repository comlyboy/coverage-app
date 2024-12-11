import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';
import { Topic } from 'aws-cdk-lib/aws-sns';

export interface ISnsConstructProps extends IBaseConstructProps { }

export class SnsConstruct extends Construct {
	readonly topic: Topic;

	constructor(scope: Construct, id: string, props: ISnsConstructProps) {
		super(scope, id);

		this.topic = new Topic(this, `${props.stackId}Topic`, {

		});


	}
}
