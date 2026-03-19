# 👥 Guia de Contribuição - Já Paguei

Obrigado por seu interesse em contribuir para o Já Paguei! Este guia ajudará você a começar.

## 🎯 Código de Conduta

Somos comprometidos com um ambiente acolhedor e inclusivo. Todos são bem-vindos, independentemente de:
- Experiência
- Sexo ou identidade de gênero
- Orientação sexual
- Deficiência
- Etnia
- Idade
- Religião

## 🚀 Como Contribuir

### 1. Reportar Bugs

Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. real
- Screenshots se aplicável
- Seu ambiente (navegador, SO)

### 2. Sugerir Melhorias

Tem uma ideia? Abra uma issue com:
- Descrição clara da feature
- Caso de uso
- Benefícios potenciais
- Exemplos ou mockups (opcional)

### 3. Contribuir com Código

#### Setup local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ja-paguei.git
cd ja-paguei

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Inicie o servidor de desenvolvimento
pnpm dev
```

#### Criar uma branch

```bash
# Atualize main
git checkout main
git pull origin main

# Crie uma branch com nome descritivo
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

#### Commit messages

```
# Bom:
fix: corrigir navegação em modo escuro
feat: adicionar filtro de despesas por data
docs: atualizar instruções de deploy

# Ruim:
Alterações
Fixado
atualizado
```

#### Padrões de código

```typescript
// Use TypeScript em tudo
export interface Bill {
  id: string
  description: string
  amount: number
}

// Prefira functional components
export function BillForm() {
  const [bills, setBills] = useState<Bill[]>([])
  return <div>...</div>
}

// Use comentários para lógica complexa
// Valida se o usuário pode pagar esta despesa
const canPay = user.balance >= bill.amount

// Nomes descritivos
const handleBillSubmit = async (data: BillFormData) => {
  // ...
}
```

#### Estilos

```typescript
// Use Tailwind CSS
<button className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded">
  Clique aqui
</button>

// Prefira componentes existentes
import { Button } from '@/components/ui/button'

<Button variant="default">Clique aqui</Button>

// Sempre suporte dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Conteúdo
</div>
```

#### Segurança

```typescript
// Sempre valide no servidor
// ❌ Não faça:
const isAdmin = user.role === 'admin'

// ✅ Faça:
const isAdmin = await verifyAdminRole(user.id)

// Sempre proteja rotas
// ❌ Não faça:
export default function AdminPage() {}

// ✅ Faça:
export default function AdminPage() {
  const { user, loading } = useAuth()
  if (!loading && !user?.isAdmin) {
    return <AccessDenied />
  }
}
```

#### Testes

```typescript
// Testes unitários para funções críticas
describe('calculateTotalExpense', () => {
  it('deve somar todos os valores corretamente', () => {
    const bills = [{ amount: 100 }, { amount: 50 }]
    expect(calculateTotalExpense(bills)).toBe(150)
  })
})
```

### 4. Enviar Pull Request

```bash
# Faça seus commits
git add .
git commit -m "feat: sua descrição"

# Push para sua branch
git push origin feature/sua-feature
```

#### Template de PR

```markdown
## 📝 Descrição
Descreva suas mudanças aqui

## 🎯 Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Atualização de docs

## 🧪 Como testar
Descreva como testar suas mudanças

## ✅ Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Dark mode testado
- [ ] Responsivo em mobile/desktop
- [ ] Sem erros no console
```

## 📚 Estrutura do Projeto

Antes de contribuir, familiarize-se com:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do projeto
- [README.md](./README.md) - Visão geral
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy

## 🎨 Design Guidelines

- Cores: Vermelho (#dc2626) + Branco (#ffffff) + escala de cinzas
- Dark mode: Sempre suportado
- Tipografia: Geist font family
- Espaçamento: Escala Tailwind (4px, 8px, 12px, etc.)
- Componentes: shadcn/ui quando possível

## 📦 Dependencies

Antes de adicionar nova dependência:

1. **É necessária?** Tente resolver com vanilla JS/CSS primeiro
2. **Está mantida?** Verifique última atualização no npm
3. **Tamanho?** Use `npm size` para verificar
4. **Alternativas?** Procure por alternativas menores

## 🔍 Review Process

1. Seu PR será revisado por mantenedores
2. Pediremos alterações se necessário
3. Depois de aprovado, faremos merge
4. Sua contribuição estará em breve release!

## 🐛 Encontrado um bug de segurança?

**Não abra uma issue pública!** Envie um email para security@ja-paguei.dev

## ⚖️ Licença

Ao contribuir, você concorda que seu código será publicado sob a licença MIT.

## 🙏 Obrigado!

Suas contribuições fazem o Já Paguei melhor para todos!

---

**Dúvidas?** Abra uma discussion ou entre em contato!
