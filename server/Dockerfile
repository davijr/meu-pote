FROM node:18-alpine

WORKDIR /app

# Instalar dependências necessárias para Prisma e health checks
RUN apk add --no-cache openssl libc6-compat wget

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para Prisma)
RUN npm ci

# Copiar código fonte e migrations
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Nota: NÃO removemos devDependencies porque precisamos do pacote 'prisma'
# para rodar migrations no startup com 'npx prisma migrate deploy'

EXPOSE 3001

# Script de inicialização que roda migrations antes de iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]