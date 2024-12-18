import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { CorsHttpMethod, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";

import { ApiGatewayV2Construct } from "../construct/apiGatewayConstruct";
import { DynamoDbGsiConstruct } from "../construct/dynamoGsiConstruct";
import { DynamoDBConstruct } from "../construct/dynamoDbConstruct";
import { LambdaConstruct } from "../construct/lambdaContruct";
import { IBaseConstructProps } from "../types";
import { CloudWatchLogGroupConstruct } from "../construct/cloudwatchConstruct";


export interface IProp extends StackProps, Omit<IBaseConstructProps, 'stackName'> { }

export class CoverageApiStack extends Stack {
	constructor(scope: App, id: string, props: IProp) {
		super(scope, id, props);

		// Lambda Setup
		const lambdaConstruct = new LambdaConstruct(this, 'lambda', {
			stage: props.stage,
			stackName: props.stackName,
		});


		// API Gateway Setup
		const apiGatewayConstruct = new ApiGatewayV2Construct(this, 'apiGatewayV2', {
			handlerFunction: lambdaConstruct.handler,
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


		// CLoudwatch Setup
		const cloudwatchConstruct = new CloudWatchLogGroupConstruct(this, 'cloudWatch', {
			name: props.stackName,
			stackName: props.stackName,
			stage: props.stage
		});
		cloudwatchConstruct.logGroup.grantWrite(lambdaConstruct.handler);

		// DynamoDB Setup
		const dynamoDbTableConstruct = new DynamoDBConstruct(this, 'dynamoDb', {
			stage: props.stage,
			stackName: props.stackName,
			handlerFunction: lambdaConstruct.handler,
		});

		// Dynamo-Db Global Secondary index setup
		new DynamoDbGsiConstruct(this, 'dynamoGsi1', {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'entityName_createdAt_index',
				partitionKey: { name: 'entityName', type: AttributeType.STRING },
				sortKey: { name: 'createdAt', type: AttributeType.STRING },
			}
		});

		new DynamoDbGsiConstruct(this, 'dynamoGsi2', {
			table: dynamoDbTableConstruct.table,
			options: {
				indexName: 'email_entityName_index',
				partitionKey: { name: 'email', type: AttributeType.STRING },
				sortKey: { name: 'entityName', type: AttributeType.STRING },
			}
		});

		dynamoDbTableConstruct.table.grantFullAccess(lambdaConstruct.handler);

		// AWS CDK setup Outputs
		new CfnOutput(this, 'cfnOutput', {
			value: apiGatewayConstruct.api.apiEndpoint,
		});
	}
}
