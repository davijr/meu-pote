const webpush = require('web-push');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configurar VAPID keys para push notifications
// VAPID_SUBJECT deve ser um email no formato mailto:seu-email@dominio.com
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
  console.warn('⚠️  VAPID keys não configuradas! Push notifications não funcionarão.');
  console.warn('   Configure VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_SUBJECT nas variáveis de ambiente.');
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@meupote.davijr.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

class NotificationService {
  static async sendNotification(userId, title, body, data = {}) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId, ativo: true }
      });

      if (subscriptions.length === 0) {
        console.log(`Nenhuma subscription ativa encontrada para usuário ${userId}`);
        return;
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/',
          ...data
        }
      });

      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          );
          console.log(`Notificação enviada para subscription ${subscription.id}`);
        } catch (error) {
          console.error(`Erro ao enviar notificação para subscription ${subscription.id}:`, error);
          
          if (error.statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { ativo: false }
            });
            console.log(`Subscription ${subscription.id} marcada como inativa`);
          }
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro no serviço de notificação:', error);
    }
  }

  static async sendRandomPhraseNotification(userId, categoria = null) {
    try {
      const whereClause = categoria ? { categoria } : {};
      
      const visualizadas = await prisma.visualizacao.findMany({
        where: { userId },
        select: { fraseId: true }
      });

      const fraseIdsVisualizadas = visualizadas.map(v => v.fraseId);

      let frase = await prisma.frase.findFirst({
        where: {
          ...whereClause,
          NOT: {
            id: { in: fraseIdsVisualizadas }
          }
        },
        orderBy: {
          views: 'asc'
        }
      });

      if (!frase) {
        frase = await prisma.frase.findFirst({
          where: whereClause,
          orderBy: {
            views: 'asc'
          }
        });
      }

      if (!frase) {
        console.log('Nenhuma frase encontrada para notificação');
        return;
      }

      const title = 'Nova Frase do Dia! 💭';
      const body = `"${frase.frase.substring(0, 100)}${frase.frase.length > 100 ? '...' : ''}"`;
      
      await this.sendNotification(userId, title, body, {
        fraseId: frase.id,
        categoria: frase.categoria
      });

      await prisma.frase.update({
        where: { id: frase.id },
        data: { views: { increment: 1 } }
      });

      console.log(`Notificação de frase enviada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao enviar notificação de frase:', error);
    }
  }

  static async subscribeUser(userId, subscription) {
    try {
      const existingSubscription = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint
        }
      });

      if (existingSubscription) {
        await prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            ativo: true
          }
        });
      } else {
        await prisma.pushSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            ativo: true
          }
        });
      }

      console.log(`Subscription criada/atualizada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao criar subscription:', error);
      throw error;
    }
  }

  static async unsubscribeUser(userId, endpoint) {
    try {
      await prisma.pushSubscription.updateMany({
        where: {
          userId,
          endpoint
        },
        data: { ativo: false }
      });

      console.log(`Subscription desativada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao desativar subscription:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;