import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, User, UserRound, Trash2, Edit2, Ruler, Share2, CheckCircle, Baby, Clock, MoreVertical, X } from 'lucide-react';
import ReloadPrompt from '../components/ReloadPrompt';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getProfiles, createProfile, updateProfile, deleteProfile, PROFILE_COLORS } from '../services/db';
import { generateShareLink, copyToClipboard, nativeShare } from '../services/share';
import { useLanguage } from '../hooks/useLanguage';
import './Profiles.css';

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

// Icono de Hombre exacto proporcionado por el usuario (SVG)
const ManIcon = ({ size = 24, ...props }) => (
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
            <path d="M2345 5114 c-347 -52 -600 -175 -811 -396 -179 -187 -291 -410 -356
            -708 -21 -100 -23 -126 -23 -520 l0 -415 28 -57 c34 -70 108 -138 181 -168
            l53 -23 6 -76 c27 -339 248 -682 555 -858 l83 -48 -4 -60 c-8 -109 -82 -217
            -184 -268 -60 -30 -80 -35 -225 -47 -123 -11 -243 -42 -333 -88 -241 -121
            -414 -348 -469 -614 -13 -61 -16 -144 -16 -396 0 -308 1 -320 21 -346 16 -20
            29 -26 59 -26 99 0 100 5 100 373 0 270 2 312 20 381 38 150 116 275 231 373
            119 100 242 149 413 163 61 5 125 12 142 15 25 4 33 1 41 -18 19 -42 112 -150
            176 -204 77 -66 216 -137 322 -164 113 -30 299 -30 410 0 131 35 299 126 339
            183 23 33 20 82 -8 114 -36 42 -80 38 -155 -15 -72 -50 -165 -93 -241 -112
            -71 -16 -209 -16 -280 0 -149 36 -292 131 -380 252 l-30 42 43 33 c85 66 156
            186 180 302 l12 58 50 -13 c214 -55 496 -32 709 58 348 148 597 451 677 824
            26 117 39 520 19 579 -21 65 -101 85 -149 37 -16 -16 -19 -44 -24 -262 -4
            -156 -11 -267 -21 -309 -83 -370 -351 -652 -711 -746 -143 -38 -327 -38 -470
            0 -271 71 -509 264 -629 510 -93 190 -109 313 -104 816 3 339 3 346 26 382 24
            38 90 78 130 78 36 0 90 -27 141 -69 62 -52 169 -120 260 -166 211 -106 547
            -169 612 -116 34 28 32 93 -4 145 -26 38 -64 143 -54 152 2 3 37 -14 76 -37
            217 -125 464 -189 733 -189 130 0 138 1 165 24 39 34 39 98 0 132 -26 23 -36
            24 -156 24 -281 0 -542 82 -761 239 -90 65 -126 74 -167 46 -48 -34 -85 -207
            -65 -308 l10 -48 -42 7 c-130 21 -324 113 -468 222 -135 101 -172 117 -278
            117 -71 0 -94 -4 -141 -26 -65 -31 -129 -90 -158 -146 -33 -66 -41 -146 -41
            -432 l0 -274 -26 24 c-52 47 -54 63 -54 411 0 237 4 350 15 423 32 213 98 396
            196 550 63 98 201 242 291 301 150 100 338 168 535 195 121 16 389 6 518 -21
            120 -24 245 -60 245 -70 0 -4 -11 -11 -25 -14 -43 -11 -65 -41 -65 -89 0 -72
            22 -85 176 -102 211 -25 357 -75 509 -178 63 -43 189 -163 220 -210 17 -27 17
            -27 -24 -90 -52 -80 -96 -201 -110 -301 -6 -43 -11 -217 -11 -387 0 -340 2
            -355 59 -378 34 -15 67 -7 99 22 22 20 22 22 22 341 1 361 9 436 60 540 18 35
            52 88 76 116 70 83 70 116 -1 215 -142 198 -348 352 -575 429 l-74 25 -1 57
            c0 54 -2 59 -32 80 -84 57 -308 132 -522 175 -85 18 -148 22 -321 24 -118 2
            -228 1 -245 -1z"/>
            <path d="M2994 1680 c-31 -13 -54 -49 -54 -87 0 -45 80 -146 157 -199 89 -61
            160 -85 288 -96 157 -14 238 -33 330 -78 187 -91 322 -258 375 -466 18 -69 20
            -111 20 -381 0 -368 1 -373 100 -373 30 0 43 6 59 26 20 26 21 38 21 346 0
            252 -3 335 -16 396 -35 168 -117 323 -237 445 -153 155 -337 238 -569 257
            -140 12 -158 15 -219 46 -49 24 -94 64 -144 127 -32 40 -73 54 -111 37z"/>
        </g>
    </svg>
);

export default function Profiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: 'blue', type: 'man' });
    const [shareMessage, setShareMessage] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        loadProfiles();
    }, []);

    async function loadProfiles() {
        try {
            const data = await getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setLoading(false);
        }
    }

    function openModal(profile = null) {
        if (profile) {
            setEditingProfile(profile);
            // Fallback for legacy isChild
            const type = profile.type || (profile.isChild ? 'child' : 'man');
            setFormData({ name: profile.name, color: profile.color, type });
        } else {
            setEditingProfile(null);
            setFormData({ name: '', color: 'blue', type: 'man' });
        }
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingProfile(null);
        setFormData({ name: '', color: 'blue', type: 'man' });
    }

    function toggleLanguage() {
        setLanguage(language === 'es' ? 'en' : 'es');
    }

    // Check if profile needs size review (3 months)
    function checkGrowthReminder(profile) {
        const isChild = profile.type === 'child' || profile.isChild === true;
        if (!isChild || !profile.lastCheck) return false;

        const lastCheck = new Date(profile.lastCheck);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        return lastCheck < threeMonthsAgo;
    }

    async function handleCheckSizes(profile, e) {
        e.stopPropagation();
        try {
            await updateProfile(profile.id, { lastCheck: new Date().toISOString() });
            loadProfiles();
            setShareMessage(t('sizes_checked'));
            setTimeout(() => setShareMessage(null), 3000);
        } catch (error) {
            console.error('Error updating check date:', error);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (editingProfile) {
                await updateProfile(editingProfile.id, formData);
            } else {
                await createProfile(formData);
            }
            await loadProfiles();
            closeModal();
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }

    function handleDelete(id, e) {
        e.stopPropagation();
        setOpenMenuId(null);
        setDeleteConfirmId(id);
    }

    async function confirmDelete() {
        if (deleteConfirmId) {
            try {
                await deleteProfile(deleteConfirmId);
                await loadProfiles();
            } catch (error) {
                console.error('Error deleting profile:', error);
            } finally {
                setDeleteConfirmId(null);
            }
        }
    }

    function cancelDelete() {
        setDeleteConfirmId(null);
    }

    function handleEdit(profile, e) {
        e.stopPropagation();
        openModal(profile);
    }

    async function handleShare(profile, e) {
        e.stopPropagation();
        try {
            const url = await generateShareLink(profile.id);

            const shared = await nativeShare(
                `${t('share_title')} ${profile.name}`,
                t('share_text'),
                url
            );

            if (!shared) {
                await copyToClipboard(url);
                setShareMessage(`${t('link_copied')} ${profile.name}`);
                setTimeout(() => setShareMessage(null), 3000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }

    if (loading) {
        return (
            <Layout title={t('app_name')}>
                <div className="empty-state">
                    <p>{t('loading')}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={t('app_name')}>
            <ReloadPrompt />
            {/* Size Guide Link */}
            <Link to="/size-guide" className="size-guide-link card animate-fadeIn">
                <Ruler size={24} />
                <div>
                    <h4>{t('size_guide')}</h4>
                    <p>{t('size_guide_subtitle')}</p>
                </div>
            </Link>

            {/* Profiles Grid */}
            {profiles.length === 0 ? (
                <div className="empty-state animate-fadeIn">
                    <User size={64} />
                    <h3>{t('no_profiles')}</h3>
                    <p>{t('add_profile_hint')}</p>
                </div>
            ) : (
                <div className="profiles-grid animate-slideUp">
                    {profiles.map((profile) => {
                        const needsCheck = checkGrowthReminder(profile);

                        return (
                            <div
                                key={profile.id}
                                className={`profile-card card card-interactive profile-color-${profile.color} profile-border-${profile.color} ${openMenuId === profile.id ? 'menu-open' : ''}`}
                                onClick={() => navigate(`/profile/${profile.id}`)}
                            >
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        {profile.type === 'woman' ? <WomanIcon size={48} /> :
                                            (profile.type === 'child' || profile.isChild) ? <Baby size={48} /> :
                                                <ManIcon size={48} />}
                                    </div>
                                    <div className="profile-info">
                                        <h3>{profile.name}</h3>
                                        <span>
                                            {profile.type === 'woman' ? t('type_woman') :
                                                (profile.type === 'child' || profile.isChild) ? t('type_child') :
                                                    t('type_man')}
                                        </span>
                                        {needsCheck && (
                                            <div className="growth-warning" onClick={(e) => handleCheckSizes(profile, e)}>
                                                <Clock size={14} />
                                                <span>{t('check_sizes')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-actions">
                                        <button
                                            className="btn btn-ghost btn-icon menu-trigger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === profile.id ? null : profile.id);
                                            }}
                                            title={t('more_options') || 'Más opciones'}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {openMenuId === profile.id && (
                                            <div className="profile-menu">
                                                <button onClick={(e) => { handleShare(profile, e); setOpenMenuId(null); }}>
                                                    <Share2 size={16} />
                                                    <span>{t('share')}</span>
                                                </button>
                                                <button onClick={(e) => { handleEdit(profile, e); setOpenMenuId(null); }}>
                                                    <Edit2 size={16} />
                                                    <span>{t('edit')}</span>
                                                </button>
                                                <button className="danger" onClick={(e) => { handleDelete(profile.id, e); setOpenMenuId(null); }}>
                                                    <Trash2 size={16} />
                                                    <span>{t('delete')}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {needsCheck && (
                                    <p className="growth-message">{t('check_sizes_hint')}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <button className="fab" onClick={() => openModal()}>
                <Plus size={24} />
            </button>

            {/* Share toast */}
            {shareMessage && (
                <div className="share-toast animate-slideUp">
                    <CheckCircle size={18} />
                    <span>{shareMessage}</span>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingProfile ? t('edit_profile') : t('new_profile')}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">{t('profile_name')}</label>
                        <input
                            id="name"
                            type="text"
                            placeholder={t('profile_name_placeholder')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('color')}</label>
                        <div className="color-picker">
                            {PROFILE_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option profile-color-${color} ${formData.color === color ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, color })}
                                >
                                    <span style={{ background: `var(--profile-color)` }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('profile_type')}</label>
                        <div className="type-picker">
                            <button
                                type="button"
                                className={`type-option ${formData.type === 'man' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'man' })}
                            >
                                <ManIcon size={24} />
                                <span>{t('type_man')}</span>
                            </button>
                            <button
                                type="button"
                                className={`type-option ${formData.type === 'woman' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'woman' })}
                            >
                                <WomanIcon size={24} />
                                <span>{t('type_woman')}</span>
                            </button>
                            <button
                                type="button"
                                className={`type-option ${formData.type === 'child' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'child' })}
                            >
                                <Baby size={20} />
                                <span>{t('type_child')}</span>
                            </button>
                        </div>
                        {formData.type === 'child' && (
                            <small className="type-hint">{t('is_child_hint')}</small>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingProfile ? t('save') : t('create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteConfirmId !== null} onClose={cancelDelete}>
                <div className="confirm-modal-content">
                    <div className="confirm-modal-icon danger">
                        <Trash2 size={48} />
                    </div>
                    <h2>{t('delete_profile')}</h2>
                    <p>{t('delete_profile_confirm')}</p>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                            {t('cancel')}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
