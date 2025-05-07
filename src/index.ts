import { NotificationController } from './controllers/notifController';
import { RabbitMQService } from './services/rabbitMqService';

async function main() {
  const rabbitMQService = new RabbitMQService();

  try {
    // Connexion unique à RabbitMQ
    await rabbitMQService.connect();

    // Création du contrôleur avec le service initialisé
    const notificationController = new NotificationController(rabbitMQService);

    // Démarrage de la consommation des messages
    await notificationController.startConsommation();

    // Gestion de l'interruption
    process.on('SIGINT', async () => {
      console.log('\n Arrêt du consommateur...');
      await rabbitMQService.close();
      process.exit(0);
    });

  } catch (error: any) {
    console.error('Échec du démarrage:', error.message);
    await rabbitMQService.close();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erreur critique:', err.message);
  process.exit(1);
});