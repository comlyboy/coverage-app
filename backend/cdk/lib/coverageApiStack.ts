import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CorsHttpMethod, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";

import { ApiGatewayV2Construct } from "../construct/apiGatewayConstruct";
import { DynamoDbGsiConstruct } from "../construct/dynamoGsiConstruct";
import { DynamoDBConstruct } from "../construct/dynamoDbConstruct";
import { LambdaConstruct } from "../construct/lambdaContruct";
import { IBaseConstructProps } from "../types";
import { CloudWatchLogGroupConstruct } from "../construct/cloudwatchConstruct";
import { RolePolicyConstruct } from "../construct/rolePolicyConstruct";


export interface IProp extends StackProps, Omit<IBaseConstructProps, 'stackName'> { }

export class CoverageApiStack extends Stack {
	constructor(scope: App, id: string, props: IProp) {
		super(scope, id, props);


		// Lambda layer from ARN Setup
		const lambdaLayer = LayerVersion.fromLayerVersionArn(this, 'lambdaLayer', 'arn:aws:lambda:us-east-1:927440925921:layer:lambdaLayer53629B4C:1');


		// Lambda Setup
		const lambdaConstruct = new LambdaConstruct(this, 'lambda', {
			stage: props.stage,
			stackName: props.stackName,
			options: {
				layers: [lambdaLayer]
			}
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


		new RolePolicyConstruct(this, 'rolePolicy', {
			options: {
				assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
			},
			policies: [
				{
					actions: [
						'dynamodb:Query',
						'dynamodb:GetItem',
						'dynamodb:PutItem',
						'dynamodb:UpdateItem',
						'dynamodb:DeleteItem',
						'dynamodb:BatchGetItem',
						'dynamodb:DescribeTable',
						'dynamodb:BatchWriteItem',
						'dynamodb:TransactGetItems',
						'dynamodb:TransactWriteItems'
					],
					resources: [dynamoDbTableConstruct.table.tableArn]
				},
				// {
				// 	actions: [
				// 		'ses:SendEmail',
				// 		'ses:SendRawEmail',
				// 		'ses:SendTemplatedEmail',
				// 		'ses:SendBulkTemplatedEmail'
				// 	],
				// 	resources: [dynamoDbTableConstruct.table.tableArn]
				// }
			]
		});


		cloudwatchConstruct.logGroup.grantWrite(lambdaConstruct.handler);
		dynamoDbTableConstruct.table.grantFullAccess(lambdaConstruct.handler);


		// AWS CDK setup Outputs
		new CfnOutput(this, 'cfnOutput', {
			value: apiGatewayConstruct.api.apiEndpoint,
		});
	}
}
