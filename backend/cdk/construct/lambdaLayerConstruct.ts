import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';
import { Architecture, Code, LayerVersion, LayerVersionProps, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface ISnsConstructProps extends IBaseConstructProps<LayerVersionProps> {
}

export class SnsConstruct extends Construct {
	readonly lambdaLayer: LayerVersion;

	constructor(scope: Construct, id: string, props: ISnsConstructProps) {
		super(scope, id);

		this.lambdaLayer = new LayerVersion(this, `${id}_Layer`, {
			code: props.options.code || Code.fromAsset('node_modules'),
			removalPolicy: RemovalPolicy.RETAIN,
			compatibleArchitectures: [Architecture.ARM_64],
			compatibleRuntimes: [Runtime.NODEJS_18_X, Runtime.NODEJS_20_X],
		});

	}
}
