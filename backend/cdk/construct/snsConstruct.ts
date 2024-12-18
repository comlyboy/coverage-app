import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';
import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface ISnsConstructProps extends IBaseConstructProps<TopicProps> {
	readonly name: string;
	readonly lambdaFuntion: Function;
}

export class SnsConstruct extends Construct {
	readonly topic: Topic;

	constructor(scope: Construct, id: string, props: ISnsConstructProps) {
		super(scope, id);

		this.topic = new Topic(this, id, {
			...props.options,
			displayName: props.name
		});
		this.topic.grantSubscribe(props.lambdaFuntion);

	}
}
