# Configuração de segurança — Massas de Noiva Pro

A aplicação já contém o bloqueio por sessão, a verificação de permissões, o painel de administração e a migração que guarda as receitas fora do código público. **A segurança só fica activa depois de concluir os passos abaixo no projecto Supabase e publicar esta versão.**

## 1. Aplicar a migração (uma única vez)

1. Abra o projecto Supabase com o ID `tfkzkhbvajabbogmmtqu`.
2. Entre em **SQL Editor** e crie uma nova consulta.
3. Abra o ficheiro `supabase/migrations/20261110000000_authorized_access.sql` neste repositório.
4. Copie o conteúdo completo, cole no SQL Editor e execute.
5. Confirme que foram criadas as tabelas `authorized_users` e `wedding_cake_recipes), e as funções `is_app_admin` e `is_app_authorized`.

A migração inclui a receita actualmente configurada e as duas variantes que ainda estão marcadas como pendentes. Não volte a executar esta migração depois de editar receitas no painel, porque a carga inicial repõe os dados originais.

## 2. Confirmar autenticação por e-mail

No Supabase, em **Authentication → Providers**, confirme que o fornecedor Email está activo e que o envio de links de acesso está permitido.

Em **Authentication → URL Configuration**:
- Defina **Site URL** como o endereço final publicado da aplicação.
- Adicione esse mesmo endereço à lista de **Redirect URLs**.
- Se utilizar uma pré-visualização Lovable, adicione também o endereço exacto dessa pré-visualização.

O endereço não foi preenchido aqui porque depende do domínio que escolher para publicar a aplicação.

## 3. Confirmar variáveis da aplicação

No ambiente de publicação/Lovable, confirme que existem:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Também são aceites no servidor:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Use apenas a chave publishable/anon no navegador. **Nunca coloque a chave secret ou service_role em variáveis `VITE_*`, no código do navegador ou neste repositório.**

## 4. Publicar e testar

Depois de aplicar a migração e confirmar as URLs, publique a versão mais recente de `main`.

Teste com estes casos:
1. O e-mail administrador `katiacleunice.kc@gmail.com` recebe o link e consegue entrar.
2. A administradora vê **Gestão da aplicação**, adiciona um e-mail e consegue revogar esse acesso.
3. Um e-mail não autorizado pode, no máximo, iniciar uma sessão; não consegue abrir a calculadora nem ler receitas.
4. Uma utilizadora autorizada consegue calcular e consultar receitas, mas não vê o painel administrativo.
5. Uma utilizadora comum não consegue ler ou alterar a tabela de utilizadoras nem alterar as receitas através da API.
6. A administradora consegue actualizar uma receita no painel.

## 5. Atenção ao histórico do GitHub

O repositório está actualmente **público**. Embora as receitas tenham sido retiradas da versão actual do código, o ficheiro antigo continua potencialmente acessível nos commits anteriores do Git. Para proteger também o histórico e a propriedade intelectual, torne o repositório privado ou faça uma limpeza segura do histórico Git antes de partilhar o projecto. Tornar o repositório privado pode afectar integrações/publicação; confirme primeiro que a sua ligação ao Lovable continuará a funcionar.

## Regras de acesso implementadas

- O e-mail `katiacleunice.kc@gmail.com` é a administradora principal.
- Apenas e-mails activos na tabela `authorized_users` podem ler receitas protegidas.
- Apenas a administradora pode adicionar/remover e-mails e editar receitas originais.
- As permissões são aplicadas no PostgreSQL com Row Level Security (RLS); esconder botões no navegador não é a única barreira.
- As receitas originais são carregadas da tabela protegida `wedding_cake_recipes`, não de um ficheiro incluído no bundle público.

**Não considere a aplicação protegida enquanto os passos 1–4 não estiverem concluídos e testados.**
