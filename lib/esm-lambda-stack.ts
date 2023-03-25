import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class EsmLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const parameter = new ssm.StringParameter(this, 'LambdaCacheConfig', {
      stringValue: JSON.stringify({ cacheDuration: cdk.Duration.minutes(3).toMilliseconds(), cacheSize: 100 }),
      parameterName: '/config/esm-lambda/cache-config',
    });

    const handler = new nodejs.NodejsFunction(this, 'EsmHandlerLambda', {
      entry: 'lib/lambda/esm-handler.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      logRetention: logs.RetentionDays.TWO_WEEKS,
      environment: {
        PARAMETER_NAME: parameter.parameterName,
      },
      bundling: {
        format: nodejs.OutputFormat.ESM, // enables top level await.
        // fix 'dynamic require not supported': see https://github.com/evanw/esbuild/issues/1921
        banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);',
      },
    });

    parameter.grantRead(handler);
  }
}
