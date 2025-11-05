const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const scheduleSchema = Joi.object({
  horario: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  diasSemana: Joi.array().items(Joi.number().min(0).max(6)).min(1).required(),
  categoria: Joi.string().valid('AUTO_AJUDA', 'FILOSOFIA', 'DITADO_POPULAR', 'PROVERBIO', 'VERSO_BIBLIA', 'OUTROS').optional()
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const agendamentos = await prisma.agendamento.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ agendamentos });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = scheduleSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { horario, diasSemana, categoria } = value;

    const existingSchedule = await prisma.agendamento.findFirst({
      where: {
        userId,
        horario,
        ativo: true
      }
    });

    if (existingSchedule) {
      return res.status(400).json({ 
        error: 'Já existe um agendamento ativo para este horário' 
      });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        userId,
        horario,
        diasSemana,
        categoria,
        ativo: true
      }
    });

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      agendamento
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const agendamentoId = parseInt(req.params.id);
    const { error, value } = scheduleSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { horario, diasSemana, categoria } = value;

    const existingSchedule = await prisma.agendamento.findFirst({
      where: { id: agendamentoId, userId }
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const conflictingSchedule = await prisma.agendamento.findFirst({
      where: {
        userId,
        horario,
        ativo: true,
        NOT: { id: agendamentoId }
      }
    });

    if (conflictingSchedule) {
      return res.status(400).json({ 
        error: 'Já existe outro agendamento ativo para este horário' 
      });
    }

    const agendamento = await prisma.agendamento.update({
      where: { id: agendamentoId },
      data: {
        horario,
        diasSemana,
        categoria
      }
    });

    res.json({
      message: 'Agendamento atualizado com sucesso',
      agendamento
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const agendamentoId = parseInt(req.params.id);

    const existingSchedule = await prisma.agendamento.findFirst({
      where: { id: agendamentoId, userId }
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const agendamento = await prisma.agendamento.update({
      where: { id: agendamentoId },
      data: {
        ativo: !existingSchedule.ativo
      }
    });

    res.json({
      message: `Agendamento ${agendamento.ativo ? 'ativado' : 'desativado'} com sucesso`,
      agendamento
    });
  } catch (error) {
    console.error('Erro ao alterar status do agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const agendamentoId = parseInt(req.params.id);

    const existingSchedule = await prisma.agendamento.findFirst({
      where: { id: agendamentoId, userId }
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await prisma.agendamento.delete({
      where: { id: agendamentoId }
    });

    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;