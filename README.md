# Mutirão de Castração — Betim/MG

Site estático de cadastro de interesse para o mutirão de castração gratuita de cães e gatos em Betim/MG, com tela administrativa para consulta dos cadastros.

## Estrutura

- `index.html` — formulário público de cadastro (grava direto no Supabase).
- `admin.html` — área administrativa: login (Supabase Auth) e listagem/busca dos cadastros.
- `src/supabaseClient.js` — cria o client do Supabase a partir das variáveis de ambiente.
- `src/form.js` — lógica do formulário de cadastro (`index.html`).
- `src/admin.js` — lógica da área administrativa (`admin.html`).
- `supabase/schema.sql` — script para criar a tabela `cadastros` e as regras de acesso (RLS) no Supabase.
- `.env` — URL e chave pública (`anon key`) do projeto Supabase (não vai pro git; veja `.env.example`).

O projeto usa [Vite](https://vitejs.dev) só como servidor de dev/build — não há framework, é HTML/CSS/JS puro. O `@supabase/supabase-js` vem como dependência do npm.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha com os dados do seu projeto Supabase (veja a seção abaixo). Se você já recebeu um `.env` pronto, pule este passo.

3. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse (a URL exata aparece no terminal, por padrão `http://localhost:5173`):
   - Formulário: `http://localhost:5173/index.html`
   - Admin: `http://localhost:5173/admin.html`

### Build de produção

```bash
npm run build    # gera os arquivos finais em dist/
npm run preview  # serve o build de dist/ localmente, pra conferir
```

## Configurando o Supabase (uma vez só)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor** do projeto, rode o conteúdo de `supabase/schema.sql` — isso cria a tabela `cadastros` e as policies de RLS (qualquer visitante pode inserir um cadastro; só usuários autenticados podem ler).
3. Em **Authentication > Users**, crie manualmente o(s) usuário(s) que vão acessar o `admin.html` (e-mail + senha). Não existe cadastro público de admin.
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key** e cole no `.env` (crie a partir de `.env.example`):

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA-ANON-KEY-AQUI
   ```

   A `anon key` é pública por design (a proteção real vem das policies de RLS no banco). Mesmo assim, o `.env` não vai pro git (está no `.gitignore`) — o padrão do Vite é não versionar esse arquivo; use `.env.example` como referência do que precisa ser preenchido.

5. Para conferir se as policies foram aplicadas corretamente, rode no SQL Editor:

   ```sql
   select policyname, cmd, roles, with_check
   from pg_policies
   where tablename = 'cadastros';
   ```

   Deve aparecer uma policy de `INSERT` para o papel `anon` e uma de `SELECT` para `authenticated`.

## Deploy

Como é um site 100% estático, pode ser publicado em qualquer host de arquivos estáticos (GitHub Pages, Netlify, Vercel, Cloudflare Pages etc.) — basta subir os arquivos, sem passo de build.
