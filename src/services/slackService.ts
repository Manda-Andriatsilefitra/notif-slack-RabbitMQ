import { IncomingWebhook } from '@slack/webhook';
import { SLACK_CONFIG } from '../config/rabbitConfig';
import { Notification } from '../interfaces/notification';

/**
 * Service d'envoi de messages vers Slack
 */
export class SlackService {
  private webhook = new IncomingWebhook(SLACK_CONFIG.webhookUrl);

  /**
   * Envoie un message formaté à Slack
   * @param notification Données de la notification
   */
  async notificationSlack(notification: Notification): Promise<void> {
    try {
      await this.webhook.send({
        text: `Nouvelle notification reçue`,
        attachments: [
          {
              color: '#29a009',
              fields: [
                { 
                  title: 'Type',
                  value: notification.type,
                  short: true 
                },
                {
                  title: 'Destinataire',
                  value: notification.recipient,
                  short: true
                },
                {
                  title: 'Contenu',
                  value: notification.content
                },
                {
                  title: 'Date',
                  value: notification.timestamp?.toISOString() || new Date().toISOString(),
                  short: true
                },
              ],
          },
        ],
      });
      console.log('Notification envoyée à Slack', notification);
    } catch (error: any) {
      console.error('Erreur lors de l’envoi à Slack:', error.response?.status, error.response?.data);
      throw error;
    }
  }
}