import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';

import { IBaseConstructProps } from 'cdk/types';

export interface IEventBridgeConstructProps extends IBaseConstructProps {
	lambdaFunction: Function;
	name: string
}

export class EventBridgeConstruct extends Construct {
	readonly eventSchedule: Rule;

	constructor(scope: Construct, id: string, props: IEventBridgeConstructProps) {
		super(scope, id);

		this.eventSchedule = new Rule(this, `${id}_Schedule`, {
			ruleName: props.name,
			schedule: Schedule.rate(Duration.minutes(1)),
			targets: [
				new LambdaFunction(props.lambdaFunction, {
					event: RuleTargetInput.fromObject({ message: 'Hello from Lambda!!!' }),
				})
			]
		});
		this.eventSchedule.applyRemovalPolicy(RemovalPolicy.DESTROY);

	}
}
