'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'

export function RecentBills() {
  // Placeholder data - will be replaced with real data from DB
  const bills = []

  if (bills.length === 0) {
    return (
      <Card className="p-8 text-center border border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          📭 Nenhuma despesa recente
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Crie sua primeira despesa para começar
        </p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Despesas Recentes
          </h2>
          <Link href="/bills" className="text-primary hover:underline text-sm">
            Ver Tudo
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {bills.map((bill: any) => (
          <div key={bill.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {bill.description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bill.group}
                </p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white">
                R$ {bill.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
