import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, User, UserRound, Trash2, Edit2, Ruler, Share2, CheckCircle, Baby, Clock } from 'lucide-react';
import ReloadPrompt from '../components/ReloadPrompt';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getProfiles, createProfile, updateProfile, deleteProfile, PROFILE_COLORS } from '../services/db';
import { generateShareLink, copyToClipboard, nativeShare } from '../services/share';
import { useLanguage } from '../hooks/useLanguage';
import './Profiles.css';

export default function Profiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: 'blue', type: 'man' });
    const [shareMessage, setShareMessage] = useState(null);
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

    async function handleDelete(id, e) {
        e.stopPropagation();
        if (confirm(t('delete_profile_confirm'))) {
            try {
                await deleteProfile(id);
                await loadProfiles();
            } catch (error) {
                console.error('Error deleting profile:', error);
            }
        }
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
                                className={`profile-card card card-interactive profile-color-${profile.color} profile-border-${profile.color}`}
                                onClick={() => navigate(`/profile/${profile.id}`)}
                            >
                                <div className="profile-header">
                                    <div className={`profile-avatar profile-color-${profile.color}`}>
                                        {profile.type === 'woman' ? <UserRound size={24} /> :
                                            (profile.type === 'child' || profile.isChild) ? <Baby size={24} /> :
                                                <User size={24} />}
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
                                </div>
                                <div className="profile-actions">
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={(e) => handleShare(profile, e)}
                                        title={t('share')}
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={(e) => handleEdit(profile, e)}
                                        title={t('edit')}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={(e) => handleDelete(profile.id, e)}
                                        title={t('delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
                                <User size={20} />
                                <span>{t('type_man')}</span>
                            </button>
                            <button
                                type="button"
                                className={`type-option ${formData.type === 'woman' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'woman' })}
                            >
                                <UserRound size={20} />
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
        </Layout>
    );
}
