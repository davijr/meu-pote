FROM node:18-alpine

WORKDIR /app

# Instalar dependências necessárias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências incluindo devDependencies para gerar Prisma
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Remover devDependencies após build
RUN npm prune --production

EXPOSE 3001

# Script de inicialização que roda migrations antes de iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]