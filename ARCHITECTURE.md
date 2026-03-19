# 🏗️ Arquitetura - Já Paguei

Documentação completa da arquitetura técnica da aplicação Já Paguei.

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (Next.js 16)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │     React Components + Tailwind CSS + shadcn/ui    │ │
│  │     Service Worker + PWA + Dark Mode Support       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Camada de Autenticação                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Supabase Auth (Email + Password)                  │ │
│  │  Middleware + Server Actions + Client Components   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Camada de Dados (Supabase)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                               │ │
│  │  - 12 Tabelas com RLS                              │ │
│  │  - Triggers para auto-increment                    │ │
│  │  - Índices para performance                        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🗂️ Estrutura de Pastas

```
ja-paguei/
├── app/                           # Next.js App Router
│   ├── auth/                      # Autenticação
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── callback/route.ts
│   │   ├── error/page.tsx
│   │   └── actions.ts
│   ├── dashboard/                 # Dashboard principal
│   ├── bills/                     # Gerenciamento de despesas
│   ├── groups/                    # Gerenciamento de grupos
│   ├── friends/                   # Gerenciamento de amigos
│   ├── profile/                   # Perfil do usuário
│   ├── settings/                  # Configurações
│   ├── history/                   # Histórico
│   ├── layout.tsx                 # Layout raiz
│   ├── page.tsx                   # Página raiz (redirect)
│   └── globals.css                # Estilos globais
├── components/
│   ├── layout/
│   │   ├── header.tsx             # Cabeçalho com menu
│   │   └── bottom-nav.tsx         # Navegação inferior + FAB
│   ├── dashboard/
│   │   ├── dashboard-stats.tsx    # Estatísticas
│   │   ├── quick-actions.tsx      # Ações rápidas
│   │   └── recent-bills.tsx       # Despesas recentes
│   ├── ui/                        # Componentes shadcn/ui
│   ├── theme-provider.tsx         # Provedor de tema
│   └── service-worker-register.tsx # Registrador de SW
├── hooks/
│   ├── use-auth.ts                # Hook de autenticação
│   └── use-supabase.ts            # Hook do Supabase
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Cliente Supabase (browser)
│   │   ├── server.ts              # Cliente Supabase (servidor)
│   │   └── proxy.ts               # Proxy de sessão
│   ├── constants.ts               # Constantes da app
│   ├── types.ts                   # Tipos TypeScript
│   └── utils.ts                   # Utilidades
├── public/
│   ├── sw.js                      # Service Worker
│   ├── manifest.json              # Manifest PWA
│   └── icon-*.png                 # Ícones da app
├── scripts/
│   ├── 001_create_tables.sql      # Criação de tabelas
│   └── 002_functions_rls.sql      # Funções e RLS
├── middleware.ts                  # Middleware do Next.js
├── next.config.mjs                # Configuração Next.js
└── tsconfig.json                  # Configuração TypeScript
```

## 🗄️ Modelo de Dados

### Tabelas Principais

#### `profiles`
Perfis dos usuários
```sql
id (UUID) → auth.users.id
email (TEXT)
display_name (TEXT)
avatar_url (TEXT, nullable)
phone (TEXT, nullable)
bio (TEXT, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### `groups`
Grupos de despesas
```sql
id (UUID)
name (TEXT)
description (TEXT, nullable)
currency (VARCHAR(3)) → Default: BRL
created_by (UUID) → profiles.id
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### `group_members`
Membros dos grupos
```sql
id (UUID)
group_id (UUID) → groups.id
user_id (UUID) → profiles.id
role (VARCHAR) → 'admin' | 'member'
joined_at (TIMESTAMP)
```

#### `bills`
Despesas registradas
```sql
id (UUID)
group_id (UUID, nullable) → groups.id
description (TEXT)
amount (DECIMAL)
currency (VARCHAR(3))
paid_by (UUID) → profiles.id
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
status (VARCHAR) → 'pending' | 'settled'
```

#### `bill_splits`
Divisões de despesas
```sql
id (UUID)
bill_id (UUID) → bills.id
user_id (UUID) → profiles.id
amount (DECIMAL)
status (VARCHAR) → 'pending' | 'paid'
```

#### `friends`
Relações de amizade
```sql
id (UUID)
user_id (UUID) → profiles.id
friend_id (UUID) → profiles.id
status (VARCHAR) → 'pending' | 'accepted' | 'blocked'
created_at (TIMESTAMP)
```

#### `notifications`
Notificações do sistema
```sql
id (UUID)
user_id (UUID) → profiles.id
type (TEXT)
title (TEXT)
message (TEXT)
read (BOOLEAN)
created_at (TIMESTAMP)
```

### Tabelas Adicionais

- `group_invites`: Convites para grupos
- `bill_attachments`: Anexos de despesas
- `payment_logs`: Histórico de pagamentos
- `budget_goals`: Metas de orçamento
- `user_preferences`: Preferências do usuário

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado:

```sql
-- Exemplo: Usuário só vê seus próprios perfis
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Exemplo: Usuário só vê grupos onde é membro
CREATE POLICY "groups_select_own" ON groups
  FOR SELECT USING (
    auth.uid() = created_by OR
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );
```

### Autenticação

- Email + Password com Supabase Auth
- JWT tokens com expiração configurável
- Sessões armazenadas em HTTP-only cookies
- Refresh token automático

### Middleware de Proteção

```typescript
// middleware.ts
Protege rotas públicas/privadas
Refresha sessão automaticamente
Redireciona usuários não autenticados
```

## 🎨 Design System

### Cores

```
Light Mode:
- Primary: #dc2626 (Vermelho)
- Background: #ffffff (Branco)
- Foreground: #1a1a1a (Cinza escuro)

Dark Mode:
- Primary: #f87171 (Vermelho claro)
- Background: #1a1a1a (Cinza escuro)
- Foreground: #f5f5f5 (Cinza claro)
```

### Tipografia

- Font: Geist (sans-serif)
- Mono: Geist Mono
- Tamanho base: 16px
- Line-height: 1.5

### Componentes

Usando shadcn/ui:
- Button, Input, Label, Card
- Dialog, Select, Tabs
- Toast notifications

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa /auth/login
2. Insere email + senha
3. Supabase valida credenciais
4. JWT token gerado
5. Cookie com token salvo (HTTP-only)
6. Middleware atualiza sessão
7. Usuário redireciona para /dashboard
8. React hooks verificam autenticação
9. Conteúdo protegido renderizado
```

## 📲 PWA Features

### Service Worker
- Cache de offline
- Atualização em background
- Push notifications

### Manifest
- Ícones para instalação
- Splash screens
- Shortcut menu
- Screenshots

### Suporte Mobile
- Viewport meta tags
- Apple mobile web app
- Android Chrome install

## 🚀 Performance

### Otimizações

1. **Next.js**:
   - App Router com Server Components
   - Image optimization
   - Code splitting automático

2. **Tailwind CSS v4**:
   - CSS gerado sob demanda
   - Sem CSS não utilizado

3. **Supabase**:
   - Índices em chaves estrangeiras
   - Triggers compiladas
   - Connection pooling

4. **PWA**:
   - Service Worker caching
   - Offline-first approach
   - Minimal bundle size

## 📝 Padrões de Código

### Server Actions
```typescript
'use server'
// Para mutações de dados
async function updateBill(id: string, data: BillUpdate) {
  const supabase = await createClient()
  return supabase.from('bills').update(data).eq('id', id)
}
```

### Client Components
```typescript
'use client'
// Para interatividade
export function BillForm() {
  const [data, setData] = useState({})
  return <form>...</form>
}
```

### Custom Hooks
```typescript
// Para lógica reutilizável
export function useAuth() {
  const [user, setUser] = useState(null)
  useEffect(() => { /* ... */ }, [])
  return { user, loading }
}
```

## 🧪 Testes (Futuro)

Configuração recomendada:
- **Unit**: Vitest + React Testing Library
- **E2E**: Playwright ou Cypress
- **Performance**: Lighthouse CI

## 📚 Referências

- [Next.js 16 Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Última atualização**: Março 2026
