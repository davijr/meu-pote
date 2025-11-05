# Guia de Configuração do Ambiente de Desenvolvimento

Este documento fornece instruções detalhadas para configurar e executar o projeto "Meu Pote" localmente.

## 1. Pré-requisitos do Ambiente

### Versões de Software Necessárias
- **Node.js**: v18.x ou superior
- **npm**: v9.x ou superior
- **Docker** (opcional): v20.x ou superior
- **Docker Compose** (opcional): v2.x ou superior

### Dependências de Sistema Operacional
- Windows 10/11, macOS ou Linux
- Mínimo de 4GB de RAM disponível
- 1GB de espaço em disco

### Ferramentas Adicionais
- Git
- Editor de código (recomendado: VS Code)
- Terminal (PowerShell, Git Bash ou similar)

## 2. Configuração Inicial

### Clonando o Repositório
```bash
# Via HTTPS
git clone https://github.com/seu-usuario/meu-pote.git

# Via SSH (se configurado)
git clone git@github.com:seu-usuario/meu-pote.git

# Navegue para o diretório do projeto
cd meu-pote
```

### Instalando Dependências

#### Instalação de Dependências do Projeto Principal
```bash
npm install
```

#### Instalação de Dependências do Cliente (Frontend)
```bash
cd client
npm install
cd ..
```

#### Instalação de Dependências do Servidor (Backend)
```bash
cd server
npm install
cd ..
```

### Configuração de Variáveis de Ambiente

#### Para o Servidor (Backend)
Crie um arquivo `.env` no diretório `server/` com base no exemplo abaixo:

```
# Configuração do Servidor
PORT=3001
NODE_ENV=development

# Configuração do Banco de Dados
DATABASE_URL="file:./dev.db"  # SQLite para desenvolvimento local
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meu_pote"  # PostgreSQL

# Configuração do Redis (opcional)
REDIS_URL="redis://localhost:6379"

# Configuração de JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Configuração de CORS
CORS_ORIGIN=http://localhost:3000
```

#### Para o Cliente (Frontend)
Crie um arquivo `.env.local` no diretório `client/` com base no exemplo abaixo:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 3. Execução do Projeto

### Inicialização do Servidor (Backend)
```bash
cd server
npm run dev
```
O servidor estará disponível em: http://localhost:3001

### Inicialização do Cliente (Frontend)
```bash
cd client
npm run dev
```
O cliente estará disponível em: http://localhost:3000

### Ordem de Inicialização (Recomendada)
1. Banco de dados (se usando Docker)
2. Servidor (Backend)
3. Cliente (Frontend)

### Portas Utilizadas
- **Cliente (Frontend)**: 3000
- **Servidor (Backend)**: 3001
- **PostgreSQL** (se usando Docker): 5432
- **Redis** (se usando Docker): 6379

### Inicialização com Docker (Opcional)
Se você optar por usar Docker para os serviços de banco de dados:

```bash
# Inicia apenas PostgreSQL e Redis
docker-compose up db redis -d

# Inicia todos os serviços (incluindo backend e frontend)
docker-compose up -d
```

## 4. Banco de Dados

### Configuração do Banco de Dados

#### Opção 1: SQLite (Desenvolvimento Local)
Para desenvolvimento local sem Docker, o projeto está configurado para usar SQLite:

```bash
cd server
npx prisma migrate dev --name init
```

#### Opção 2: PostgreSQL (Docker ou Local)
Se você estiver usando PostgreSQL:

1. Certifique-se de que o PostgreSQL esteja em execução
2. Atualize o `DATABASE_URL` no arquivo `.env` do servidor
3. Execute as migrações:

```bash
cd server
npx prisma migrate dev --name init
```

### Seed de Dados
Para popular o banco de dados com dados iniciais:

```bash
cd server
npx prisma db seed
```

### Visualização do Banco de Dados
Para visualizar e gerenciar o banco de dados através do Prisma Studio:

```bash
cd server
npx prisma studio
```
O Prisma Studio estará disponível em: http://localhost:5555

## 5. Testes

### Executando Testes Unitários
```bash
# Para o servidor
cd server
npm test

# Para o cliente
cd client
npm test
```

### Executando Testes de Integração
```bash
# Para o servidor
cd server
npm run test:integration

# Para o cliente
cd client
npm run test:integration
```

### Cobertura de Testes
Para gerar relatórios de cobertura de testes:

```bash
# Para o servidor
cd server
npm run test:coverage

# Para o cliente
cd client
npm run test:coverage
```

A cobertura esperada é de pelo menos 70% para componentes críticos.

### Dependências para Testes
- Jest
- React Testing Library (frontend)
- Supertest (backend)

## 6. Fluxo de Desenvolvimento

### Convenções de Branch
- `main`: Branch principal, contém código de produção
- `develop`: Branch de desenvolvimento, para integração de features
- `feature/nome-da-feature`: Para desenvolvimento de novas funcionalidades
- `bugfix/nome-do-bug`: Para correção de bugs
- `hotfix/nome-do-hotfix`: Para correções urgentes em produção

### Padrões de Commit
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

Tipos comuns:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Alterações que não afetam o código (formatação, etc)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Alterações no processo de build, ferramentas, etc

### Processo de Code Review
1. Crie um Pull Request (PR) da sua branch para `develop`
2. Solicite revisão de pelo menos um outro desenvolvedor
3. Resolva todos os comentários e problemas identificados
4. Aguarde aprovação antes de fazer merge
5. Após o merge, a branch de feature pode ser excluída

## Problemas Conhecidos e Soluções

Consulte o arquivo [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) para uma lista de problemas conhecidos e suas soluções.

## Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)

---

Para qualquer dúvida adicional, entre em contato com a equipe de desenvolvimento.