#!/usr/bin/env node
import 'source-map-support/register';
import * as is24 from '@is24/s24-aws-cdk';
import { ExampleStack } from '../lib/trusted-advisor-alerts-stack';

const app = new is24.App({
  /**
   * https://docs.cloud.scout24.com/products/aws-accounts/stages/
   * https://docs.cloud.scout24.com/best-practices/tagging/#segment
   */
  stage: 'dev',
});
new ExampleStack(app, 'ExampleStack');
