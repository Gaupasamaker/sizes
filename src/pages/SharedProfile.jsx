import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, ChevronRight, AlertCircle, Home } from 'lucide-react';
import { decodeShareData } from '../services/share';
import { CATEGORIES, FIT_OPTIONS } from '../services/db';
import { useLanguage } from '../hooks/useLanguage';
import './SharedProfile.css';

// Custom Woman icon with long hair
// Custom Woman icon with long hair (High Fidelity Trace)
// Icono de Mujer exacto proporcionado por el usuario (SVG)
const WomanIcon = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid meet"
        {...props}
    >
        <g
            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
            fill="currentColor"
            stroke="none"
        >
            <path d="M2070 5101 c-399 -87 -715 -358 -851 -731 -57 -158 -60 -184 -69
            -610 -7 -380 -8 -399 -33 -493 -28 -104 -83 -226 -170 -372 -68 -115 -102
            -196 -132 -312 -82 -315 -38 -642 125 -927 52 -91 169 -236 234 -289 l47 -39
            -41 -29 c-115 -83 -237 -244 -289 -379 -55 -141 -61 -198 -61 -548 0 -308 1
            -320 21 -346 16 -20 29 -26 59 -26 99 0 100 5 100 373 0 270 2 313 20 383 60
            240 231 424 469 504 49 16 214 40 371 53 8 0 158 -110 333 -246 290 -225 322
            -247 357 -247 34 0 59 16 227 145 103 80 196 158 206 173 37 56 -6 132 -74
            132 -39 0 -79 -27 -281 -187 -37 -29 -72 -53 -77 -53 -6 0 -122 87 -259 193
            l-249 193 49 49 c58 59 113 165 131 251 l12 60 50 -13 c160 -41 377 -38 556 7
            365 93 675 382 794 740 52 155 57 201 62 589 4 259 2 375 -6 403 -15 50 -48
            66 -131 65 -178 -2 -308 121 -327 308 -9 98 -31 125 -97 125 -27 0 -60 -16
            -133 -64 -326 -213 -690 -355 -1058 -415 -92 -15 -120 -27 -134 -57 -31 -70
            10 -134 86 -134 49 0 315 58 439 95 227 69 451 167 641 279 l92 54 16 -48 c52
            -155 196 -283 353 -312 32 -6 63 -12 71 -14 21 -6 9 -600 -14 -703 -81 -360
            -354 -644 -710 -737 -143 -38 -327 -38 -470 0 -271 71 -509 264 -629 510 -90
            184 -106 292 -106 749 0 302 -1 318 -20 337 -46 46 -122 32 -146 -26 -17 -42
            -20 -603 -3 -750 41 -372 246 -692 556 -871 l84 -48 -4 -60 c-8 -107 -85 -218
            -187 -270 -56 -28 -78 -33 -221 -45 -64 -5 -147 -19 -183 -31 l-67 -20 -47 37
            c-362 292 -491 773 -322 1198 16 42 55 118 86 169 108 176 154 287 190 452 14
            64 18 158 24 470 7 383 7 392 33 480 100 336 357 591 692 687 78 22 92 23 505
            23 487 0 493 -1 685 -95 214 -104 394 -298 477 -513 58 -148 60 -166 68 -582
            6 -311 10 -406 24 -470 36 -164 82 -274 188 -450 112 -185 159 -348 160 -550
            0 -192 -45 -359 -143 -529 -64 -112 -66 -162 -7 -192 47 -24 93 -11 127 36 44
            61 106 186 140 282 124 354 76 737 -134 1074 -68 108 -112 209 -141 319 -26
            97 -27 113 -34 495 -9 426 -12 452 -69 610 -127 348 -425 619 -788 718 l-98
            26 -430 3 c-386 2 -439 0 -515 -16z"/>
            <path d="M2994 1680 c-31 -12 -54 -49 -54 -86 0 -41 69 -135 137 -185 99 -75
            186 -104 333 -114 130 -9 211 -29 305 -75 188 -92 323 -259 375 -464 18 -70
            20 -113 20 -383 0 -368 1 -373 100 -373 30 0 43 6 59 26 20 26 21 38 21 346 0
            252 -3 335 -16 396 -55 266 -228 493 -469 614 -90 46 -210 77 -333 88 -145 12
            -165 17 -223 46 -43 21 -90 64 -151 137 -25 30 -71 42 -104 27z"/>
        </g>
    </svg>
);

// Fallback de icono de Hombre sencillo (Lucide)
const ManIcon = ({ size = 24, ...props }) => (
    <User size={size} strokeWidth={1.5} {...props} />
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
