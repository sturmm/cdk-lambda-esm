# cdk-lambda-esm - Top level `await` Lambda w/ CDK

This is a sample, that shows how to configure and build a node.js Lambda with CDK that allows top level `await` usage with esm modules. But let's setup a project step by step, to see which changes were necessary.

Therefore we create a new project first and initialize cdk: `npx cdk init app --language=typescript`. Now lets change some of the TypeScript settings in our `ts-config.json` to something that supports top level await syntax in the first place:
``` json
{
    "compilerOptions": {
        "module": "ES2022",
        "target": "ES2022",
        "moduleResolution": "node",
        "lib": [
            "ES2022"
        ],
        "esModuleInterop": true,
        // ...
    }
    // ...
}
```

Other configs (e.g. using `ESNext` instead of `ES2022`) would of course also work, but this is what works for me.

Once you do that, you will recognize, that nothing works anymore neither running test nor cdk synth etc. So let's go on and fix the issues step by step: 

In our `package.json` we set `type` property to `module`:
``` json
{
  // ...
  "type": "module",
  // ...
}
```

If we run tests now, we will see issue, namely that `module` is not defined: 
```
ReferenceError: module is not defined in ES module scope
```

This is because `module` only exists for CommonJs so let's rename our jest config to `jest.config.cjs` to indicate that this is still CommonJs file.

Now that this is resolved the next issue is, that our CDK project could not be synthesized. CDK is using `esbuild` (or Docker) to build and package Lambda code. So we need to tell CDK (or `esbuild`) that we want to build a nd deploy ESM modules, by setting the bundling options:

```typescript
  const handler = new nodejs.NodejsFunction(this, 'EsmHandlerLambda', {
    // ...
    bundling: {
      format: nodejs.OutputFormat.ESM, // enables top level await.
      // fix 'dynamic require not supported': see https://github.com/evanw/esbuild/issues/1921
      banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);',
    },
  });
```
The `banner` was necessary for me, to fix a runtime error like [this](https://github.com/evanw/esbuild/issues/1921), when using [pino]{https://github.com/pinojs/pino} logger. I found that some others had those issues for example when using the AWS SDK version 2. So maybe this could also help you. Anyway, the tests itself will run now.

But because of the changes in our `tsconfig.json`, `npm run cdk synth` is not running anymore. CDK uses `ts-node` to run the app in the `bin` folder, but we're lucky as the actual command that is invoked for synthetization is configured in `cdk.json`. So let's tell CDK to use  `--esm --experimentalSpecifierResolution` flags to run `ts-node` with ESM loader:
```json
{
  "app": "npx ts-node --esm --experimentalSpecifierResolution node --prefer-ts-exts bin/cdk-lambda-esm.ts",
}
```

That's it. Now the lambda can be deployed for example by running `npm run cdk deploy`.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
