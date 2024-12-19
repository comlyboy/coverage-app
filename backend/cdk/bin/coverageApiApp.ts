#!/usr/bin/env node
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';

import { LambdaApplicationEnum, StageType } from '../constant';
import { CoverageApiStack } from '../lib/coverageApiStack';

const app = new App();

// get cdk command context.
// it contains all the setup inside context cdk.json file and other flags passed running cdk command like synth, bootsrap or deploy.
// Used it here to get stage and region information for deployment.
const regions = app.node.tryGetContext('regions')?.split(',') as string[] || ['us-east-1'];
const stage = app.node.tryGetContext('stage') as StageType || 'dev';

// if (!stage || !regions.length) {
// 	throw new Error('invalid region or stage selected!')
// }

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
		}
	});
});
