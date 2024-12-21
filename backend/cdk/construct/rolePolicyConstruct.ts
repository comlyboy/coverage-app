import { ManagedPolicy, PolicyStatement, PolicyStatementProps, Role, RoleProps } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { IBaseConstructProps } from 'cdk/types';


export interface IDynamoDBConstructProps extends IBaseConstructProps<RoleProps> {
	readonly policies?: PolicyStatementProps[];
}

export class RolePolicyConstruct extends Construct {
	readonly role: Role;

	constructor(scope: Construct, id: string, props: IDynamoDBConstructProps) {
		super(scope, id);

		this.role = new Role(this, id, {
			...props.options,
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
			]
		});

		if (props?.policies?.length) {
			props.policies.forEach((policy) => {
				this.role.addToPolicy(new PolicyStatement(policy));
			});
		}

	}
}