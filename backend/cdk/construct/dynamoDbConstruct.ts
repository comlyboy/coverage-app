import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';

export interface IDynamoDBConstructProps extends IBaseConstructProps {
	handlerFunction: Function;
}

export class DynamoDBConstruct extends Construct {
	readonly table: Table;

	constructor(scope: Construct, id: string, props: IDynamoDBConstructProps) {
		super(scope, id);

		this.table = new Table(this, id, {
			tableName: `${props.stackName}-db-${props.stage}`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			deletionProtection: props.stage === 'prod',
			partitionKey: { name: 'id', type: AttributeType.STRING },
			sortKey: { name: 'entityName', type: AttributeType.STRING },
		});
	}
}
