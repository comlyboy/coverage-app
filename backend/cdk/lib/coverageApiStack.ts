// import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as events from 'aws-cdk-lib/aws-events';
import * as cloudWatch from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
// import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as apiGatewayV2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apiGatewayIntegration from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { LambdaApplicationEnum } from '../constant';


interface IProp extends cdk.StackProps {
	readonly stage: 'development' | 'production';
	readonly stackId: string;
}

export class CoverageApiStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: IProp) {
		super(scope, id, props);

		// lambda layer
		// const lambdaLayer = new lambda.LayerVersion(this, props.stackId + 'Layer', {
		// 	code: lambda.Code.fromAsset('node_modules'),
		// 	layerVersionName: 'lambdaNestFullResource',
		// 	removalPolicy: cdk.RemovalPolicy.RETAIN,
		// 	compatibleArchitectures: [lambda.Architecture.ARM_64],
		// 	compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.NODEJS_20_X]
		// });

		// s3 bucket instantiation
		const lambdaCodeBucket = new s3.Bucket(this, props.stackId + 'Bucket', {
			versioned: true,
			bucketName: props.stackName, // Replace with your desired bucket name
			autoDeleteObjects: true, // Delete all objects when the bucket is destroyed
			removalPolicy: props.stage === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // RETAIN for production
		});
		new s3Deploy.BucketDeployment(this, props.stackId + 'DeployLambdaCode', {
			destinationBucket: lambdaCodeBucket,
			sources: [s3Deploy.Source.asset('./dist')],
			destinationKeyPrefix: props.stage,
		});

		// lambda function instantiation
		const handlerFunction = new lambda.Function(this, id, {
			functionName: props.stackName,
			description: 'This is nest coverage API lambda function',
			handler: 'lambda.handler',
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(15),
			memorySize: 1024,
			architecture: lambda.Architecture.ARM_64,
			code: lambda.Code.fromBucket(lambdaCodeBucket, 'lambda-code.zip'), // Specify the path in the S3 bucket
			// code: lambda.Code.fromBucket(deploymentBucket, LambdaApplicationEnum.STACK_NAME + '.zip'),
			// ephemeralStorageSize: cdk.Size.mebibytes(128),
			// layers: [lambdaLayer],
			environment: {
				NODE_ENV: props.stage,
				NODE_OPTIONS: '--enable-source-maps',
				AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
			},
		});

		// api-gateway instantiation
		const apiGatewayEndpoint = new apiGatewayV2.HttpApi(this, props.stackId + 'HttpApi', {
			apiName: props.stackName,
			corsPreflight: {
				allowHeaders: ['*'],
				allowOrigins: ['*'],
				allowMethods: [apiGatewayV2.CorsHttpMethod.ANY],
			}
		});
		apiGatewayEndpoint.addRoutes({
			path: '/{proxy+}',
			methods: [apiGatewayV2.HttpMethod.ANY],
			integration: new apiGatewayIntegration.HttpLambdaIntegration(`${props.stackId}HttpApiIntegration`, handlerFunction)
		});

		// cloudwatch instantiation
		new cloudWatch.LogGroup(this, props.stackId + 'LogGroup', {
			logGroupName: props.stackName + '-log',
			// removalPolicy: cdk.RemovalPolicy.DESTROY,
			retention: cloudWatch.RetentionDays.INFINITE
		}).grantWrite(handlerFunction);

		// const eventSchedule = new events.Rule(this, props.stackId + 'Schedule', {
		// 	ruleName: props.stackName + '-schedule',
		// 	schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
		// 	targets: [
		// 		new targets.LambdaFunction(handlerFunction, {
		// 			event: events.RuleTargetInput.fromObject({ botId: '123' }),
		// 		}),
		// 	],
		// });
		// eventSchedule.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

		// dynamoDB instantiation
		const dynamoTable = new dynamodb.Table(this, props.stackId + 'Database', {
			tableName: `${LambdaApplicationEnum.STACK_NAME}-db-${props.stage}`,
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			deletionProtection: props.stage === 'production',
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "entityName", type: dynamodb.AttributeType.STRING },
		});
		// dynamoTable.addGlobalSecondaryIndex({
		// 	indexName: 'email_entityName_index',
		// 	partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
		// 	sortKey: { name: 'entityName', type: dynamodb.AttributeType.STRING },
		// });
		dynamoTable.addGlobalSecondaryIndex({
			indexName: 'entityName_createdAtDate_index',
			partitionKey: { name: 'entityName', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'createdAtDate', type: dynamodb.AttributeType.STRING },
		});
		dynamoTable.addGlobalSecondaryIndex({
			indexName: 'entityNameBranch_createdAtDate_index',
			partitionKey: { name: 'branchId', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'createdAtDate', type: dynamodb.AttributeType.STRING },
		});
		dynamoTable.addGlobalSecondaryIndex({
			indexName: 'entityNameBranchBusiness_createdAtDate_index',
			partitionKey: { name: 'businessId', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'createdAtDate', type: dynamodb.AttributeType.STRING },
		});
		dynamoTable.grantFullAccess(handlerFunction);

	}
}