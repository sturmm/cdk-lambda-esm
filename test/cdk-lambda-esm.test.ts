import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EsmLambdaStack } from '../lib/esm-lambda-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cdk-lambda-esm-stack.ts
test('Lambda Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new EsmLambdaStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs18.x'
  });
});
