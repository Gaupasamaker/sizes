import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Check localStorage first, then browser preference
        const saved = localStorage.getItem('sizes-language');
        if (saved && (saved === 'es' || saved === 'en')) return saved;

        // Detect browser language
        const browserLang = navigator.language?.split('-')[0];
        return browserLang === 'en' ? 'en' : 'es';
    });

    useEffect(() => {
        localStorage.setItem('sizes-language', language);
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    // Translation function
    function t(key) {
        return translations[language]?.[key] || translations.es[key] || key;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
