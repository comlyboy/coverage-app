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

		this.table = new Table(this, `${props.stackId}Database`, {
			tableName: `${props.stackName}-db-${props.stage}`,
			billingMode: BillingMode.PAY_PER_REQUEST,
			deletionProtection: props.stage === 'production',
			partitionKey: { name: 'id', type: AttributeType.STRING },
			sortKey: { name: 'entityName', type: AttributeType.STRING },
		});

		this.table.addGlobalSecondaryIndex({
			indexName: 'email_entityName_index',
			partitionKey: { name: 'email', type: AttributeType.STRING },
			sortKey: { name: 'entityName', type: AttributeType.STRING },
		});

		this.table.addGlobalSecondaryIndex({
			indexName: 'entityName_createdDate_index',
			sortKey: { name: 'createdDate', type: AttributeType.STRING },
			partitionKey: { name: 'entityName', type: AttributeType.STRING },
		});

		this.table.grantFullAccess(props.handlerFunction);
	}
}
