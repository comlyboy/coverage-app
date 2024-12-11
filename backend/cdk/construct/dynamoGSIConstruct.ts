import { Construct } from 'constructs';
import { GlobalSecondaryIndexProps, Table } from 'aws-cdk-lib/aws-dynamodb';

export interface IGsiConstructProps {
	table: Table;
	options: GlobalSecondaryIndexProps;
}

export class GsiConstruct extends Construct {
	constructor(scope: Construct, id: string, props: IGsiConstructProps) {
		super(scope, id);
		props.table.addGlobalSecondaryIndex(props.options);
	}
}
