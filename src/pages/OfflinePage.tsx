import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OfflinePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-64 h-64 bg-warning/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 bg-muted-foreground/5 rounded-full blur-3xl" />

      <div className="text-center animate-fade-in-up relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <WifiOff className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">{t('offline.title')}</h1>
        <p className="text-muted-foreground max-w-xs mx-auto mb-8">
          {t('offline.subtitle')}
        </p>
        <Button onClick={() => window.location.reload()} size="lg">
          <RefreshCw className="w-4 h-4" />
          {t('offline.retry')}
        </Button>
      </div>
    </div>
  );
}
