-- Rode este script no SQL Editor do seu projeto Supabase (https://supabase.com/dashboard -> SQL Editor)

create table public.cadastros (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  autoriza_lgpd boolean not null,
  nome_tutor text not null,
  cpf text not null,
  data_nascimento date not null,
  rg_cnh text not null,
  regional text not null,
  cep text not null,
  telefone text not null,
  endereco text not null,
  email text,
  data_procedimento text not null,
  animal_nome text not null,
  especie text not null,
  raca text not null,
  cor text not null,
  idade_animal text not null,
  quantidade integer not null,
  como_soube text not null,
  duvida text
);

alter table public.cadastros enable row level security;

-- Qualquer visitante (anon) pode inserir um cadastro, desde que tenha autorizado o uso dos dados (LGPD).
create policy "Publico pode inserir cadastros"
  on public.cadastros
  for insert
  to anon
  with check (autoriza_lgpd = true);

-- So usuarios autenticados (login no /admin.html) podem ler os cadastros.
create policy "Autenticados podem ler cadastros"
  on public.cadastros
  for select
  to authenticated
  using (true);

-- Nao ha policy de update/delete: por padrao, ninguem pode alterar ou apagar cadastros.
