import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, X, Tag, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getProfile, getBrandsByProfile, createBrand, searchBrands, getSizesByBrand, CATEGORIES } from '../services/db';
import { searchBrandSuggestions } from '../services/brands';
import { useLanguage } from '../hooks/useLanguage';
import './Brands.css';

export default function Brands() {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [brands, setBrands] = useState([]);
    const [brandSizes, setBrandSizes] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', notes: '' });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const { t } = useLanguage();

    useEffect(() => {
        loadData();
    }, [profileId]);

    useEffect(() => {
        filterBrands();
    }, [searchQuery]);

    // Update suggestions when typing brand name
    useEffect(() => {
        if (formData.name.length >= 1) {
            const results = searchBrandSuggestions(formData.name);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [formData.name]);

    async function loadData() {
        try {
            const profileData = await getProfile(profileId);
            if (!profileData) {
                navigate('/');
                return;
            }
            setProfile(profileData);

            const brandsData = await getBrandsByProfile(profileId);
            setBrands(brandsData);

            // Load size counts for each brand
            const sizeCounts = {};
            for (const brand of brandsData) {
                const sizes = await getSizesByBrand(brand.id);
                sizeCounts[brand.id] = sizes;
            }
            setBrandSizes(sizeCounts);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function filterBrands() {
        if (!profileId) return;
        const filtered = await searchBrands(profileId, searchQuery);
        setBrands(filtered);
    }

    function openModal() {
        setFormData({ name: '', notes: '' });
        setSuggestions([]);
        setShowSuggestions(false);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setFormData({ name: '', notes: '' });
        setSuggestions([]);
        setShowSuggestions(false);
    }

    function selectSuggestion(name) {
        setFormData({ ...formData, name });
        setShowSuggestions(false);
        inputRef.current?.focus();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            const newBrand = await createBrand({ ...formData, profileId });
            navigate(`/brand/${newBrand.id}`);
        } catch (error) {
            console.error('Error creating brand:', error);
        }
    }

    function getSizeSummary(brandId) {
        const sizes = brandSizes[brandId] || [];
        if (sizes.length === 0) return null;

        const categoryGroups = {};
        sizes.forEach(size => {
            const cat = CATEGORIES.find(c => c.id === size.category);
            if (!categoryGroups[size.category]) {
                categoryGroups[size.category] = { icon: cat?.icon || '📦', sizes: [] };
            }
            categoryGroups[size.category].sizes.push(size.size);
        });

        return Object.entries(categoryGroups).map(([catId, data]) => (
            <span key={catId} className="size-preview">
                {data.icon} {data.sizes.join(', ')}
            </span>
        ));
    }

    if (loading) {
        return (
            <Layout title={t('loading')} showBack>
                <div className="empty-state">
                    <p>{t('loading')}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={profile?.name || t('brands')} showBack>
            {/* Search bar */}
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder={t('search_brand')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button className="btn btn-ghost btn-icon search-clear" onClick={() => setSearchQuery('')}>
                        <X size={18} />
                    </button>
                )}
            </div>

            {brands.length === 0 ? (
                <div className="empty-state animate-fadeIn">
                    <Tag size={64} />
                    <h3>{searchQuery ? t('no_results') : t('no_brands')}</h3>
                    <p>{searchQuery ? t('try_another_search') : t('add_brand_hint')}</p>
                </div>
            ) : (
                <div className="brands-list animate-slideUp">
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            className="brand-card card card-interactive"
                            onClick={() => navigate(`/brand/${brand.id}`)}
                        >
                            <div className="brand-info">
                                <h3 className="brand-name">{brand.name}</h3>
                                <div className="brand-sizes">
                                    {getSizeSummary(brand.id) || <span className="text-muted">{t('no_sizes')}</span>}
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-muted" />
                        </div>
                    ))}
                </div>
            )}

            <button className="fab" onClick={openModal}>
                <Plus size={24} />
            </button>

            <Modal isOpen={modalOpen} onClose={closeModal} title={t('new_brand')}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="brandName">{t('brand_name')}</label>
                        <div className="autocomplete-container">
                            <input
                                ref={inputRef}
                                id="brandName"
                                type="text"
                                placeholder={t('brand_name_placeholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                autoFocus
                                autoComplete="off"
                            />
                            {showSuggestions && (
                                <div className="suggestions-dropdown">
                                    {suggestions.map((name, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => selectSuggestion(name)}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">{t('notes')} ({t('optional')})</label>
                        <textarea
                            id="notes"
                            placeholder={t('brand_notes_placeholder')}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {t('create')}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
