import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { IBaseConstructProps } from 'cdk/types';

export interface ILambdaConstructProps extends IBaseConstructProps {
	bucket: s3.Bucket;
}

export class LambdaConstruct extends Construct {
	readonly handler: lambda.Function;

	constructor(scope: Construct, id: string, props: ILambdaConstructProps) {
		super(scope, id);

		this.handler = new lambda.Function(this, id, {
			functionName: props.stackName,
			description: 'This is the Coverage API Lambda function',
			handler: 'lambda.handler',
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: Duration.seconds(15),
			memorySize: 1024,
			architecture: lambda.Architecture.ARM_64,
			code: lambda.Code.fromBucket(props.bucket, 'lambda-code.zip'),
			environment: {
				NODE_ENV: props.stage,
				NODE_OPTIONS: '--enable-source-maps',
				AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			},
		});
	}
}