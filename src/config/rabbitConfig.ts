import * as dotenv from 'dotenv';
import { getRequiredEnv } from '../utils/env'; 
// getRequiredEnv() : Méthode dans env.ts pour prendre les variables d'environnement string pour éviter 'string | undefined'


// Charger les variables d'environnement
dotenv.config();

export const RABBITMQ_CONFIG = {
  url: getRequiredEnv('URL_RABBIT'),
  exchange: getRequiredEnv('EXCHANGE'),
  exchangeType: getRequiredEnv('TYPE'),
  queue: getRequiredEnv('QUEU'),
  routingKey: 'notification.*',
  frameMax: 8192,
  heartbeat: 60,
  channelMax: 2047,
};

export const SLACK_CONFIG = {
  webhookUrl: getRequiredEnv('URL_HOOK'),
};