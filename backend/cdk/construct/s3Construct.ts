import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IBaseConstructProps } from 'cdk/types';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

export interface IS3ConstructProps extends IBaseConstructProps {
	bucketName: string;
}

export class S3Construct extends Construct {
	readonly bucket: Bucket;

	constructor(scope: Construct, id: string, props: IS3ConstructProps) {
		super(scope, id);

		this.bucket = new Bucket(this, `${props.stackId}Bucket`, {
			versioned: true,
			bucketName: props.stackName,
			autoDeleteObjects: true,
			removalPolicy: props.stage === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
		});

		new BucketDeployment(this, `${props.stackId}DeployLambdaCode`, {
			destinationBucket: this.bucket,
			sources: [Source.asset('./dist')],
			destinationKeyPrefix: props.stage,
		});
	}
}
