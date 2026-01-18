import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, AlertCircle, Camera, Image, X } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getBrand, updateBrand, deleteBrand, getSizesByBrand, createSize, updateSize, deleteSize, CATEGORIES, FIT_OPTIONS } from '../services/db';
import { useLanguage } from '../hooks/useLanguage';
import './BrandDetail.css';

export default function BrandDetail() {
    const { brandId } = useParams();
    const navigate = useNavigate();
    const [brand, setBrand] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sizeModalOpen, setSizeModalOpen] = useState(false);
    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [editingSize, setEditingSize] = useState(null);
    const [sizeForm, setSizeForm] = useState({ category: 'tops', size: '', fit: 'normal', notes: '', photo: null });
    const [brandForm, setBrandForm] = useState({ name: '', notes: '' });
    const fileInputRef = useRef(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        loadData();
    }, [brandId]);

    async function loadData() {
        try {
            const brandData = await getBrand(brandId);
            if (!brandData) {
                navigate('/');
                return;
            }
            setBrand(brandData);
            setBrandForm({ name: brandData.name, notes: brandData.notes || '' });

            const sizesData = await getSizesByBrand(brandId);
            setSizes(sizesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Size modal handlers
    function openSizeModal(size = null) {
        if (size) {
            setEditingSize(size);
            setSizeForm({
                category: size.category,
                size: size.size,
                fit: size.fit,
                notes: size.notes || '',
                photo: size.photo || null
            });
        } else {
            setEditingSize(null);
            setSizeForm({ category: 'tops', size: '', fit: 'normal', notes: '', photo: null });
        }
        setSizeModalOpen(true);
    }

    function closeSizeModal() {
        setSizeModalOpen(false);
        setEditingSize(null);
        setSizeForm({ category: 'tops', size: '', fit: 'normal', notes: '', photo: null });
    }

    // Photo handling
    function handlePhotoCapture() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            // Compress image
            const img = document.createElement('img');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 800;
                let { width, height } = img;

                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setSizeForm({ ...sizeForm, photo: compressedDataUrl });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function removePhoto() {
        setSizeForm({ ...sizeForm, photo: null });
    }

    function openPhotoModal(photo) {
        setSelectedPhoto(photo);
        setPhotoModalOpen(true);
    }

    function closePhotoModal() {
        setSelectedPhoto(null);
        setPhotoModalOpen(false);
    }

    async function handleSizeSubmit(e) {
        e.preventDefault();
        if (!sizeForm.size.trim()) return;

        try {
            if (editingSize) {
                await updateSize(editingSize.id, sizeForm);
            } else {
                await createSize({ ...sizeForm, brandId });
            }
            await loadData();
            closeSizeModal();
        } catch (error) {
            console.error('Error saving size:', error);
        }
    }

    async function handleDeleteSize(id) {
        if (confirm('¿Eliminar esta talla?')) {
            try {
                await deleteSize(id);
                await loadData();
            } catch (error) {
                console.error('Error deleting size:', error);
            }
        }
    }

    // Brand modal handlers
    function openBrandModal() {
        setBrandModalOpen(true);
    }

    function closeBrandModal() {
        setBrandModalOpen(false);
    }

    async function handleBrandSubmit(e) {
        e.preventDefault();
        if (!brandForm.name.trim()) return;

        try {
            await updateBrand(brandId, brandForm);
            await loadData();
            closeBrandModal();
        } catch (error) {
            console.error('Error updating brand:', error);
        }
    }

    async function handleDeleteBrand() {
        if (confirm('¿Eliminar esta marca y todas sus tallas?')) {
            try {
                await deleteBrand(brandId);
                navigate(-1);
            } catch (error) {
                console.error('Error deleting brand:', error);
            }
        }
    }

    // Group sizes by category
    function getSizesByCategory() {
        const grouped = {};
        CATEGORIES.forEach(cat => {
            grouped[cat.id] = sizes.filter(s => s.category === cat.id);
        });
        return grouped;
    }

    function getFitBadge(fit) {
        const option = FIT_OPTIONS.find(f => f.id === fit);
        if (!option || fit === 'normal') return null;
        return (
            <span className={`fit-badge fit-${fit}`}>
                {option.icon} {t(`fit_${option.id}`)}
            </span>
        );
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

    const sizesByCategory = getSizesByCategory();

    return (
        <Layout title={brand?.name || t('brands')} showBack>
            {/* Brand header */}
            <div className="brand-header card animate-fadeIn">
                <div className="brand-header-info">
                    <h2>{brand.name}</h2>
                    {brand.notes && <p className="brand-notes">{brand.notes}</p>}
                </div>
                <div className="brand-header-actions">
                    <button className="btn btn-ghost btn-icon" onClick={openBrandModal} title={t('edit')}>
                        <Edit2 size={18} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={handleDeleteBrand} title={t('delete')}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Sizes by category */}
            <div className="sizes-container animate-slideUp">
                {CATEGORIES.map((category) => {
                    const categorySizes = sizesByCategory[category.id];

                    return (
                        <div key={category.id} className="category-section">
                            <h3 className="category-title">
                                <span className="category-icon">{category.icon}</span>
                                {t(`cat_${category.id}`)}
                            </h3>

                            {categorySizes.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                                    {t('no_sizes')}
                                </p>
                            ) : (
                                <div className="sizes-grid">
                                    {categorySizes.map((size) => (
                                        <div key={size.id} className="size-card">
                                            {size.photo && (
                                                <div
                                                    className="size-photo"
                                                    onClick={() => openPhotoModal(size.photo)}
                                                >
                                                    <img src={size.photo} alt="Etiqueta" />
                                                </div>
                                            )}
                                            <div className="size-main">
                                                <span className="size-value">{size.size}</span>
                                                {getFitBadge(size.fit)}
                                                {size.photo && <Image size={14} className="photo-indicator" />}
                                            </div>
                                            {size.notes && (
                                                <p className="size-notes">{size.notes}</p>
                                            )}
                                            <div className="size-actions">
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => openSizeModal(size)}
                                                    title={t('edit')}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => handleDeleteSize(size.id)}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {sizes.length === 0 && (
                <div className="empty-hint">
                    <AlertCircle size={20} />
                    <span>{t('first_size_hint')}</span>
                </div>
            )}

            <button className="fab" onClick={() => openSizeModal()}>
                <Plus size={24} />
            </button>

            {/* Hidden file input for photo capture */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Size Modal */}
            <Modal
                isOpen={sizeModalOpen}
                onClose={closeSizeModal}
                title={editingSize ? t('edit_size') : t('new_size')}
            >
                <form onSubmit={handleSizeSubmit}>
                    <div className="form-group">
                        <label>{t('category')}</label>
                        <div className="category-picker">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`category-option ${sizeForm.category === cat.id ? 'selected' : ''}`}
                                    onClick={() => setSizeForm({ ...sizeForm, category: cat.id })}
                                >
                                    <span className="category-option-icon">{cat.icon}</span>
                                    <span className="category-option-name">{t(`cat_${cat.id}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="sizeValue">{t('size')}</label>
                        <input
                            id="sizeValue"
                            type="text"
                            placeholder={t('size_placeholder')}
                            value={sizeForm.size}
                            onChange={(e) => setSizeForm({ ...sizeForm, size: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('how_fits')}</label>
                        <div className="fit-picker">
                            {FIT_OPTIONS.map((fit) => (
                                <button
                                    key={fit.id}
                                    type="button"
                                    className={`fit-option ${sizeForm.fit === fit.id ? 'selected' : ''}`}
                                    onClick={() => setSizeForm({ ...sizeForm, fit: fit.id })}
                                >
                                    <span>{fit.icon}</span>
                                    <span>{t(`fit_${fit.id}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo section */}
                    <div className="form-group">
                        <label>{t('photo_label')} ({t('optional')})</label>
                        {sizeForm.photo ? (
                            <div className="photo-preview">
                                <img src={sizeForm.photo} alt="Etiqueta" />
                                <button
                                    type="button"
                                    className="photo-remove btn btn-icon"
                                    onClick={removePhoto}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="photo-capture-btn"
                                onClick={handlePhotoCapture}
                            >
                                <Camera size={20} />
                                <span>{t('take_photo')}</span>
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="sizeNotes">{t('notes')} ({t('optional')})</label>
                        <input
                            id="sizeNotes"
                            type="text"
                            placeholder={t('size_notes_placeholder')}
                            value={sizeForm.notes}
                            onChange={(e) => setSizeForm({ ...sizeForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeSizeModal}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingSize ? t('save') : t('add')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Photo View Modal */}
            <Modal isOpen={photoModalOpen} onClose={closePhotoModal} title={t('photo_label_title')}>
                {selectedPhoto && (
                    <div className="photo-full">
                        <img src={selectedPhoto} alt="Etiqueta" />
                    </div>
                )}
            </Modal>

            {/* Brand Edit Modal */}
            <Modal isOpen={brandModalOpen} onClose={closeBrandModal} title={t('edit_brand')}>
                <form onSubmit={handleBrandSubmit}>
                    <div className="form-group">
                        <label htmlFor="editBrandName">{t('profile_name')}</label>
                        <input
                            id="editBrandName"
                            type="text"
                            value={brandForm.name}
                            onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="editBrandNotes">{t('notes')}</label>
                        <textarea
                            id="editBrandNotes"
                            value={brandForm.notes}
                            onChange={(e) => setBrandForm({ ...brandForm, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeBrandModal}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
