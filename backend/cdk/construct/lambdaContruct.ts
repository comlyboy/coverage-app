import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Architecture, Code, Function, FunctionProps, Runtime } from 'aws-cdk-lib/aws-lambda';

import { IBaseConstructProps } from 'cdk/types';

export interface ILambdaConstructProps extends IBaseConstructProps<Partial<FunctionProps>> { }

export class LambdaConstruct extends Construct {
	readonly handler: Function;

	constructor(scope: Construct, id: string, props: ILambdaConstructProps) {
		super(scope, id);

		this.handler = new Function(this, id, {
			...props.options,
			functionName: props.stackName,
			description: 'This is the Coverage API Lambda function',
			handler: 'serverless.handler',
			runtime: Runtime.NODEJS_20_X,
			timeout: Duration.seconds(15),
			memorySize: 1024,
			architecture: Architecture.ARM_64,
			code: Code.fromAsset('dist'), // Point to the compiled dist folder
			environment: {
				NODE_ENV: props.stage,
				NODE_OPTIONS: '--enable-source-maps',
				AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			},
		});
	}
}