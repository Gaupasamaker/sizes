import { openDB } from 'idb';

const DB_NAME = 'sizes-app';
const DB_VERSION = 1;

// Initialize database
export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Profiles store
            if (!db.objectStoreNames.contains('profiles')) {
                const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
                profileStore.createIndex('name', 'name');
            }

            // Brands store
            if (!db.objectStoreNames.contains('brands')) {
                const brandStore = db.createObjectStore('brands', { keyPath: 'id' });
                brandStore.createIndex('profileId', 'profileId');
                brandStore.createIndex('name', 'name');
            }

            // Sizes store
            if (!db.objectStoreNames.contains('sizes')) {
                const sizeStore = db.createObjectStore('sizes', { keyPath: 'id' });
                sizeStore.createIndex('brandId', 'brandId');
                sizeStore.createIndex('category', 'category');
            }
        }
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============ PROFILES ============

export async function getProfiles() {
    const db = await initDB();
    return db.getAll('profiles');
}

export async function getProfile(id) {
    const db = await initDB();
    return db.get('profiles', id);
}

export async function createProfile(data) {
    const db = await initDB();
    // Ensure name, avatar, and color are handled, and add new fields
    const profile = {
        id: generateId(),
        name: data.name,
        avatar: data.avatar || data.name.charAt(0).toUpperCase(),
        color: data.color || 'blue',
        height: data.height || null,
        weight: data.weight || null,
        birthDate: data.birthDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: data.type || (data.isChild ? 'child' : 'man'),
        lastCheck: new Date().toISOString()
    };
    await db.add('profiles', profile);
    return profile;
}

export async function updateProfile(id, data) {
    const db = await initDB();
    const profile = await db.get('profiles', id);
    if (!profile) throw new Error('Profile not found');

    const updated = { ...profile, ...data };
    await db.put('profiles', updated);
    return updated;
}

export async function deleteProfile(id) {
    const db = await initDB();

    // Delete all brands and sizes for this profile
    const brands = await getBrandsByProfile(id);
    for (const brand of brands) {
        await deleteBrand(brand.id);
    }

    await db.delete('profiles', id);
}

// ============ BRANDS ============

export async function getBrandsByProfile(profileId) {
    const db = await initDB();
    const tx = db.transaction('brands', 'readonly');
    const index = tx.store.index('profileId');
    return index.getAll(profileId);
}

export async function getBrand(id) {
    const db = await initDB();
    return db.get('brands', id);
}

export async function createBrand(data) {
    const db = await initDB();
    const brand = {
        id: generateId(),
        profileId: data.profileId,
        name: data.name,
        notes: data.notes || '',
        createdAt: new Date().toISOString()
    };
    await db.add('brands', brand);
    return brand;
}

export async function updateBrand(id, data) {
    const db = await initDB();
    const brand = await db.get('brands', id);
    if (!brand) throw new Error('Brand not found');

    const updated = { ...brand, ...data };
    await db.put('brands', updated);
    return updated;
}

export async function deleteBrand(id) {
    const db = await initDB();

    // Delete all sizes for this brand
    const sizes = await getSizesByBrand(id);
    for (const size of sizes) {
        await db.delete('sizes', size.id);
    }

    await db.delete('brands', id);
}

export async function searchBrands(profileId, query) {
    const brands = await getBrandsByProfile(profileId);
    if (!query) return brands;

    const lowerQuery = query.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(lowerQuery));
}

// ============ SIZES ============

export async function getSizesByBrand(brandId) {
    const db = await initDB();
    const tx = db.transaction('sizes', 'readonly');
    const index = tx.store.index('brandId');
    return index.getAll(brandId);
}

export async function createSize(data) {
    const db = await initDB();
    const size = {
        id: generateId(),
        brandId: data.brandId,
        category: data.category,
        size: data.size,
        fit: data.fit || 'normal',
        notes: data.notes || '',
        photo: data.photo || null, // Base64 image data
        createdAt: new Date().toISOString()
    };
    await db.add('sizes', size);
    return size;
}

export async function updateSize(id, data) {
    const db = await initDB();
    const size = await db.get('sizes', id);
    if (!size) throw new Error('Size not found');

    const updated = { ...size, ...data };
    await db.put('sizes', updated);
    return updated;
}

export async function deleteSize(id) {
    const db = await initDB();
    await db.delete('sizes', id);
}

// ============ EXPORT / IMPORT ============

export async function exportData() {
    const db = await initDB();
    const profiles = await db.getAll('profiles');
    const brands = await db.getAll('brands');
    const sizes = await db.getAll('sizes');

    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        profiles,
        brands,
        sizes
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sizes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

export async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.profiles || !data.brands || !data.sizes) {
                    throw new Error('Invalid backup file format');
                }

                const db = await initDB();

                // Clear existing data
                const tx = db.transaction(['profiles', 'brands', 'sizes'], 'readwrite');
                await tx.objectStore('profiles').clear();
                await tx.objectStore('brands').clear();
                await tx.objectStore('sizes').clear();

                // Import new data
                for (const profile of data.profiles) {
                    await tx.objectStore('profiles').add(profile);
                }
                for (const brand of data.brands) {
                    await tx.objectStore('brands').add(brand);
                }
                for (const size of data.sizes) {
                    await tx.objectStore('sizes').add(size);
                }

                await tx.done;
                resolve({
                    profiles: data.profiles.length,
                    brands: data.brands.length,
                    sizes: data.sizes.length
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

// ============ CATEGORIES ============

export const CATEGORIES = [
    { id: 'tops', name: 'Camisetas', icon: '👕' },
    { id: 'bottoms', name: 'Pantalones', icon: '👖' },
    { id: 'shoes', name: 'Calzado', icon: '👟' },
    { id: 'outerwear', name: 'Abrigos', icon: '🧥' },
    { id: 'accessories', name: 'Accesorios', icon: '⌚' }
];

export const PROFILE_COLORS = ['blue', 'purple', 'pink', 'green', 'orange', 'cyan'];

export const FIT_OPTIONS = [
    { id: 'small', name: 'Ajustado', icon: '📐' },
    { id: 'normal', name: 'Normal', icon: '✓' },
    { id: 'large', name: 'Holgado', icon: '📏' }
];
