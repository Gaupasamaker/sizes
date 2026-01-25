import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ChevronRight, AlertCircle, Home } from 'lucide-react';
import { decodeShareData } from '../services/share';
import { CATEGORIES, FIT_OPTIONS } from '../services/db';
import { useLanguage } from '../hooks/useLanguage';
import './SharedProfile.css';

// Custom Woman icon with long hair
// Custom Woman icon with long hair (Based on user image)
const WomanIcon = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M7 11.5V10c0-3 2-4.5 5-4.5s5 1.5 5 4.5v1.5c0 3.5-1.5 6.5-5 6.5s-5-3-5-6.5z" />
        <path d="M12 14a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        <path d="M10 6.5c0-1 1-1.5 2-1.5s2 .5 2 1.5" />
        <path d="M6 22c0-2.5 2-4.5 6-4.5s6 2 6 4.5" />
        <path d="M12 17.5l-2.5 2.5h5L12 17.5z" />
    </svg>
);

// Custom Man icon with short hair (Based on user image)
const ManIcon = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M8 8.5c0-2 1.5-3.5 4-3.5s4 1 4 3.5" />
        <path d="M9 7c0-1 1-1.5 2-1.5" />
        <path d="M13 5.5l1.5 1.5" />
        <path d="M12 14a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
        <path d="M6 22c0-2.5 2-4.5 6-4.5s6 2 6 4.5" />
        <path d="M12 17.5l-2.5 2.5h5L12 17.5z" />
    </svg>
);

export default function SharedProfile() {
    const { data } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (data) {
            const decoded = decodeShareData(data);
            if (decoded) {
                setProfile(decoded);
            } else {
                setError(true);
            }
        }
    }, [data]);

    function getFitBadge(fit) {
        const option = FIT_OPTIONS.find(f => f.id === fit);
        if (!option || fit === 'normal') return null;
        return (
            <span className={`fit-badge fit-${fit}`}>
                {option.icon} {t(`fit_${option.id}`)}
            </span>
        );
    }

    function getCategoryIcon(categoryId) {
        const cat = CATEGORIES.find(c => c.id === categoryId);
        return cat?.icon || '📦';
    }

    if (error) {
        return (
            <div className="shared-profile-error">
                <AlertCircle size={64} />
                <h2>{t('invalid_link')}</h2>
                <p>{t('invalid_link_desc')}</p>
                <Link to="/" className="btn btn-primary">
                    <Home size={18} />
                    {t('go_to_sizes')}
                </Link>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="shared-profile-loading">
                <p>{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="shared-profile">
            <header className="shared-header">
                <div className="shared-avatar">
                    {profile.t === 'woman' ? <WomanIcon size={48} /> :
                        (profile.t === 'child' || profile.isChild) ? <Baby size={48} /> :
                            <ManIcon size={48} />}
                </div>
                <div>
                    <h1>{t('share_title')} {profile.n}</h1>
                    <p className="shared-subtitle">{t('shared_from')}</p>
                </div>
            </header>

            <div className="shared-brands">
                {profile.b.length === 0 ? (
                    <div className="shared-empty">
                        <p>{t('no_sizes_saved')}</p>
                    </div>
                ) : (
                    profile.b.map((brand, brandIdx) => (
                        <div key={brandIdx} className="shared-brand card">
                            <h3 className="shared-brand-name">{brand.name}</h3>
                            {brand.notes && <p className="shared-brand-notes">{brand.notes}</p>}

                            {brand.sizes.length === 0 ? (
                                <p className="text-muted">{t('no_sizes')}</p>
                            ) : (
                                <div className="shared-sizes">
                                    {brand.sizes.map((size, sizeIdx) => (
                                        <div key={sizeIdx} className="shared-size-tag">
                                            <span className="shared-size-icon">
                                                {getCategoryIcon(size.category)}
                                            </span>
                                            <span className="shared-size-value">{size.size}</span>
                                            {getFitBadge(size.fit)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="shared-footer">
                <p>{t('want_save_sizes')}</p>
                <Link to="/" className="btn btn-primary">
                    {t('try_sizes')}
                </Link>
            </div>
        </div>
    );
}
