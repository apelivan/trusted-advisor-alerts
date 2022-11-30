import * as cdk from 'aws-cdk-lib';
import * as is24 from '@is24/s24-aws-cdk';
import {AccountRootPrincipal, Grant, IGrantable, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {Key} from "aws-cdk-lib/aws-kms";
import {Topic} from "aws-cdk-lib/aws-sns";
import {Archive, BaseArchiveProps, Rule} from "aws-cdk-lib/aws-events"
import {IEventBus} from "aws-cdk-lib/aws-events";
import {RemovalPolicy} from "aws-cdk-lib";

interface TrustedAdvisorAlertsProps extends cdk.StackProps {

}

export class TrustedAdvisorAlerts extends is24.Stack {
  constructor(scope: is24.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // KMS for encryption of SNS topic
    const kmsKey = new Key(this, 'cost-anomaly-encryption-key', {
      enableKeyRotation: true
    });
    kmsKey.addAlias('trusted-advisor-alerts-alias');
    kmsKey.grantEncryptDecrypt(new ServicePrincipal("trustedadvisor.amazonaws.com"));
    kmsKey.grantEncryptDecrypt(new AccountRootPrincipal());

    // SNS topic for notifications
    const snsTopic = new Topic(this, 'trusted-advisor-alerts-topic', {
      displayName: 'Trusted Advisor Alerts topic',
      masterKey: kmsKey,
    });

    snsTopic.grantPublish(new ServicePrincipal('trustedadvisor.amazonaws.com'));
    snsTopic.grantPublish(new AccountRootPrincipal());


    // Event Bridge Rule
    const rule = new Rule(this, 'TrustedAdvisorCostOptimisation',{
      ruleName: "TrustedAdvisorCostOptimisation",
      enabled: true,
      description: "Forward select events related to cost optimisation",
      eventBus: {
        eventBusName: "default",
        eventBusArn: "arn:aws:events:us-east-1:282050837221:event-bus/default",
        eventBusPolicy: "",
        stack: this,
        env: {
          account: this.account,
          region: "us-east-1"
        },
        applyRemovalPolicy(policy: RemovalPolicy.DESTROY) {},
        archive(id: string, props: BaseArchiveProps): Archive {

        }
      },
      eventPattern: {
        source: ["aws.trustedadvisor"],
        detailType: ["Trusted Advisor Check Item Refresh Notification"],
        detail: {
          "status": ["ERROR", "WARN"],
          "check-name": ["Low Utilization Amazon EC2 Instances"]
        }
      },
    });

    /**
     * Your stack definition goes here
     * Documentation: https://github.com/Scout24/s24-aws-cdk/
     * Examples: https://github.com/Scout24/s24-aws-cdk-examples
     * For any question you can reach us on #application-platform
     */
  }
}

AWSTemplateFormatVersion: '2010-09-09'
Description: CloudFormation template for EventBridge rule 'TrustedAdvisorCostOptimisation'
Resources:
    EventRule0:
        Type: AWS::Events::Rule
Properties:
    Description:
EventBusName: default
EventPattern:
    source:
        - aws.trustedadvisor
detail-type:
- Trusted Advisor Check Item Refresh Notification
detail:
    status:
        - ERROR
        - WARN
check-name:
- Low Utilization Amazon EC2 Instances
Name: TrustedAdvisorCostOptimisation
State: ENABLED
Targets:
    - Id: Idad8fe636-f1ea-418b-a21a-52417ad5fefe
Arn: >-
    arn:aws:sns:us-east-1:282050837221:CostAnomalyDetectionStack-is24-data-pro-costanomalytopicB0C62AB9-8YSXYRXEAHHI
