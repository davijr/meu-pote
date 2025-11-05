const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const NotificationService = require('./notificationService');

const prisma = new PrismaClient();

class SchedulerService {
  static jobs = new Map();

  static init() {
    console.log('Inicializando serviço de agendamento...');
    
    cron.schedule('*/5 * * * *', async () => {
      await this.checkAndSendScheduledPhrases();
    });

    console.log('Serviço de agendamento iniciado - verificação a cada 5 minutos');
  }

  static async checkAndSendScheduledPhrases() {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          ativo: true,
          horario: currentTime,
          diasSemana: {
            has: currentDay
          }
        },
        include: {
          user: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      console.log(`Encontrados ${agendamentos.length} agendamentos para ${currentTime} no dia ${currentDay}`);

      for (const agendamento of agendamentos) {
        try {
          await NotificationService.sendRandomPhraseNotification(
            agendamento.userId,
            agendamento.categoria
          );

          await prisma.agendamento.update({
            where: { id: agendamento.id },
            data: { ultimoEnvio: now }
          });

          console.log(`Frase enviada para usuário ${agendamento.user.nome} (${agendamento.userId})`);
        } catch (error) {
          console.error(`Erro ao enviar frase para usuário ${agendamento.userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar agendamentos:', error);
    }
  }

  static async createUserSchedule(userId, horario, diasSemana, categoria = null) {
    try {
      const agendamento = await prisma.agendamento.create({
        data: {
          userId,
          horario,
          diasSemana,
          categoria,
          ativo: true
        }
      });

      console.log(`Agendamento criado para usuário ${userId}: ${horario} nos dias ${diasSemana.join(',')}`);
      return agendamento;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  static async updateUserSchedule(agendamentoId, horario, diasSemana, categoria = null) {
    try {
      const agendamento = await prisma.agendamento.update({
        where: { id: agendamentoId },
        data: {
          horario,
          diasSemana,
          categoria
        }
      });

      console.log(`Agendamento ${agendamentoId} atualizado`);
      return agendamento;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  }

  static async toggleUserSchedule(agendamentoId) {
    try {
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: agendamentoId }
      });

      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      const updated = await prisma.agendamento.update({
        where: { id: agendamentoId },
        data: { ativo: !agendamento.ativo }
      });

      console.log(`Agendamento ${agendamentoId} ${updated.ativo ? 'ativado' : 'desativado'}`);
      return updated;
    } catch (error) {
      console.error('Erro ao alterar status do agendamento:', error);
      throw error;
    }
  }

  static async deleteUserSchedule(agendamentoId) {
    try {
      await prisma.agendamento.delete({
        where: { id: agendamentoId }
      });

      console.log(`Agendamento ${agendamentoId} deletado`);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      throw error;
    }
  }

  static async getUserSchedules(userId) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return agendamentos;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do usuário:', error);
      throw error;
    }
  }

  static async sendTestNotification(userId, categoria = null) {
    try {
      await NotificationService.sendRandomPhraseNotification(userId, categoria);
      console.log(`Notificação de teste enviada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      throw error;
    }
  }
}

module.exports = SchedulerService;