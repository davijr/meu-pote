require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const SchedulerService = require('./services/schedulerService');

const authRoutes = require('./routes/auth');
const frasesRoutes = require('./routes/frases');
const usersRoutes = require('./routes/users');
const schedulesRoutes = require('./routes/schedules');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://meupote.davijr.com']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/frases', frasesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    SchedulerService.init();
    console.log('✅ Serviço de agendamento iniciado');
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 Encerrando servidor...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

module.exports = app;