import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Users, Settings, ChevronLeft, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import './Layout.css';

export default function Layout({ children, title, showBack = false }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    const isProfiles = location.pathname === '/' || location.pathname.startsWith('/profile');
    const isSettings = location.pathname === '/settings';

    function toggleLanguage() {
        setLanguage(language === 'es' ? 'en' : 'es');
    }

    return (
        <div className="layout">
            {/* Header */}
            <header className="header">
                {showBack && (
                    <button className="header-back btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </button>
                )}
                {(!title || title === 'Sizes' || title === t('app_name')) ? (
                    <img src={`/logo-sizes-transparent.png?v=${new Date().getTime()}`} alt="Sizes" className="header-logo animate-fadeIn" />
                ) : (
                    <h1 className="header-title">{title}</h1>
                )}

                <button className="language-selector" onClick={toggleLanguage} title={t('language')}>
                    <Globe size={16} />
                    <span>{language.toUpperCase()}</span>
                </button>
            </header>

            {/* Main content */}
            <main className="main-content">
                {children}
            </main>

            {/* Bottom navigation */}
            <nav className="bottom-nav">
                <NavLink
                    to="/"
                    className={`nav-item ${isProfiles ? 'active' : ''}`}
                >
                    <Users size={24} />
                    <span>{t('profiles')}</span>
                </NavLink>
                <NavLink
                    to="/settings"
                    className={`nav-item ${isSettings ? 'active' : ''}`}
                >
                    <Settings size={24} />
                    <span>{t('settings')}</span>
                </NavLink>
            </nav>
        </div>
    );
}

