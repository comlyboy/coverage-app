import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { ApiGatewayConstruct } from "../construct/apiGatewayConstruct";
import { DynamoDBConstruct } from "../construct/dynamoDbConstruct";
import { LambdaConstruct } from "../construct/lambdaContruct";
import { S3Construct } from "../construct/s3Construct";
import { IBaseConstructProps } from "cdk/types";

export interface IProp extends StackProps, Omit<IBaseConstructProps, 'stackName'> { }

export class CoverageApiStack extends Stack {
	constructor(scope: App, id: string, props: IProp) {
		super(scope, id, props);

		// S3 Setup
		const s3Construct = new S3Construct(this, `${props.stackId}S3Construct`, {
			bucketName: props.stackName,
			stackId: props.stackId,
			stage: props.stage,
			stackName: props.stackName,
		});

		// Lambda Setup
		const lambdaConstruct = new LambdaConstruct(this, `${props.stackId}LambdaConstruct`, {
			bucket: s3Construct.bucket,
			stackId: props.stackId,
			stackName: props.stackName,
			stage: props.stage,
		});

		// API Gateway Setup
		const apiGatewayConstruct = new ApiGatewayConstruct(this, `${props.stackId}ApiGatewayConstruct`, {
			handlerFunction: lambdaConstruct.handler,
			stackId: props.stackId,
			stackName: props.stackName,
		});

		// DynamoDB Setup
		new DynamoDBConstruct(this, `${props.stackId}DynamoDBConstruct`, {
			stackId: props.stackId,
			stackName: props.stackName,
			stage: props.stage,
			handlerFunction: lambdaConstruct.handler,
		});

		// Outputs
		new CfnOutput(this, `${props.stackId}ApiEndpoint`, {
			value: apiGatewayConstruct.api.apiEndpoint,
		});
	}
}
