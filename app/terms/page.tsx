'use client'

import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 ios-glass-thick border-b border-border/40">
        <div className="px-4 md:px-6 h-[52px] flex items-center gap-3 max-w-3xl mx-auto">
          <Link href="/auth/login" className="p-2 -ml-2 rounded-xl hover:bg-foreground/5 transition-colors ios-press">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[16px] text-foreground">Ja Paguei</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-8">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-6">Termos de Servico</h1>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-5">
          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">1. Aceitacao dos Termos</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Ao acessar e usar o aplicativo Ja Paguei, voce concorda com estes Termos de Servico. Se voce nao concordar com algum
              dos termos, nao utilize o aplicativo.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">2. Descricao do Servico</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              O Ja Paguei e um aplicativo de divisao de despesas que permite que voce registre, organize e compartilhe contas com
              amigos e grupos. O servico e fornecido &quot;como esta&quot; e pode ser atualizado sem aviso previo.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">3. Conta do Usuario</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Voce e responsavel por manter a confidencialidade de sua conta e senha. Qualquer atividade realizada em sua conta
              e de sua responsabilidade. Notifique-nos imediatamente sobre qualquer uso nao autorizado.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">4. Uso Adequado</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Voce concorda em usar o aplicativo apenas para fins legais e de acordo com estes termos. E proibido o uso do
              servico para atividades ilegais, fraudulentas ou que violem direitos de terceiros.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">5. Dados e Privacidade</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              O tratamento de dados pessoais e regido pela nossa Politica de Privacidade. Ao usar o aplicativo, voce consente
              com a coleta e uso de informacoes conforme descrito em nossa politica.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">6. Limitacao de Responsabilidade</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              O Ja Paguei nao se responsabiliza por eventuais perdas financeiras resultantes do uso do aplicativo. O servico
              e uma ferramenta de organizacao e nao constitui aconselhamento financeiro.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">7. Modificacoes</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alteracoes entrarao em vigor apos
              a publicacao. O uso continuado do aplicativo apos as alteracoes constitui aceitacao dos novos termos.
            </p>
          </div>

          <p className="text-[12px] text-muted-foreground/60 text-center pt-4">
            Ultima atualizacao: Marco de 2026
          </p>
        </div>
      </main>
    </div>
  )
}
