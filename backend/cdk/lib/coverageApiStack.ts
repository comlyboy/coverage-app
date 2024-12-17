import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";

import { ApiGatewayV2Construct } from "../construct/apiGatewayConstruct";
import { DynamoDbGsiConstruct } from "../construct/dynamoGsiConstruct";
import { DynamoDBConstruct } from "../construct/dynamoDbConstruct";
import { LambdaConstruct } from "../construct/lambdaContruct";
import { IBaseConstructProps } from "../types";
import { CorsHttpMethod, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";


export interface IProp extends StackProps, Omit<IBaseConstructProps, 'stackName'> { }

export class CoverageApiStack extends Stack {
	constructor(scope: App, id: string, props: IProp) {
		super(scope, id, props);

		// S3 Setup
		// const s3Construct = new S3Construct(this, `${id}S3Construct`, {
		// 	bucketName: props.stackName,
		// 	stackId: props.stackId,
		// 	stage: props.stage,
		// 	stackName: props.stackName,
		// });


		// Lambda Setup
		const lambdaConstruct = new LambdaConstruct(this, `${id}_LambdaConstruct`, {
			stage: props.stage,
			stackId: props.stackId,
			stackName: props.stackName,
		});


		// API Gateway Setup
		const apiGatewayConstruct = new ApiGatewayV2Construct(this, `${id}_ApiGatewayConstruct`, {
			handlerFunction: lambdaConstruct.handler,
			stackId: props.stackId,
			options: {
				gatewayOptions: {
					apiName: props.stackName,
					corsPreflight: {
						allowHeaders: ['*'],
						allowOrigins: ['*'],
						allowMethods: [CorsHttpMethod.ANY]
					},
				},
				routeOptions: {
					path: '/{proxy+}',
					methods: [HttpMethod.ANY],
				}
			}
		});


		// DynamoDB Setup
		const dynamoDbTableConstruct = new DynamoDBConstruct(this, `${id}_DynamoDBConstruct`, {
			stackId: props.stackId,
			stackName: props.stackName,
			stage: props.stage,
			handlerFunction: lambdaConstruct.handler,
		});

		// Dynamo-Db Global Secondary index setup
		new DynamoDbGsiConstruct(this, `${id}_DynamoDbGsiConstruct1`, {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'entityName_createdAt_index',
				partitionKey: { name: 'entityName', type: AttributeType.STRING },
				sortKey: { name: 'createdAt', type: AttributeType.STRING },
			}
		});

		new DynamoDbGsiConstruct(this, `${id}_DynamoDbGsiConstruct2`, {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'email_entityName_index',
				partitionKey: { name: 'email', type: AttributeType.STRING },
				sortKey: { name: 'entityName', type: AttributeType.STRING },
			}
		});


		// AWS CDK setup Outputs
		new CfnOutput(this, `${id}_CfnOutput`, {
			value: apiGatewayConstruct.api.apiEndpoint,
		});
	}
}
