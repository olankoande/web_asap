import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const toggle = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-secondary transition-all"
      aria-label="Switch language"
      title={currentLang === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="uppercase">{currentLang === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}
