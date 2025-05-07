POUR POUVOIR UTILISER LE SERVICE : 

INSTALLER RABBITMQ DANS LE LIEN 

-> https://www.rabbitmq.com/docs/install-debian

ACTIVER PLUGIN WEB UI :

sudo rabbitmq-plugins enable rabbitmq_management

---------------------------------------------------------------------------------

UTILISATION DU SERVICE 

npm i

Ajouter un fichier .env contenant toutes les configurations des liens nécéssaires 

-----------------------------------------

s'il y a des erreur dans rabbitMqService réinstaller : 

npm install amqplib
npm install --save-dev typescript ts-node @types/node