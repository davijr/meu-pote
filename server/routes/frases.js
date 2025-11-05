const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const fraseSchema = Joi.object({
  frase: Joi.string().min(10).max(1000).required(),
  autor: Joi.string().max(200).optional().allow(''),
  livro: Joi.string().max(200).optional().allow(''),
  categoria: Joi.string().valid(
    'AUTO_AJUDA', 'FILOSOFIA', 'DITADO_POPULAR', 
    'PROVERBIO', 'VERSO_BIBLIA', 'OUTROS'
  ).default('OUTROS')
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (categoria && categoria !== 'TODOS') {
      where.categoria = categoria;
    }
    if (search) {
      where.OR = [
        { frase: { contains: search, mode: 'insensitive' } },
        { autor: { contains: search, mode: 'insensitive' } },
        { livro: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [frases, total] = await Promise.all([
      prisma.frase.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          frase: true,
          autor: true,
          livro: true,
          views: true,
          curtidas: true,
          categoria: true,
          createdAt: true
        }
      }),
      prisma.frase.count({ where })
    ]);

    res.json({
      frases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar frases:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/random', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const frasesNaoVisualizadas = await prisma.frase.findMany({
      where: {
        NOT: {
          visualizacoes: {
            some: { userId }
          }
        }
      },
      select: {
        id: true,
        frase: true,
        autor: true,
        livro: true,
        views: true,
        curtidas: true,
        categoria: true,
        createdAt: true
      }
    });

    let fraseEscolhida;
    if (frasesNaoVisualizadas.length > 0) {
      const randomIndex = Math.floor(Math.random() * frasesNaoVisualizadas.length);
      fraseEscolhida = frasesNaoVisualizadas[randomIndex];
    } else {
      const totalFrases = await prisma.frase.count();
      if (totalFrases === 0) {
        return res.status(404).json({ error: 'Nenhuma frase encontrada' });
      }
      
      const randomSkip = Math.floor(Math.random() * totalFrases);
      fraseEscolhida = await prisma.frase.findFirst({
        skip: randomSkip,
        select: {
          id: true,
          frase: true,
          autor: true,
          livro: true,
          views: true,
          curtidas: true,
          categoria: true,
          createdAt: true
        }
      });
    }

    await prisma.$transaction([
      prisma.frase.update({
        where: { id: fraseEscolhida.id },
        data: { views: { increment: 1 } }
      }),
      prisma.visualizacao.upsert({
        where: {
          userId_fraseId: {
            userId,
            fraseId: fraseEscolhida.id
          }
        },
        update: { viewedAt: new Date() },
        create: {
          userId,
          fraseId: fraseEscolhida.id
        }
      })
    ]);

    const jaVisualizou = frasesNaoVisualizadas.length === 0;
    
    res.json({
      frase: {
        ...fraseEscolhida,
        views: fraseEscolhida.views + 1
      },
      jaVisualizou
    });
  } catch (error) {
    console.error('Erro ao buscar frase aleatória:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const frase = await prisma.frase.findUnique({
      where: { id },
      select: {
        id: true,
        frase: true,
        autor: true,
        livro: true,
        views: true,
        curtidas: true,
        categoria: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!frase) {
      return res.status(404).json({ error: 'Frase não encontrada' });
    }

    res.json({ frase });
  } catch (error) {
    console.error('Erro ao buscar frase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = fraseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const frase = await prisma.frase.create({
      data: value,
      select: {
        id: true,
        frase: true,
        autor: true,
        livro: true,
        views: true,
        curtidas: true,
        categoria: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Frase criada com sucesso',
      frase
    });
  } catch (error) {
    console.error('Erro ao criar frase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = fraseSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const frase = await prisma.frase.update({
      where: { id },
      data: value,
      select: {
        id: true,
        frase: true,
        autor: true,
        livro: true,
        views: true,
        curtidas: true,
        categoria: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Frase atualizada com sucesso',
      frase
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Frase não encontrada' });
    }
    console.error('Erro ao atualizar frase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.frase.delete({
      where: { id }
    });

    res.json({ message: 'Frase deletada com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Frase não encontrada' });
    }
    console.error('Erro ao deletar frase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/:id/curtir', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.curtida.findUnique({
      where: {
        userId_fraseId: { userId, fraseId: id }
      }
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.curtida.delete({
          where: { id: existingLike.id }
        }),
        prisma.frase.update({
          where: { id },
          data: { curtidas: { decrement: 1 } }
        })
      ]);

      res.json({ message: 'Curtida removida', curtiu: false });
    } else {
      await prisma.$transaction([
        prisma.curtida.create({
          data: { userId, fraseId: id }
        }),
        prisma.frase.update({
          where: { id },
          data: { curtidas: { increment: 1 } }
        })
      ]);

      res.json({ message: 'Frase curtida', curtiu: true });
    }
  } catch (error) {
    console.error('Erro ao curtir frase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;