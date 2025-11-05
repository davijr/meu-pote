const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');
const SchedulerService = require('../services/schedulerService');

const router = express.Router();

const subscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required()
  }).required()
});

router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = subscriptionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await NotificationService.subscribeUser(userId, value);

    res.status(201).json({
      message: 'Subscription criada com sucesso',
      success: true
    });
  } catch (error) {
    console.error('Erro ao criar subscription:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint é obrigatório' });
    }

    await NotificationService.unsubscribeUser(userId, endpoint);

    res.json({
      message: 'Subscription removida com sucesso',
      success: true
    });
  } catch (error) {
    console.error('Erro ao remover subscription:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/test', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoria } = req.body;

    await SchedulerService.sendTestNotification(userId, categoria);

    res.json({
      message: 'Notificação de teste enviada com sucesso',
      success: true
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BukQGpn9SqMfTBUmjXp1plAcqfcQIuyHdl1NurAKRHSQNC-FSDQPUrQ';
  
  res.json({
    publicKey
  });
});

module.exports = router;