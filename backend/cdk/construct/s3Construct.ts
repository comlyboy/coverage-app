import { RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import { IBaseConstructProps } from 'cdk/types';
import { Construct } from 'constructs';

export interface IS3ConstructProps extends IBaseConstructProps {
	bucketName: string;
}

export class S3Construct extends Construct {
	readonly bucket: s3.Bucket;

	constructor(scope: Construct, id: string, props: IS3ConstructProps) {
		super(scope, id);

		this.bucket = new s3.Bucket(this, `${props.stackId}Bucket`, {
			versioned: true,
			bucketName: props.stackName,
			autoDeleteObjects: true,
			removalPolicy: props.stage === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
		});

		new s3Deploy.BucketDeployment(this, `${props.stackId}DeployLambdaCode`, {
			destinationBucket: this.bucket,
			sources: [s3Deploy.Source.asset('./dist')],
			destinationKeyPrefix: props.stage,
		});
	}
}
