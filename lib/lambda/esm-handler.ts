import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import logger from './log'

interface CacheConfig {
  cacheDuration: number, 
  cacheSize: number,
};

const getAppConfig = async (): Promise<{ cacheConfig: CacheConfig, timestamp: number }> => {
  const { PARAMETER_NAME } = process.env;
  const client = new SSMClient({});
  const response = await client.send(new GetParameterCommand({
      Name: PARAMETER_NAME
  }));

  const cacheConfig: CacheConfig = JSON.parse(response.Parameter?.Value!)

  return {
    cacheConfig,
    timestamp: Date.now()
  };
};

// should be loaded just once when the lambda starts
const appConfig = await getAppConfig(); 

export const handler = async () => {
  logger.info({ msg: 'resolved config', appConfig });

  return 'SUCCESS';
}