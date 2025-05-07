import * as amqp from 'amqplib';
import { RABBITMQ_CONFIG } from '../config/rabbitConfig';

export class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  // Configuration de la connexion
  async connect(): Promise<void> {
    try {
      console.log(`Connexion à RabbitMQ ...`);

      // Options de connexion
      this.connection = await amqp.connect({
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'Sarobidy',
        password: 'MandaRabbit02',
        frameMax: RABBITMQ_CONFIG.frameMax,
        heartbeat: RABBITMQ_CONFIG.heartbeat
      });

      // Gestion des erreurs de connexion
      this.connection.on('error', (err) => {
        console.error('Erreur de connexion RabbitMQ:', err);
      });

      this.connection.on('close', () => {
        console.warn('Connexion RabbitMQ fermée');
      });

      // Création du canal
      this.channel = await this.connection.createChannel();

      // Configuration de l'échange
      await this.channel.assertExchange(
        RABBITMQ_CONFIG.exchange,
        RABBITMQ_CONFIG.exchangeType,
        { durable: true } // Préférable pour la persistance
      );

      // Configuration de la queue
      const { queue } = await this.channel.assertQueue(
        RABBITMQ_CONFIG.queue,
        { 
          durable: true,
          deadLetterExchange: `${RABBITMQ_CONFIG.exchange}.dead`,
          deadLetterRoutingKey: 'dead.letter'
        }
      );

      // Binding ou liaison
      await this.channel.bindQueue(
        queue,
        RABBITMQ_CONFIG.exchange,
        RABBITMQ_CONFIG.routingKey
      );

      console.log(`Connecté avec succès. Queue: ${queue}`);

    } catch (error: any) {
      console.error('Échec de connexion:', {
        message: error.message,
        stack: error.stack,
        config: RABBITMQ_CONFIG
      });
      await this.close();
      throw error;
    }
  }

  // getteur du cannal
  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('Channel non initialisé. Appelez connect() d\'abord.');
    }
    return this.channel;
  }

  // Déconnexion
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
    }
  }
}