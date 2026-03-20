'use client'

import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-6">Politica de Privacidade</h1>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-5">
          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">1. Dados Coletados</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Coletamos apenas as informacoes necessarias para o funcionamento do aplicativo: email, nome de exibicao
              e dados de despesas que voce registra voluntariamente.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">2. Uso dos Dados</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Seus dados sao utilizados exclusivamente para fornecer o servico de divisao de despesas, incluindo:
              autenticacao, exibicao de despesas, grupos e historico de transacoes. Nao vendemos ou compartilhamos
              seus dados com terceiros.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">3. Armazenamento</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Os dados sao armazenados de forma segura utilizando Supabase, com criptografia em transito e em repouso.
              Os servidores estao localizados em infraestrutura segura com conformidade SOC2.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">4. Seguranca</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Implementamos medidas de seguranca tecnicas e organizacionais para proteger suas informacoes, incluindo
              autenticacao segura, Row Level Security (RLS) no banco de dados e conexoes HTTPS.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">5. Seus Direitos</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Voce tem direito a acessar, corrigir e excluir seus dados pessoais a qualquer momento. Voce pode editar
              seu perfil nas configuracoes ou deletar sua conta completamente, o que removera todos os seus dados.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">6. Cookies e Sessao</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para manter sua sessao de login ativa. Nao utilizamos cookies de
              rastreamento ou publicidade.
            </p>
          </div>

          <div className="ios-card p-5">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">7. Alteracoes nesta Politica</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Esta politica pode ser atualizada periodicamente. Notificaremos os usuarios sobre mudancas significativas
              atraves do aplicativo.
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
