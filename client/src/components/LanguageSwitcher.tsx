import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2 hover:bg-white/80">
          <Languages className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag} {currentLanguage.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white border-2 border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-gray-800">
            Select Language
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full justify-start gap-3 h-12 text-left ${
                language === lang.code
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}