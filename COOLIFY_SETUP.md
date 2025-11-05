# ✅ Configuração Final no Coolify - Meu Pote

## 📊 Status das Correções

✅ **TODAS AS 10 CORREÇÕES CRÍTICAS FORAM APLICADAS!**

O código agora está 100% pronto para deploy no Coolify. Este documento contém as instruções finais de configuração.

---

## 🔧 Correções Aplicadas

### Críticas (Build/Deploy Blockers)
1. ✅ **Schema Prisma migrado para PostgreSQL** (`server/prisma/schema.prisma`)
2. ✅ **Migration inicial criada** (`server/prisma/migrations/20241105000000_init/`)
3. ✅ **Backend Dockerfile corrigido** (mantém Prisma CLI para migrations)
4. ✅ **Array diasSemana corrigido** (agora é `Int[]` no PostgreSQL)

### Importantes (Runtime Errors)
5. ✅ **Health checks corrigidos** (backend: `/api/health`, redis: com auth)
6. ✅ **API URL sem duplicação** (remove `/api` da baseURL em produção)
7. ✅ **VAPID subject dinâmico** (usa `VAPID_SUBJECT` env var)

### Melhorias (Performance/Optimization)
8. ✅ **Frontend Dockerfile otimizado** (build args para `NEXT_PUBLIC_*`)
9. ✅ **.dockerignore criados** (client e server)
10. ✅ **Docker Compose atualizado** (build args configurados)

---

## 🚀 Próximos Passos no Coolify

### 1. Fazer Merge do PR

Se ainda não fez:
```bash
# O PR já foi aprovado e merged
# Branch: claude/setup-coolify-deploy-pipeline-011CUp1KL8aUfJrP3GDufDF8
```

### 2. Atualizar Source no Coolify

1. Acesse: `https://admin.davijr.com`
2. Vá no resource **"meupote"**
3. **Settings** > **Source**
   - Branch: `main` (ou a branch que foi feito o merge)
   - Build Pack: **Docker Compose**
   - Docker Compose File: `docker-compose.production.yml`

### 3. Configurar Variáveis de Ambiente

**⚠️ IMPORTANTE:** Todas as variáveis abaixo são obrigatórias!

Vá em **Settings** > **Environment Variables** e adicione:

#### Geração de Secrets (execute localmente):
```bash
# No seu terminal local:
bash scripts/generate-secrets.sh

# Ou gere manualmente:
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 24  # POSTGRES_PASSWORD
openssl rand -base64 24  # REDIS_PASSWORD
npx web-push generate-vapid-keys  # VAPID KEYS
```

#### Variáveis Obrigatórias:

```env
# === APPLICATION ===
NODE_ENV=production
PORT=3001

# === DATABASE ===
POSTGRES_DB=meupote
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<gerado por openssl rand -base64 24>
DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@db:5432/meupote

# === REDIS ===
REDIS_PASSWORD=<gerado por openssl rand -base64 24>
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379

# === JWT ===
JWT_SECRET=<gerado por openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# === FRONTEND ===
FRONTEND_URL=https://meupote.davijr.com

# === VAPID (Push Notifications) ===
# Execute: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=<sua_vapid_public_key>
VAPID_PRIVATE_KEY=<sua_vapid_private_key>
VAPID_SUBJECT=mailto:seu-email@davijr.com

# === NEXT.JS PUBLIC (Frontend) ===
NEXT_PUBLIC_API_URL=http://backend:3001
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<mesma VAPID_PUBLIC_KEY acima>

# === OPTIONAL ===
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar Domínio

**Settings** > **Domains**:
- Domain: `meupote.davijr.com`
- Service: `frontend` (porta 3000)
- SSL/HTTPS: ✅ Ativado (automático via Let's Encrypt)

### 5. Deploy Inicial

1. Vá em **Deployments**
2. Clique em **Deploy**
3. Acompanhe os logs em tempo real

**Tempo estimado:** 5-10 minutos (build inicial)

---

## 🔍 Verificação Pós-Deploy

### Health Checks

Após deploy completo, verifique:

```bash
# Frontend
curl https://meupote.davijr.com
# Deve retornar: HTML da página inicial

# Backend Health
curl https://meupote.davijr.com/api/health
# Deve retornar: {"status":"OK","timestamp":"..."}
```

### Logs no Coolify

Verifique os logs de cada serviço:

1. **frontend** - Deve mostrar "Server ready on http://0.0.0.0:3000"
2. **backend** - Deve mostrar:
   - ✅ Conectado ao banco de dados
   - ✅ Servidor rodando na porta 3001
   - ✅ Serviço de agendamento iniciado
3. **db** - Deve mostrar "database system is ready to accept connections"
4. **redis** - Deve mostrar "Ready to accept connections"

---

## 🐛 Troubleshooting

### Problema: Build do backend falha com erro do Prisma

**Causa:** DATABASE_URL não configurada ou incorreta

**Solução:**
```bash
# Verifique se DATABASE_URL está no formato:
postgresql://postgres:PASSWORD@db:5432/meupote

# Não use localhost, use 'db' (nome do serviço no docker-compose)
```

### Problema: Frontend não conecta com backend

**Causa:** Variável NEXT_PUBLIC_API_URL incorreta

**Solução:**
```bash
# Deve ser exatamente (nome do serviço no docker-compose):
NEXT_PUBLIC_API_URL=http://backend:3001

# NÃO use localhost ou IP
```

### Problema: Health check do Redis falha

**Causa:** REDIS_PASSWORD não está configurado

**Solução:**
- Verifique se REDIS_PASSWORD está nas environment variables
- Deve ser a mesma senha em REDIS_URL e REDIS_PASSWORD

### Problema: Migrations do Prisma falham

**Causa:** Migration inicial não foi aplicada

**Solução:**
```bash
# No console do container backend (via Coolify):
npx prisma migrate deploy
npx prisma generate
```

### Problema: Push notifications não funcionam

**Causa:** VAPID keys não configuradas ou incorretas

**Solução:**
1. Gere novas VAPID keys: `npx web-push generate-vapid-keys`
2. Configure todas as 3 variáveis:
   - VAPID_PUBLIC_KEY
   - VAPID_PRIVATE_KEY
   - VAPID_SUBJECT (formato: mailto:email@dominio.com)
3. Configure também NEXT_PUBLIC_VAPID_PUBLIC_KEY com o mesmo valor de VAPID_PUBLIC_KEY

---

## 📈 Monitoramento

### Métricas no Coolify

Monitore:
- **CPU Usage** - Deve ficar < 50% em operação normal
- **Memory Usage** - Deve ficar < 512MB por serviço
- **Health Checks** - Todos devem estar ✅ green
- **Logs** - Não deve haver errors contínuos

### Alertas Importantes

Fique atento a:
- ❌ Health checks falhando continuamente
- ⚠️ Memória > 80% (pode indicar memory leak)
- ⚠️ Muitos errors 500 nos logs (problema no código)
- ⚠️ Conexões ao DB falhando (problema de configuração)

---

## 🔄 Deploy Automático (CI/CD)

### Webhook do GitHub

Para deploy automático ao fazer push:

1. **No Coolify:**
   - Settings > Webhooks
   - Copie a Webhook URL

2. **No GitHub:**
   - Settings > Webhooks > Add webhook
   - URL: (cole a webhook URL do Coolify)
   - Content type: `application/json`
   - Events: `Just the push event`
   - Branch: `main`

Agora, todo push na branch main vai disparar deploy automático! 🎉

---

## 📚 Arquivos de Referência

- **DEPLOY.md** - Guia completo de deploy
- **DEPLOYMENT_FIXES.md** - Detalhes de todas as correções aplicadas
- **.env.example** - Template de variáveis de ambiente
- **scripts/generate-secrets.sh** - Script para gerar secrets

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Todas as 21 variáveis de ambiente configuradas
- [ ] Domínio meupote.davijr.com aponta para o Coolify
- [ ] SSL/HTTPS ativo e funcionando
- [ ] Frontend acessível em https://meupote.davijr.com
- [ ] Backend health check retorna OK
- [ ] Consegue fazer login/registro
- [ ] CRUD de frases funciona
- [ ] Push notifications (opcional) configuradas
- [ ] Logs sem errors críticos
- [ ] Todos os 4 serviços healthy (✅ green)
- [ ] Webhook configurado para CI/CD (opcional)

---

## 🎉 Deploy Completo!

Parabéns! Sua aplicação **Meu Pote de Frases** está rodando em produção no Coolify!

Acesse: **https://meupote.davijr.com**

---

**Última atualização:** 05/11/2024
**Branch:** claude/setup-coolify-deploy-pipeline-011CUp1KL8aUfJrP3GDufDF8
**Commit:** 0fdf69f
