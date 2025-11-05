#!/bin/bash

# Script para gerar secrets necessárias para deploy
# Uso: bash scripts/generate-secrets.sh

echo "🔐 Gerando Secrets para Deploy do Meu Pote de Frases"
echo "======================================================"
echo ""

# Verificar se os comandos necessários estão disponíveis
command -v openssl >/dev/null 2>&1 || { echo "❌ openssl não encontrado. Por favor, instale-o."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node não encontrado. Por favor, instale-o."; exit 1; }

echo "1️⃣  JWT Secret (32+ caracteres):"
JWT_SECRET=$(openssl rand -base64 32)
echo "$JWT_SECRET"
echo ""

echo "2️⃣  PostgreSQL Password:"
POSTGRES_PASSWORD=$(openssl rand -base64 24)
echo "$POSTGRES_PASSWORD"
echo ""

echo "3️⃣  Redis Password:"
REDIS_PASSWORD=$(openssl rand -base64 24)
echo "$REDIS_PASSWORD"
echo ""

echo "4️⃣  VAPID Keys (Push Notifications):"
echo "Execute o seguinte comando para gerar VAPID keys:"
echo "npx web-push generate-vapid-keys"
echo ""
echo "Gerando VAPID keys agora..."
npx web-push generate-vapid-keys
echo ""

echo "✅ Secrets geradas com sucesso!"
echo ""
echo "📋 Copie os valores acima e adicione no Coolify em:"
echo "   Settings > Environment Variables"
echo ""
echo "⚠️  IMPORTANTE: Guarde esses valores em um local seguro!"
echo "   Você precisará deles para configurar o deploy."
echo ""

# Criar arquivo temporário com template
TEMP_FILE=".env.generated.tmp"
cat > "$TEMP_FILE" << EOF
# ===================================================
# Secrets Geradas em: $(date)
# ===================================================

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Database
POSTGRES_DB=meupote
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@db:5432/meupote

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

# Frontend
FRONTEND_URL=https://meupote.davijr.com
NEXT_PUBLIC_API_URL=http://backend:3001

# VAPID (gere com: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=<COLE_AQUI_A_PUBLIC_KEY>
VAPID_PRIVATE_KEY=<COLE_AQUI_A_PRIVATE_KEY>
VAPID_SUBJECT=mailto:seu-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<COLE_AQUI_A_PUBLIC_KEY>

# Optional
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "📄 Arquivo temporário criado: $TEMP_FILE"
echo "   Você pode usar este arquivo como referência."
echo "   ⚠️  NÃO COMMITE ESTE ARQUIVO NO GIT!"
echo ""
echo "🎉 Pronto! Agora configure essas variáveis no Coolify."
