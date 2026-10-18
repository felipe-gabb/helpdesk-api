# Helpdesk API

API de helpdesk com consultas de categorias e técnicos e operações de cadastro
de solicitantes.

## Preparar o projeto

1. Instale as dependências:

   ```powershell
   npm install
   ```

2. Crie o banco executando `database/helpdesk.sql` no MySQL.
3. Se ainda não tiver um arquivo `.env`, crie-o a partir do exemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Abra `.env` e preencha `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_DATABASE`
   com os dados do seu MySQL.
5. Inicie a API:

   ```powershell
   npm start
   ```

Use `requests/api.rest` com a extensão REST Client do VS Code para testar as
rotas. Para consultar, alterar ou excluir um solicitante diferente, mude o
valor de `idSolicitante`.