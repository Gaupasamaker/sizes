import { useState, useRef } from 'react';
import { Download, Upload, Info, CheckCircle, AlertTriangle, Sun, Moon } from 'lucide-react';
import Layout from '../components/Layout';
import { exportData, importData } from '../services/db';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import './Settings.css';

export default function Settings() {
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);
    const { theme, toggleTheme } = useTheme();
    const { language, t } = useLanguage();

    async function handleExport() {
        try {
            await exportData();
            showMessage('success', t('export_success'));
        } catch (error) {
            console.error('Error exporting:', error);
            showMessage('error', t('export_error'));
        }
    }

    function handleImportClick() {
        fileInputRef.current?.click();
    }

    async function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(t('import_confirm'))) {
            e.target.value = '';
            return;
        }

        setImporting(true);
        try {
            const result = await importData(file);
            showMessage('success', `${t('import_success')} ${result.profiles} perfiles, ${result.brands} marcas, ${result.sizes} tallas`);
        } catch (error) {
            console.error('Error importing:', error);
            showMessage('error', t('import_error'));
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    }

    function showMessage(type, text) {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    }

    return (
        <Layout title={t('settings')}>
            <div className="settings-container animate-fadeIn">
                {/* Appearance section */}
                <section className="settings-section">
                    <h3 className="settings-section-title">{t('appearance')}</h3>

                    <div className="settings-card card">
                        <div className="settings-item" onClick={toggleTheme}>
                            <div className="settings-item-icon">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div className="settings-item-content">
                                <h4>{theme === 'dark' ? t('theme_dark') : t('theme_light')}</h4>
                                <p>{t('tap_to_switch')} {theme === 'dark' ? (language === 'es' ? 'claro' : 'light mode') : (language === 'es' ? 'oscuro' : 'dark mode')}</p>
                            </div>
                            <div className="theme-toggle">
                                <div className={`toggle-switch ${theme === 'light' ? 'active' : ''}`}>
                                    <div className="toggle-knob" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Export/Import section */}
                <section className="settings-section">
                    <h3 className="settings-section-title">{t('backup')}</h3>

                    <div className="settings-card card">
                        <div className="settings-item" onClick={handleExport}>
                            <div className="settings-item-icon">
                                <Download size={20} />
                            </div>
                            <div className="settings-item-content">
                                <h4>{t('export_data')}</h4>
                                <p>{t('export_desc')}</p>
                            </div>
                        </div>

                        <div className="settings-divider" />

                        <div className="settings-item" onClick={handleImportClick}>
                            <div className="settings-item-icon">
                                <Upload size={20} />
                            </div>
                            <div className="settings-item-content">
                                <h4>{importing ? t('importing') : t('import_data')}</h4>
                                <p>{t('import_desc')}</p>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                </section>

                {/* App info section */}
                <section className="settings-section">
                    <h3 className="settings-section-title">{t('info')}</h3>

                    <div className="settings-card card">
                        <div className="settings-item">
                            <div className="settings-item-icon">
                                <Info size={20} />
                            </div>
                            <div className="settings-item-content">
                                <h4>Sizes</h4>
                                <p>{t('version')} 1.3.0</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Install PWA hint */}
                <section className="settings-section">
                    <div className="pwa-hint card">
                        <h4>💡 {t('install_app')}</h4>
                        <p>{t('install_hint')}</p>
                    </div>
                </section>
            </div>

            {/* Toast message */}
            {message && (
                <div className={`toast toast-${message.type} animate-slideUp`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}
        </Layout>
    );
}
