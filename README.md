# Já Paguei - Aplicação PWA de Divisão de Despesas

Uma aplicação web progressiva moderna e elegante para divisão de despesas entre amigos e grupos, com suporte completo a modo escuro e instalação como app nativo.

## 🎨 Características

- ✅ **PWA Completo**: Instalável como app nativo em smartphones e computadores
- ✅ **Dark Mode**: Tema elegante claro e escuro
- ✅ **Autenticação Supabase**: Autenticação segura com email e senha
- ✅ **Divisão de Despesas**: Divida contas com amigos facilmente
- ✅ **Grupos**: Crie grupos para controlar despesas coletivas
- ✅ **Amigos**: Adicione amigos para divisões rápidas
- ✅ **Notificações**: Sistema de notificações em tempo real
- ✅ **Responsivo**: Design mobile-first otimizado para todos os tamanhos

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ ou superior
- Uma conta Supabase (criar em https://supabase.com)

### Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd ja-paguei
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_VERCEL_URL=localhost:3000
```

4. Execute o servidor de desenvolvimento:
```bash
pnpm dev
```

5. Acesse a aplicação em `http://localhost:3000`

## 📱 Instalação como PWA

### Desktop (Chrome/Edge):
1. Abra a aplicação no navegador
2. Clique no ícone "Instalar" na barra de endereço
3. Siga as instruções

### Mobile (iOS):
1. Abra no Safari
2. Toque em Compartilhar
3. Selecione "Adicionar à Tela de Início"

### Mobile (Android):
1. Abra no Chrome
2. Toque em ⋮ (três pontos)
3. Selecione "Instalar app"

## 🎨 Design e Cores

- **Cor Primária**: Vermelho vibrante (#dc2626)
- **Cor Secundária**: Branco (#ffffff)
- **Dark Mode**: Cinza escuro e vermelho claro

## 📚 Estrutura do Projeto

```
├── app/                      # Páginas e rotas
│   ├── auth/                # Autenticação
│   ├── dashboard/           # Dashboard principal
│   ├── bills/              # Gerenciamento de despesas
│   ├── groups/             # Gerenciamento de grupos
│   ├── friends/            # Gerenciamento de amigos
│   ├── profile/            # Perfil do usuário
│   └── settings/           # Configurações
├── components/              # Componentes React
│   ├── layout/            # Componentes de layout
│   ├── dashboard/         # Componentes do dashboard
│   └── ui/                # Componentes shadcn/ui
├── lib/                    # Utilitários e helpers
│   ├── supabase/         # Configuração Supabase
│   ├── constants.ts      # Constantes da app
│   └── types.ts          # Tipos TypeScript
├── hooks/                  # React hooks customizados
├── scripts/               # Scripts SQL do banco
├── public/                # Arquivos estáticos e PWA
└── middleware.ts          # Middleware do Next.js
```

## 🗄️ Banco de Dados

A aplicação usa 12 tabelas principais:

- **profiles**: Perfis dos usuários
- **groups**: Grupos de despesas
- **group_members**: Membros dos grupos
- **bills**: Despesas registradas
- **bill_splits**: Divisões das despesas
- **bill_attachments**: Anexos de despesas
- **group_invites**: Convites para grupos
- **friends**: Relações de amizade
- **notifications**: Notificações do sistema
- **payment_logs**: Histórico de pagamentos
- **budget_goals**: Metas de orçamento
- **user_preferences**: Preferências do usuário

## 🔐 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação via Supabase Auth
- Senhas hashadas com bcrypt
- Sessões seguras com HTTP-only cookies

## 🧪 Desenvolvendo

### Adicionar novo componente UI:
```bash
# Use shadcn/ui
npx shadcn-ui@latest add button
```

### Executar em modo desenvolvimento com hot reload:
```bash
pnpm dev
```

### Build para produção:
```bash
pnpm build
pnpm start
```

## 📦 Deploy

A aplicação está pronta para deploy em Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático ao fazer push para main

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do Vercel Support.

---

Desenvolvido com ❤️ usando Next.js, Supabase e Tailwind CSS
