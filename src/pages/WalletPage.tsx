import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { walletApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function WalletPage() {
  const { t } = useTranslation();
  const { data: wallet, isLoading: wLoading } = useQuery({ queryKey: ['wallet'], queryFn: () => walletApi.get().then((r) => r.data) });
  const { data: txData, isLoading: tLoading } = useQuery({ queryKey: ['wallet-tx'], queryFn: () => walletApi.transactions({ limit: 20 }).then((r) => r.data) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')} />

      {/* Balance Card */}
      {wLoading ? <div className="skeleton h-36 rounded-2xl mb-6" /> : wallet && (
        <div className="relative overflow-hidden rounded-2xl mb-6 animate-fade-in-up">
          {/* Gradient background */}
          <div className="bg-gradient-to-br from-primary via-primary-dark to-accent p-6 text-white">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-white/80">{t('wallet.availableBalance')}</span>
              </div>
              <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(wallet.available_balance, wallet.currency)}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t('wallet.pending')} : {formatCurrency(wallet.pending_balance, wallet.currency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <h2 className="text-lg font-bold mb-4">{t('wallet.recentTransactions')}</h2>

      {tLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      )}

      {txData && txData.data.length === 0 && (
        <EmptyState
          icon={<Wallet className="w-8 h-8" />}
          title={t('wallet.noTransactions')}
          description={t('wallet.transactionsHint')}
        />
      )}

      {txData && txData.data.length > 0 && (
        <div className="space-y-2 stagger-children">
          {txData.data.map((tx) => (
            <Card key={tx.id} hover padding="sm" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.amount >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {tx.amount >= 0
                      ? <ArrowDownLeft className="w-5 h-5 text-success" />
                      : <ArrowUpRight className="w-5 h-5 text-destructive" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
