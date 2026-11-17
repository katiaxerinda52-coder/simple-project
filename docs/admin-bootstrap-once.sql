-- Executar UMA ÚNICA VEZ, depois de criar a conta de autenticação da administradora.
-- O utilizador já deve existir em Authentication > Users.
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = lower('katiacleunice.kc@gmail.com')
on conflict (user_id, role) do nothing;

-- Confirmação: deve devolver exactamente uma linha com role = admin.
select u.email, ur.role
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where lower(u.email) = lower('katiacleunice.kc@gmail.com');
