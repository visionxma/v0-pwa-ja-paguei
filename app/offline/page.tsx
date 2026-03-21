'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-muted mb-6">
        <WifiOff className="w-9 h-9 text-muted-foreground" />
      </div>
      <h1 className="text-[22px] font-bold text-foreground mb-2">Sem conexão</h1>
      <p className="text-[14px] text-muted-foreground max-w-[260px] mb-8">
        Você está offline. Os seus dados mais recentes estão disponíveis para consulta.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="gap-2 rounded-[14px] h-[46px] px-6"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </Button>
    </div>
  )
}
