# 🚀 Deploy Guide - Meu Pote de Frases no Coolify

Este guia contém instruções detalhadas para fazer o deploy da aplicação **Meu Pote de Frases** no Coolify.

## 📋 Pré-requisitos

- Servidor Coolify rodando em: `admin.davijr.com`
- Resource "meupote" já criado no Coolify
- Acesso ao repositório Git do projeto
- Domínio configurado: `meupote.davijr.com`

## 🏗️ Arquitetura de Deploy

A aplicação é composta por 4 serviços:

1. **Frontend** (Next.js) - Porta 3000
2. **Backend** (Node.js/Express) - Porta 3001
3. **PostgreSQL** - Banco de dados
4. **Redis** - Cache e sessões

## 📝 Passo a Passo do Deploy

### 1. Preparar o Repositório

Certifique-se de que os seguintes arquivos estão commitados:

```bash
git status
git add .
git commit -m "Configure Coolify deployment pipeline"
git push origin main
```

### 2. Configurar o Coolify

#### 2.1. Acessar o Coolify

1. Acesse: `https://admin.davijr.com`
2. Faça login com suas credenciais
3. Navegue até o resource "meupote"

#### 2.2. Configurar o Source

1. Vá em **Settings** > **Source**
2. Configure o repositório Git:
   - Repository URL: URL do seu repositório
   - Branch: `main` (ou branch desejada)
   - Build Pack: **Docker Compose**

#### 2.3. Configurar Build Settings

1. Em **Settings** > **Build**:
   - Docker Compose File: `docker-compose.production.yml`
   - Build Command: (deixe vazio, usa default)

### 3. Configurar Variáveis de Ambiente

No Coolify, vá em **Environment Variables** e adicione:

#### 3.1. Gerar Secrets

**JWT Secret:**
```bash
openssl rand -base64 32
```

**VAPID Keys (Push Notifications):**
```bash
npx web-push generate-vapid-keys
```

**PostgreSQL Password:**
```bash
openssl rand -base64 24
```

**Redis Password:**
```bash
openssl rand -base64 24
```

#### 3.2. Adicionar Variáveis no Coolify

Copie as variáveis de `.env.example` e preencha com seus valores:

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:SEU_PASSWORD_POSTGRES@db:5432/meupote
POSTGRES_DB=meupote
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SEU_PASSWORD_POSTGRES

# Redis
REDIS_URL=redis://:SEU_PASSWORD_REDIS@redis:6379
REDIS_PASSWORD=SEU_PASSWORD_REDIS

# JWT
JWT_SECRET=SEU_JWT_SECRET
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://meupote.davijr.com
NEXT_PUBLIC_API_URL=http://backend:3001

# VAPID (Push Notifications)
VAPID_PUBLIC_KEY=SUA_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY=SUA_VAPID_PRIVATE_KEY
VAPID_SUBJECT=mailto:seu-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=SUA_VAPID_PUBLIC_KEY

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar Domínio

1. Vá em **Settings** > **Domains**
2. Adicione o domínio: `meupote.davijr.com`
3. Configure o port forwarding:
   - Domain: `meupote.davijr.com` → Service: `frontend:3000`
4. Habilite SSL/HTTPS (Coolify gerencia automaticamente com Let's Encrypt)

### 5. Configurar Persistent Volumes

O Coolify detecta automaticamente os volumes do docker-compose:

- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis

Verifique em **Settings** > **Storages** se os volumes estão mapeados corretamente.

### 6. Deploy Inicial

1. Vá em **Deployments**
2. Clique em **Deploy**
3. Acompanhe os logs em tempo real

O processo de deploy irá:
- Fazer pull do repositório
- Build das imagens Docker (frontend e backend)
- Pull das imagens do PostgreSQL e Redis
- Criar a network
- Iniciar os containers
- Rodar migrations do Prisma automaticamente

### 7. Verificar o Deploy

#### 7.1. Health Checks

Verifique se todos os serviços estão rodando:

```bash
# No Coolify, vá em "Logs" e verifique cada serviço
```

#### 7.2. Acessar a Aplicação

- Frontend: `https://meupote.davijr.com`
- API Health: `https://meupote.davijr.com/api/health`

#### 7.3. Verificar Logs

No Coolify:
1. Vá em **Logs**
2. Selecione cada serviço para ver logs individuais:
   - frontend
   - backend
   - db
   - redis

## 🔄 Deploys Subsequentes

### Automático (Recomendado)

Configure Webhook no Coolify:
1. Vá em **Settings** > **Webhooks**
2. Copie a Webhook URL
3. Adicione no GitHub/GitLab:
   - GitHub: Settings > Webhooks > Add webhook
   - GitLab: Settings > Webhooks > Add new webhook
4. Configure para trigger em `push` events na branch `main`

### Manual

No Coolify:
1. Vá em **Deployments**
2. Clique em **Deploy** (faz pull e rebuild automaticamente)

## 🛠️ Troubleshooting

### Problema: Frontend não conecta com Backend

**Solução:**
- Verifique se a variável `NEXT_PUBLIC_API_URL` está configurada
- Verifique os logs do backend
- Verifique se o serviço backend está rodando

### Problema: Erro de Database Connection

**Solução:**
```bash
# No Coolify, vá em "Console" do serviço backend e execute:
npx prisma migrate deploy
npx prisma generate
```

### Problema: Push Notifications não funcionam

**Solução:**
- Verifique se as VAPID keys estão configuradas corretamente
- Verifique se `VAPID_SUBJECT` está no formato `mailto:email@example.com`
- Verifique se o domínio tem HTTPS ativo

### Problema: Build falha

**Solução:**
- Verifique os logs de build no Coolify
- Certifique-se que os Dockerfiles estão corretos
- Verifique se todas as dependências estão no package.json

## 🔐 Segurança

### Checklist Pós-Deploy

- [ ] Todas as variáveis de ambiente estão usando valores seguros
- [ ] Passwords foram gerados aleatoriamente
- [ ] JWT_SECRET tem no mínimo 32 caracteres
- [ ] HTTPS está ativo no domínio
- [ ] Backups do banco de dados estão configurados
- [ ] Logs estão sendo monitorados

### Backup do Banco de Dados

Configure backup regular no Coolify:

1. Vá em **Settings** > **Backups**
2. Configure backup diário do volume `postgres_data`
3. Configure retenção de backups (ex: 7 dias)

## 📊 Monitoramento

### Métricas Disponíveis no Coolify

- CPU Usage
- Memory Usage
- Network I/O
- Disk Usage

### Logs

Acesse logs em tempo real:
1. **Coolify UI** > Logs
2. Filtrar por serviço
3. Filtrar por timestamp

## 🚀 Otimizações de Performance

### 1. Cache do Redis

O Redis está configurado para cache de:
- Sessões de usuário
- Queries frequentes
- Rate limiting

### 2. Health Checks

Health checks estão configurados para:
- Frontend: HTTP GET `/`
- Backend: HTTP GET `/health`
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

### 3. Restart Policy

Todos os serviços estão configurados com `restart: unless-stopped` para alta disponibilidade.

## 📱 Rollback

Em caso de problemas, fazer rollback:

1. No Coolify, vá em **Deployments**
2. Clique em **History**
3. Selecione o deploy anterior que funcionava
4. Clique em **Redeploy**

Ou via Git:

```bash
git revert HEAD
git push origin main
# Aguarde webhook trigger ou faça deploy manual
```

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs no Coolify
2. Consulte a documentação do Coolify: https://coolify.io/docs
3. Verifique issues conhecidas em `KNOWN_ISSUES.md`

## 📚 Referências

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Última atualização:** 05/11/2024
**Versão:** 1.0.0
