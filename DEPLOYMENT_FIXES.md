# 🔧 Correções Necessárias para Deploy

## ❌ Problemas Identificados

### 🔴 CRÍTICO

#### 1. Schema Prisma configurado para SQLite em vez de PostgreSQL
**Arquivo:** `server/prisma/schema.prisma`
**Problema:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```
**Impacto:** O Docker Compose usa PostgreSQL, mas o schema está configurado para SQLite. Build vai falhar.

**Solução:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

#### 2. Migrations do Prisma não existem
**Diretório:** `server/prisma/migrations/`
**Problema:** Não há nenhuma migration criada
**Impacto:** `npx prisma migrate deploy` vai falhar no startup do container

**Solução:** Criar migrations iniciais após corrigir o schema

---

#### 3. Backend Dockerfile - npm prune antes de migrate
**Arquivo:** `server/Dockerfile`
**Problema:**
- Linha 21: `npm prune --production` remove devDependencies
- Linha 26: `npx prisma migrate deploy` precisa do pacote `prisma` (devDependency)

**Impacto:** Migrations vão falhar no startup do container

**Solução:** Não fazer prune ou manter prisma como dependency regular

---

#### 4. SchedulerService usando operador PostgreSQL 'has' em campo String
**Arquivo:** `server/services/schedulerService.js` (linhas 30-32)
**Problema:**
```javascript
diasSemana: {
  has: currentDay  // 'has' é para arrays PostgreSQL
}
```
Mas no schema: `diasSemana String` (JSON string)

**Impacto:** Queries vão falhar em runtime

**Solução:**
- Opção 1: Mudar schema para `diasSemana Int[]`
- Opção 2: Parse do JSON no código

---

### 🟡 IMPORTANTE

#### 5. Health check do backend apontando para endpoint errado
**Arquivo:** `docker-compose.production.yml` (linha 28)
**Problema:**
```yaml
test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
```
Mas o endpoint correto é: `/api/health`

**Impacto:** Health checks sempre vão falhar

**Solução:**
```yaml
test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
```

---

#### 6. Redis health check sem autenticação
**Arquivo:** `docker-compose.production.yml` (linha 88)
**Problema:**
```yaml
test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
```
Redis está configurado com senha (`--requirepass`), mas health check não usa auth

**Impacto:** Health checks sempre vão falhar

**Solução:**
```yaml
test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
```
Ou melhor:
```yaml
test: ["CMD", "sh", "-c", "redis-cli -a $$REDIS_PASSWORD ping | grep PONG"]
```

---

#### 7. API URL duplicando /api no path
**Arquivos:** `client/lib/api.ts` e `client/next.config.js`
**Problema:**
- `api.ts` (linha 6): baseURL já inclui `/api`
- `next.config.js` (linha 9): rewrite adiciona `/api` novamente

**Impacto:** Requests vão para `/api/api/...` causando 404

**Solução:** Remover `/api` da baseURL em `api.ts`:
```typescript
baseURL: process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:3001',  // SEM /api
```

---

#### 8. VAPID subject hardcoded
**Arquivo:** `server/services/notificationService.js` (linha 7)
**Problema:**
```javascript
webpush.setVapidDetails(
  'mailto:admin@meupote.com',  // Hardcoded
  process.env.VAPID_PUBLIC_KEY || 'default',
  process.env.VAPID_PRIVATE_KEY || 'default'
);
```

**Impacto:** Notificações podem falhar se o domínio não corresponder

**Solução:**
```javascript
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@meupote.davijr.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

---

### 🟢 MELHORIAS

#### 9. Frontend Dockerfile - variáveis de ambiente em build time
**Arquivo:** `client/Dockerfile`
**Problema:** Variáveis `NEXT_PUBLIC_*` precisam estar disponíveis em build time, não só runtime

**Solução:** Adicionar ARGs no Dockerfile:
```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

---

#### 10. Falta .dockerignore
**Problema:** Sem `.dockerignore`, o build copia arquivos desnecessários

**Solução:** Criar `.dockerignore` nos diretórios client e server

---

## ✅ Ordem de Correção

1. ✅ Corrigir schema Prisma para PostgreSQL
2. ✅ Criar migrations iniciais
3. ✅ Corrigir Backend Dockerfile (npm prune)
4. ✅ Corrigir SchedulerService (diasSemana)
5. ✅ Corrigir health checks (backend e redis)
6. ✅ Corrigir API URL duplicada
7. ✅ Corrigir VAPID subject
8. ✅ Melhorar Frontend Dockerfile
9. ✅ Criar .dockerignore

---

## ✅ Correções Aplicadas

Todas as 10 correções foram implementadas com sucesso:

1. ✅ Schema Prisma migrado para PostgreSQL
2. ✅ Migration inicial criada (20241105000000_init)
3. ✅ Backend Dockerfile corrigido (mantém devDependencies para migrations)
4. ✅ SchedulerService compatível com Int[] (array PostgreSQL)
5. ✅ Health checks corrigidos (backend: /api/health, redis: auth)
6. ✅ API URL corrigida (sem duplicação de /api)
7. ✅ VAPID subject usando variável de ambiente
8. ✅ Frontend Dockerfile com build args para NEXT_PUBLIC_*
9. ✅ .dockerignore criados (client e server)
10. ✅ Docker compose atualizado com build args

---

**Status:** ✅ COMPLETO - Pronto para deploy!
**Data:** 05/11/2024
**Próximo passo:** Commit e push, depois configurar no Coolify
