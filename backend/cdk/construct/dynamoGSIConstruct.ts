import { Construct } from 'constructs';
import { GlobalSecondaryIndexProps, Table } from 'aws-cdk-lib/aws-dynamodb';
import { IBaseConstructProps } from 'cdk/types';

export interface IGsiConstructProps extends IBaseConstructProps<GlobalSecondaryIndexProps> {
	table: Table;
}

export class DynamoDbGsiConstruct extends Construct {
	constructor(scope: Construct, id: string, props: IGsiConstructProps) {
		super(scope, id);
		props.table.addGlobalSecondaryIndex(props.options);
	}
}
