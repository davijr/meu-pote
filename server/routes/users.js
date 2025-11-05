const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const updateUserSchema = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  senhaAtual: Joi.string().when('novaSenha', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  novaSenha: Joi.string().min(6).optional()
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            visualizacoes: true,
            curtidas: true,
            agendamentos: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        ...user,
        estatisticas: {
          frasesVisualizadas: user._count.visualizacoes,
          frasesCurtidas: user._count.curtidas,
          agendamentosAtivos: user._count.agendamentos
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nome, email, senhaAtual, novaSenha } = value;
    const updateData = {};

    if (nome) updateData.nome = nome;
    
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          NOT: { id: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      updateData.email = email;
    }

    if (novaSenha && senhaAtual) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }

      updateData.senha = await bcrypt.hash(novaSenha, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [visualizacoes, curtidas, agendamentos] = await Promise.all([
      prisma.visualizacao.count({
        where: { userId }
      }),
      prisma.curtida.count({
        where: { userId }
      }),
      prisma.agendamento.count({
        where: { userId, ativo: true }
      })
    ]);

    const frasesVisualizadasRecentes = await prisma.visualizacao.findMany({
      where: { userId },
      take: 5,
      orderBy: { viewedAt: 'desc' },
      include: {
        frase: {
          select: {
            id: true,
            frase: true,
            autor: true,
            categoria: true
          }
        }
      }
    });

    const frasesCurtidasRecentes = await prisma.curtida.findMany({
      where: { userId },
      take: 5,
      orderBy: { likedAt: 'desc' },
      include: {
        frase: {
          select: {
            id: true,
            frase: true,
            autor: true,
            categoria: true
          }
        }
      }
    });

    res.json({
      estatisticas: {
        totalVisualizacoes: visualizacoes,
        totalCurtidas: curtidas,
        agendamentosAtivos: agendamentos
      },
      recentes: {
        visualizacoes: frasesVisualizadasRecentes,
        curtidas: frasesCurtidasRecentes
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: 'Senha é obrigatória para deletar a conta' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;