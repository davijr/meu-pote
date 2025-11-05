-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frases" (
    "id" TEXT NOT NULL,
    "frase" TEXT NOT NULL,
    "autor" TEXT,
    "livro" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "curtidas" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'OUTROS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visualizacoes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fraseId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visualizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curtidas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fraseId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curtidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "diasSemana" INTEGER[],
    "categoria" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoEnvio" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "visualizacoes_userId_fraseId_key" ON "visualizacoes"("userId", "fraseId");

-- CreateIndex
CREATE UNIQUE INDEX "curtidas_userId_fraseId_key" ON "curtidas"("userId", "fraseId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");

-- AddForeignKey
ALTER TABLE "visualizacoes" ADD CONSTRAINT "visualizacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visualizacoes" ADD CONSTRAINT "visualizacoes_fraseId_fkey" FOREIGN KEY ("fraseId") REFERENCES "frases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curtidas" ADD CONSTRAINT "curtidas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curtidas" ADD CONSTRAINT "curtidas_fraseId_fkey" FOREIGN KEY ("fraseId") REFERENCES "frases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
