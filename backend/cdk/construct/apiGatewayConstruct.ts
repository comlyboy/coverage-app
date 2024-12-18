import { Function } from 'aws-cdk-lib/aws-lambda';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AddRoutesOptions, HttpApi, HttpApiProps } from 'aws-cdk-lib/aws-apigatewayv2';

import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';

export interface IApiGatewayConstructProps extends Omit<IBaseConstructProps<{
	gatewayOptions: HttpApiProps;
	routeOptions: Partial<AddRoutesOptions>;
}>, 'stage' | 'stackName'> {
	handlerFunction: Function;
}


export class ApiGatewayV2Construct extends Construct {
	readonly api: HttpApi;

	constructor(scope: Construct, id: string, props: IApiGatewayConstructProps) {
		super(scope, id);

		this.api = new HttpApi(this, id, {
			...props.options.gatewayOptions
		});

		if (props.options?.routeOptions) {
			this.api.addRoutes({
				...props.options?.routeOptions,
				integration: new HttpLambdaIntegration('routes', props.handlerFunction)
			} as AddRoutesOptions);
		}
	}
}
