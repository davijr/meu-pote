# Meu Pote - Sistema de Frases Motivacionais

Sistema completo para compartilhamento de frases motivacionais com agendamento de notificações push.

## 🚀 Tecnologias

### Backend
- **Node.js** + **TypeScript** + **Express**
- **PostgreSQL** + **Prisma ORM**
- **Redis** para cache e sessões
- **JWT** para autenticação
- **Web Push** para notificações

### Frontend
- **Next.js 14** + **TypeScript**
- **Tailwind CSS** para estilização
- **React Hook Form** para formulários
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações

## 📋 Funcionalidades

- ✅ Sistema de autenticação completo (login/registro)
- ✅ CRUD de frases motivacionais
- ✅ Sistema de curtidas e visualizações
- ✅ Agendamento de notificações push
- ✅ Filtros por categoria e busca
- ✅ Dashboard com estatísticas do usuário
- ✅ Interface responsiva e moderna

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Redis
- Docker (opcional)

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd meu-pote
```

2. **Configure o Backend**
```bash
cd server
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

3. **Configure o Frontend**
```bash
cd ../client
npm install
npm run dev
```

4. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Docker Compose

```bash
# Inicie todos os serviços
docker-compose up -d

# Acesse a aplicação em http://localhost:3000
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/meu_pote
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
VAPID_PUBLIC_KEY=sua_vapid_public_key
VAPID_PRIVATE_KEY=sua_vapid_private_key
```

### Gerando Chaves VAPID

```bash
npx web-push generate-vapid-keys
```

## 📱 Notificações Push

O sistema suporta notificações push para lembrar os usuários de suas frases agendadas:

1. O usuário pode ativar notificações na página de perfil
2. Configurar agendamentos com dias da semana e horários
3. Receber notificações automáticas no navegador

## 🗂️ Estrutura do Projeto

```
meu-pote/
├── server/                 # Backend Node.js
│   ├── controllers/        # Controladores da API
│   ├── middleware/         # Middlewares
│   ├── routes/            # Rotas da API
│   ├── services/          # Lógica de negócio
│   ├── prisma/            # Schema e migrações
│   └── utils/             # Utilitários
├── client/                # Frontend Next.js
│   ├── app/               # App Router (Next.js 14)
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários e contextos
│   └── public/            # Arquivos estáticos
└── docker-compose.yml     # Configuração Docker
```

## 🧪 Scripts Disponíveis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar produção
npm run migrate      # Executar migrações
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar produção
npm run lint         # Linter
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Frases
- `GET /api/frases` - Listar frases
- `POST /api/frases` - Criar frase
- `GET /api/frases/random` - Frase aleatória
- `POST /api/frases/:id/like` - Curtir frase

### Agendamentos
- `GET /api/schedules` - Listar agendamentos
- `POST /api/schedules` - Criar agendamento
- `PUT /api/schedules/:id` - Atualizar agendamento
- `DELETE /api/schedules/:id` - Deletar agendamento

### Notificações
- `POST /api/notifications/subscribe` - Inscrever para notificações
- `POST /api/notifications/unsubscribe` - Desinscrever
- `GET /api/notifications/vapid-public-key` - Chave pública VAPID

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Problemas Conhecidos

- As notificações push requerem HTTPS em produção
- Service Worker precisa ser registrado manualmente em alguns navegadores
- Redis é necessário para o sistema de agendamentos funcionar corretamente

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.