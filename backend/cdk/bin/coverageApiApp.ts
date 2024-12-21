#!/usr/bin/env node
import 'source-map-support/register';

import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';

import { LambdaApplicationEnum, StageType } from '../constant';
import { CoverageApiStack } from '../lib/coverageApiStack';

const app = new App();

const regions = app.node.tryGetContext('regions')?.split(',') as string[] || ['us-east-1'];
const stage = app.node.tryGetContext('stage') as StageType || 'dev';


regions.forEach(region => {
	new CoverageApiStack(app, `${LambdaApplicationEnum.STACK_NAME}_${stage}_${region}`, {
		stage,
		stackName: `${LambdaApplicationEnum.STACK_NAME}-${stage}`,
		env: {
			region,
			account: process.env.CDK_DEFAULT_ACCOUNT,
		},
		tags: {
			appName: LambdaApplicationEnum.STACK_NAME
		},
		synthesizer: new DefaultStackSynthesizer({
			fileAssetsBucketName: `${LambdaApplicationEnum.STACK_NAME}-${stage}`
		}),
	});
});
