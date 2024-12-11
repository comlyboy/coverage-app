import { Function } from 'aws-cdk-lib/aws-lambda';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AddRoutesOptions, CorsHttpMethod, HttpApi, HttpApiProps, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';

import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';

export interface IApiGatewayConstructProps extends Omit<IBaseConstructProps<{
	gatewayOptions: HttpApiProps;
	routeOptions: AddRoutesOptions;
}>, 'stage'> {
	handlerFunction: Function;
}

export class ApiGatewayConstruct extends Construct {
	readonly api: HttpApi;

	constructor(scope: Construct, id: string, props: IApiGatewayConstructProps) {
		super(scope, id);

		this.api = new HttpApi(this, `${id}HttpApi`, {
			apiName: props.stackName,
			corsPreflight: {
				allowHeaders: ['*'],
				allowOrigins: ['*'],
				allowMethods: [CorsHttpMethod.ANY],
			},
		});

		this.api.addRoutes({
			path: '/{proxy+}',
			methods: [HttpMethod.ANY],
			integration: new HttpLambdaIntegration(
				`${props.stackId}HttpApiIntegration`,
				props.handlerFunction
			),
		});
	}
}
