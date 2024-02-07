# API de Votação em Realtime

## Requisitos Funcionais

1. **Criar Nova Enquete:**
   - O usuário deve poder criar uma nova enquete.
   - A enquete deve conter um id, título, opções de voto e data de criação.

2. **Consultar Detalhes da Enquete:**
   - O usuário deve poder consultar os detalhes de uma enquete específica.
   - Os detalhes devem incluir o título, opções de voto.

3. **Votar em uma Enquete:**
   - O usuário deve conseguir votar em uma enquete.
   - A votação deve ser em tempo real e refletir imediatamente na contagem de votos.

4. **Restrição de Voto Único:**
   - Só deve ser possível para o usuário votar em uma única opção por enquete.
   - O sistema deve usar cookies para garantir que o usuário não vote mais de uma vez.

## Requisitos Não Funcionais

1. **Linguagem e Framework:**
   - A aplicação deve ser desenvolvida em Node.js.
   - Utilizar TypeScript como linguagem principal.
   - Fastify será utilizado como o framework web para otimização de desempenho.

2. **Banco de Dados:**
   - O sistema de gerenciamento de banco de dados principal será o Prisma ORM.
   - PostgreSQL será usado como banco de dados principal para armazenar informações de enquetes.
   - Redis será utilizado para consultas em tempo real, otimizando o retorno da quantidade de votos.

3. **Realtime:**
   - A comunicação em tempo real será implementada para refletir as votações instantaneamente.
   - Redis será utilizado para gerenciar eventos de votação em tempo real.

4. **Segurança:**
   - Cookies serão implementados para garantir a singularidade dos votos por usuário.
   - As práticas de segurança recomendadas devem ser seguidas para proteger a aplicação contra vulnerabilidades.

## Regras de Negócio

1. **Votação Única:**
   - Um usuário só pode votar uma vez em uma enquete.
   - Os cookies serão utilizados para garantir a unicidade dos votos.

2. **Estrutura da Enquete:**
   - Uma enquete deve ter um título significativo.
   - As opções de voto devem ser claras e concisas.

3. **Cookies de Segurança:**
   - A implementação de cookies deve ser segura para proteger a integridade do processo de votação.
   - Os cookies não devem ser manipulados para evitar fraudes na votação.


## Configuração do Projeto

Para executar este projeto localmente, siga as etapas abaixo:

```bash
# Clone o repositório
git clone https://github.com/RenanFachin/RS_NLW_poll-system-API.git

# Acesse a pasta do projeto
# Instale as dependências
npm install

# Execute a aplicação em ambiente de desenvolvimento
npm run dev
```

Subindo um container de um database com postgres
```bash
docker-compose up
```

Criando as tabelas (Rodando as migrations)
```bash
npx prisma migrate dev
```
