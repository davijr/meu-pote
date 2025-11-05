# Problemas Conhecidos e Implementações Incompletas

**Data de criação:** 03/11/2025  
**Última atualização:** 03/11/2025

## Bugs Conhecidos

### 1. Erro de Conexão com Banco de Dados PostgreSQL
- **Título:** Falha na conexão com PostgreSQL via Docker
- **Passos para reprodução:**
  1. Iniciar o servidor backend com `npm run dev`
  2. Observar logs de erro no console
- **Comportamento atual:** Erro `PrismaClientInitializationError` indicando que o servidor de banco de dados em `db:5432` ou `localhost:5432` não pode ser alcançado
- **Comportamento esperado:** Conexão bem-sucedida com o banco de dados
- **Severidade:** Crítico
- **Data de identificação:** 03/11/2025
- **Status:** Em andamento

### 2. Erro de Importação de Componentes React
- **Título:** Erro de importação de componentes no Next.js
- **Passos para reprodução:**
  1. Iniciar o cliente Next.js com `npm run dev`
  2. Observar erros no console
- **Comportamento atual:** Erros "Attempted import error" para componentes `SearchBar`, `CategoryFilter`, `FraseCard` e `RandomFrase`
- **Comportamento esperado:** Importação correta dos componentes
- **Severidade:** Alto
- **Data de identificação:** 03/11/2025
- **Status:** Resolvido

### 3. Docker Desktop não está em execução
- **Título:** Falha ao iniciar serviços Docker
- **Passos para reprodução:**
  1. Executar `docker-compose up db redis`
  2. Observar mensagem de erro
- **Comportamento atual:** Erro indicando que o Docker Desktop Linux Engine não está disponível
- **Comportamento esperado:** Inicialização bem-sucedida dos serviços Docker
- **Severidade:** Alto
- **Data de identificação:** 03/11/2025
- **Status:** Aberto

### 4. Incompatibilidade do Schema Prisma com SQLite
- **Título:** Erro de validação do schema Prisma com SQLite
- **Passos para reprodução:**
  1. Configurar Prisma para usar SQLite
  2. Executar `npx prisma generate`
- **Comportamento atual:** Erros de validação relacionados a tipos não suportados (arrays e enums)
- **Comportamento esperado:** Schema compatível com SQLite
- **Severidade:** Médio
- **Data de identificação:** 03/11/2025
- **Status:** Em andamento

## Implementações Incompletas

### 1. Adaptação do Banco de Dados para Desenvolvimento Local
- **Nome da funcionalidade:** Configuração de banco de dados local
- **Estado atual:** Parcialmente implementado
- **Componentes/módulos afetados:**
  - `server/prisma/schema.prisma`
  - `server/.env`
- **Bloqueadores conhecidos:**
  - Incompatibilidade de tipos entre PostgreSQL e SQLite
  - Problemas de permissão ao regenerar o cliente Prisma
- **Próximos passos necessários:**
  1. Finalizar adaptação do schema para SQLite
  2. Executar migrações
  3. Testar conexão do servidor com o banco de dados

### 2. Sistema de Notificações Push
- **Nome da funcionalidade:** Notificações push para frases agendadas
- **Estado atual:** Implementação inicial presente, mas não testada
- **Componentes/módulos afetados:**
  - `server/services/notificationService.js`
  - `server/routes/notifications.js`
  - `client/public/sw.js`
- **Bloqueadores conhecidos:**
  - Dependência da conexão com banco de dados
  - Necessidade de testes em ambiente real
- **Próximos passos necessários:**
  1. Testar funcionalidade após resolver problemas de banco de dados
  2. Verificar integração entre frontend e backend
  3. Implementar tratamento de erros robusto

### 3. Agendamento de Frases
- **Nome da funcionalidade:** Sistema de agendamento de frases
- **Estado atual:** Estrutura básica implementada, mas não funcional
- **Componentes/módulos afetados:**
  - `server/services/schedulerService.js`
  - `server/routes/schedules.js`
  - `client/app/agendamentos/`
- **Bloqueadores conhecidos:**
  - Problemas com o formato de armazenamento de `diasSemana` no SQLite
  - Dependência da conexão com banco de dados
- **Próximos passos necessários:**
  1. Adaptar lógica para trabalhar com `diasSemana` como string JSON
  2. Implementar conversão entre string e array nos serviços
  3. Testar funcionalidade completa

## Análise Histórica

### Padrões de Problemas Identificados

1. **Configuração de Ambiente de Desenvolvimento**
   - Problemas recorrentes com a configuração do ambiente de desenvolvimento, especialmente relacionados à conexão com serviços externos (PostgreSQL, Redis)
   - A abordagem inicial de usar Docker para desenvolvimento local encontrou obstáculos devido à indisponibilidade do Docker Desktop
   - A transição para SQLite como alternativa de desenvolvimento revelou incompatibilidades de tipos que exigiram adaptações no schema

2. **Importações e Exportações de Componentes React**
   - Inconsistência entre o uso de exportações nomeadas e padrão nos componentes React
   - Necessidade de alinhamento entre a forma de exportação nos arquivos de componentes e a forma de importação em `page.tsx`

3. **Gerenciamento de Dependências**
   - Dependência de serviços externos (PostgreSQL, Redis) dificulta o desenvolvimento local
   - Necessidade de estratégias alternativas para desenvolvimento sem dependências externas

### Lições Aprendidas

1. **Flexibilidade no Ambiente de Desenvolvimento**
   - Implementar configurações alternativas para desenvolvimento local sem dependências de Docker
   - Usar variáveis de ambiente para alternar facilmente entre diferentes configurações

2. **Padronização de Exportações/Importações**
   - Estabelecer e documentar convenções claras para exportação e importação de componentes
   - Implementar linting para detectar inconsistências precocemente

3. **Testes Incrementais**
   - Testar funcionalidades de forma incremental para identificar problemas mais cedo
   - Implementar testes automatizados para verificar a integridade do sistema

### Referências Cruzadas

- O bug #1 (Erro de Conexão com Banco de Dados) está diretamente relacionado à implementação incompleta #1 (Adaptação do Banco de Dados)
- O bug #4 (Incompatibilidade do Schema Prisma) impacta as implementações #2 (Sistema de Notificações) e #3 (Agendamento de Frases)
- Os padrões identificados na análise histórica fornecem contexto para os bugs atuais e orientam as soluções futuras