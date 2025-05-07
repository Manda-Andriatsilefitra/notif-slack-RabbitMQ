import * as amqp from 'amqplib';

interface Notification {
    type: string;
    recipient: string;
    content: string;
}

async function sendNotification() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const exchange = 'notifications';
    await channel.assertExchange(exchange, 'topic', { durable: false });

    // Un message
    const notification: Notification = {
        type: 'email',
        recipient: 'andriatsilefitramanda@gmail.com',
        content: 'Bienvenue sur notre plateforme!'
    };

    // Publier le message
    channel.publish(
        exchange,
        'notification.email',
        Buffer.from(JSON.stringify(notification))
    );

    console.log("Notification envoyée");

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

sendNotification().catch(console.error);