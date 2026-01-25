/**
 * Size Recommender Service
 * Provides estimated clothing sizes based on height, weight, gender, and age.
 */

export function getRecommendedSize(profile, categoryId) {
    if (!profile || !profile.height) return null;

    const { height, weight, type } = profile;
    const isChild = type === 'child';

    // RECOMMENDATION FOR KIDS
    if (isChild) {
        // Kids sizes are often based directly on height in cm
        if (categoryId === 'tops' || categoryId === 'bottoms' || categoryId === 'outerwear') {
            // Find the closest standard height size (74, 80, 86, 92, 98, 104, 110, 116, 122, 128, 140, 152, 164)
            const standardHeights = [74, 80, 86, 92, 98, 104, 110, 116, 122, 128, 134, 140, 146, 152, 158, 164];
            const closest = standardHeights.reduce((prev, curr) => {
                return (Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
            });
            return closest.toString();
        }

        if (categoryId === 'shoes') {
            // Very rough estimation for kids shoes based on height if age is unknown
            // Better to rely on manual entry, but let's provide a rough midpoint
            if (height < 80) return '19-20';
            if (height < 90) return '22-23';
            if (height < 100) return '25-26';
            if (height < 115) return '28-29';
            if (height < 130) return '31-33';
            if (height < 150) return '35-37';
        }
        return null;
    }

    // RECOMMENDATION FOR ADULTS
    const isWoman = type === 'woman';

    // Adult Tops / Outerwear (XS - XXL)
    if (categoryId === 'tops' || categoryId === 'outerwear') {
        if (isWoman) {
            if (height < 155 || (weight && weight < 48)) return 'XS';
            if (height < 162 || (weight && weight < 56)) return 'S';
            if (height < 170 || (weight && weight < 68)) return 'M';
            if (height < 178 || (weight && weight < 80)) return 'L';
            return 'XL';
        } else {
            // Men
            if (height < 165 || (weight && weight < 60)) return 'S';
            if (height < 175 || (weight && weight < 75)) return 'M';
            if (height < 185 || (weight && weight < 90)) return 'L';
            if (height < 195 || (weight && weight < 105)) return 'XL';
            return 'XXL';
        }
    }

    // Adult Bottoms (EU Sizes 34-52+)
    if (categoryId === 'bottoms') {
        if (isWoman) {
            if (height < 158 && weight < 50) return '34';
            if (weight < 58) return '36';
            if (weight < 66) return '38-40';
            if (weight < 78) return '42';
            return '44+';
        } else {
            // Men
            if (weight < 65) return '38-40';
            if (weight < 75) return '42';
            if (weight < 85) return '44';
            if (weight < 95) return '46';
            return '48-50';
        }
    }

    return null;
}
