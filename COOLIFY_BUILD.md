# ⚠️ IMPORTANTE: Configuração do Coolify

Este projeto usa **Docker Compose** para orquestração de múltiplos serviços.

## ❌ NÃO USE DOCKERFILE ÚNICO

Este projeto **NÃO** deve ser deployado usando um Dockerfile único na raiz.

## ✅ USE DOCKER COMPOSE

Configure o Coolify para usar: `docker-compose.production.yml`

---

## 📝 Configuração no Coolify

### Passo 1: Settings > Build

- **Build Pack**: `Docker Compose`
- **Docker Compose Location**: `./`
- **Docker Compose File**: `docker-compose.production.yml`
- **Docker Compose Command**: `docker compose`

### Passo 2: Settings > General

- **Port Exposes**: `3000`
- **Expose Port**: `3000` (frontend)

### Passo 3: Environment Variables

Adicione todas as variáveis de ambiente conforme `COOLIFY_SETUP.md`

---

## 🏗️ Arquitetura

Este projeto é um monorepo com:

```
meu-pote/
├── client/              # Frontend Next.js
│   └── Dockerfile      # Build separado do frontend
├── server/             # Backend Express
│   └── Dockerfile      # Build separado do backend
└── docker-compose.production.yml  # Orquestração completa
```

**4 Serviços:**
1. `frontend` - Next.js (porta 3000) - EXPOSTO
2. `backend` - Express API (porta 3001) - INTERNO
3. `db` - PostgreSQL - INTERNO
4. `redis` - Redis Cache - INTERNO

---

## 🚫 Por que não há Dockerfile na raiz?

O Dockerfile na raiz foi **removido** porque:

1. ❌ Causava confusão com o Coolify
2. ❌ Tentava fazer build de tudo junto (impossível)
3. ❌ Não instalava dependências corretamente
4. ❌ Era apenas para desenvolvimento local

---

## ✅ Estrutura Correta

Cada serviço tem seu próprio Dockerfile:

- `client/Dockerfile` - Build otimizado do Next.js com standalone mode
- `server/Dockerfile` - Build do backend com Prisma migrations

O `docker-compose.production.yml` orquestra tudo!

---

## 📚 Documentação

Leia: `COOLIFY_SETUP.md` para instruções completas.
