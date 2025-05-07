// Pas bonne pratique mais pour s'initier juste
// Hors architecture !

import * as amqp from 'amqplib';
import { IncomingWebhook } from '@slack/webhook';

interface Notification {
    type: string;
    recipient: string;
    content: string;
    timestamp?: Date;
}

class SlackNotifier {
    private webhook: IncomingWebhook;

    constructor(webhookUrl: string) {
        this.webhook = new IncomingWebhook(webhookUrl);
    }

    async sendSlackNotification(notification: Notification) {
        
        try {
            await this.webhook.send({
                text: `Nouvelle notification reçue`,
                attachments: [
                    {
                        color: '#36a64f',
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
                            }
                        ]
                    }
                ]
            });
            console.log('Notification envoyée à Slack avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'envoi à Slack:', error);
        }
    }
}

async function startSlackConsumer() {
    // Configuration - à remplacer par votre webhook Slack
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/XXXXX/XXXXX/XXXXXXXXXX';
    const slackNotifier = new SlackNotifier(SLACK_WEBHOOK_URL);

    // Connexion RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const exchange = 'notifications';
    await channel.assertExchange(exchange, 'topic', { durable: false });

    // File d'attente durable pour ne pas perdre les messages
    const { queue } = await channel.assertQueue('slack_notifications', { durable: true });
    await channel.bindQueue(queue, exchange, 'notification.*');

    console.log('Recepteur de message actif');

    // Consommation avec acquittement manuel
    channel.consume(queue, async (message) => {
        if (message) {
            try {
                const notification: Notification = JSON.parse(message.content.toString());
                notification.timestamp = new Date();
                
                console.log(`Nouvelle notification reçue pour Slack: ${notification.type}`);
                
                // Envoi à Slack
                await slackNotifier.sendSlackNotification(notification);
                
                // Acquittement du message
                channel.ack(message);
            } catch (error) {
                console.error('Erreur de traitement:', error);
                // Rejeter le message (le remettre dans la file ou la file morte)
                channel.nack(message, false, false);
            }
        }
    }, { noAck: false }); // noAck: false pour le mode acquittement manuel
}

startSlackConsumer().catch(console.error);