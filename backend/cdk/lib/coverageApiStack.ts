import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";

import { ApiGatewayConstruct } from "cdk/construct/apiGatewayConstruct";
import { DynamoDBConstruct } from "cdk/construct/dynamoDbConstruct";
import { DynamoDbGsiConstruct } from "cdk/construct/dynamoGsiConstruct";
import { LambdaConstruct } from "cdk/construct/lambdaContruct";
import { S3Construct } from "cdk/construct/s3Construct";
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
		const dynamoDbTableConstruct = new DynamoDBConstruct(this, `${props.stackId}DynamoDBConstruct`, {
			stackId: props.stackId,
			stackName: props.stackName,
			stage: props.stage,
			handlerFunction: lambdaConstruct.handler,
		});

		// Dynamo-Db Global Secondary index setup
		new DynamoDbGsiConstruct(this, `${props.stackId}DynamoDbGsiConstruct`, {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'entityName_createdAt_index',
				partitionKey: { name: 'entityName', type: AttributeType.STRING },
				sortKey: { name: 'createdAt', type: AttributeType.STRING },
			}
		});

		new DynamoDbGsiConstruct(this, `${props.stackId}DynamoDbGsiConstruct`, {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'email_entityName_index',
				partitionKey: { name: 'email', type: AttributeType.STRING },
				sortKey: { name: 'entityName', type: AttributeType.STRING },
			}
		});





		// AWS CDK setup Outputs
		new CfnOutput(this, `${props.stackId}ApiEndpoint`, {
			value: apiGatewayConstruct.api.apiEndpoint,
		});
	}
}
