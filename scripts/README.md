# Scripts Úteis

Este diretório contém scripts auxiliares para o projeto Meu Pote de Frases.

## 📜 Scripts Disponíveis

### `generate-secrets.sh`

Gera todas as secrets necessárias para o deploy em produção.

**Uso:**
```bash
bash scripts/generate-secrets.sh
```

**O que gera:**
- JWT Secret (32+ caracteres aleatórios)
- PostgreSQL Password
- Redis Password
- Instruções para gerar VAPID Keys

**Saída:**
- Imprime as secrets no terminal
- Cria arquivo temporário `.env.generated.tmp` com template preenchido

**⚠️ Importante:**
- NÃO commite o arquivo `.env.generated.tmp` no Git
- Guarde as secrets em um gerenciador de senhas seguro
- Use essas secrets no Coolify (Settings > Environment Variables)

## 🔐 Gerando VAPID Keys

Para notificações push, você precisa de chaves VAPID:

```bash
npx web-push generate-vapid-keys
```

Isso irá gerar:
- Public Key (use em `VAPID_PUBLIC_KEY` e `NEXT_PUBLIC_VAPID_PUBLIC_KEY`)
- Private Key (use em `VAPID_PRIVATE_KEY`)

## 📚 Mais Informações

Para mais detalhes sobre deploy, consulte:
- [DEPLOY.md](../DEPLOY.md) - Guia completo de deploy no Coolify
- [.env.example](../.env.example) - Template de variáveis de ambiente
