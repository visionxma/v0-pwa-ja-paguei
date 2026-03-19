# 🚀 Guia de Deploy - Já Paguei

Este guia fornece instruções para fazer deploy da aplicação "Já Paguei" em produção.

## Pré-requisitos

- Conta Supabase (https://supabase.com)
- Conta Vercel (https://vercel.com)
- Repositório Git (GitHub, GitLab, etc.)

## 1️⃣ Configurar Supabase

### Criar projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New project"
3. Preencha os dados:
   - **Project name**: ja-paguei
   - **Database password**: Senha forte
   - **Region**: Selecione mais próximo de seus usuários
4. Aguarde a criação (5-10 minutos)

### Executar migrations

1. No dashboard Supabase, acesse "SQL Editor"
2. Execute os scripts na seguinte ordem:
   - `/scripts/001_create_tables.sql`
   - `/scripts/002_functions_rls.sql`

### Obter credenciais

1. Na página do projeto, clique em "Settings"
2. Vá para "API"
3. Copie:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2️⃣ Configurar Vercel

### Conectar repositório

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Importe o projeto

### Configurar variáveis de ambiente

Na página de configuração do projeto, adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://seu-dominio.vercel.app/auth/callback
NEXT_PUBLIC_VERCEL_URL=seu-dominio.vercel.app
```

### Deploy

1. Clique em "Deploy"
2. Aguarde a conclusão (2-5 minutos)
3. Acesse sua aplicação na URL fornecida

## 3️⃣ Configurar domínio customizado (opcional)

1. Em Vercel, acesse "Settings" → "Domains"
2. Adicione seu domínio
3. Configure os records DNS conforme instruções

## 4️⃣ Configurar email de confirmação (opcional)

Para usar emails customizados:

1. Em Supabase, acesse "Authentication" → "Email Templates"
2. Personalize os templates de confirmação e recuperação de senha
3. Configure SMTP se desejar usar seu próprio servidor

## 5️⃣ Monitorar a aplicação

### Supabase Dashboard
- Monitore uso de database
- Verifique logs de autenticação
- Acompanhe performance

### Vercel Analytics
- Veja métricas de performance
- Monitore erros
- Analise tráfego

## 🔐 Checklist de Segurança

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] RLS habilitado em todas as tabelas (verificar em Supabase)
- [ ] Autenticação por email habilitada
- [ ] Tokens JWT configurados
- [ ] CORS configurado corretamente
- [ ] Backups automáticos configurados no Supabase
- [ ] Monitor de erros configurado (optional)

## 🐛 Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not set"
- Verifique se as variáveis estão no `.env.local` (local) ou em "Vercel Settings" (produção)
- Reinicie o servidor de desenvolvimento

### Erro: "RLS policy violation"
- Verifique se o usuário está autenticado
- Confirme que as políticas RLS estão corretas

### Erro: "Service Worker failed to register"
- Verifique se o arquivo `/public/sw.js` existe
- Limpe o cache do navegador

## 📱 Testar PWA

Após fazer deploy:

1. **Desktop**: Clique no ícone "Instalar" na barra de endereço
2. **Mobile iOS**: Safari → Compartilhar → Adicionar à Tela de Início
3. **Mobile Android**: Chrome → Menu (⋮) → Instalar app

## 🔄 Atualizar aplicação

Para fazer atualizações:

1. Faça as alterações no repositório
2. Faça push para o branch principal
3. Vercel fará deploy automático
4. Usuários receberão atualização do Service Worker

## 📞 Suporte

Para problemas com:
- **Vercel**: https://vercel.com/support
- **Supabase**: https://github.com/supabase/supabase/discussions
- **Aplicação**: Abra uma issue no repositório

---

**Última atualização**: Março 2026
