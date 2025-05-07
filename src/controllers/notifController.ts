import { Channel, ConsumeMessage } from 'amqplib';
import { SlackService } from '../services/slackService';
import { RabbitMQService } from '../services/rabbitMqService';

/**
 * Contrôleur de la réception des notifications depuis RabbitMQ
 * et la transmission vers slack webhook avec la méthode notificationSlack du slackService
 */
export class NotificationController {
  private slackService = new SlackService();
  private channel!: Channel;

  // Constructeur de la classe
  constructor(private rabbitMQService: RabbitMQService) {
    this.channel = this.rabbitMQService.getChannel();
  }

  /**
   * Methode qui assure la consommation des messages depuis rabbitMqService 
   * et les envoyer vers slack à l'aide de slackService avec la methode notificationSlack(notification)
   */
  async startConsommation(): Promise<void> {
    const queueName = 'slack_notifications';

    console.log(`En attente de messages dans la file "${queueName}".`);

    try {
      await this.channel.consume(
        queueName,
        async (message) => {
          if (!message) {
            console.warn('Message vide reçu.');
            return;
          }

          try {
            // Parser le message JSON
            const notification = JSON.parse(message.content.toString());
            notification.timestamp = new Date();

            console.log(`Notification reçue: `, notification);

            // Envoyer à Slack
            await this.slackService.notificationSlack(notification);

            // Acquitter le message (le retirer de la file)
            this.channel.ack(message);

          } catch (error: any) {
            console.error('Erreur lors du traitement du message:', error.message);
            
            // Nack avec rejet définitif
            /**
             * channel.nack(message, allUpTo, requeue) : 
             * allUpTo => if true : rejette tous les messages précédents non aquittés
             *  => if false : Rejette uniquement ce essage
             * requeue => if true : remet le message dans la file d'attente pour un nouveau traitement
             * => if false : supprime le message
              */ 
            this.channel.nack(message, false, false); 
          }
        },
        {
          noAck: false, // Mode acquittement manuel // Désactiver acuittement automatique
        }
      );
    } catch (error: any) {
      console.error('Impossible de démarrer la consommation:', error.message);
      throw error;
    }
  }
}