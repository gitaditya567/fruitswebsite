export const API_URL = import.meta.env.VITE_API_URL || 'https://fruits-website-backend.onrender.com';

export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://localhost:5000')) {
        return url.replace('http://localhost:5000', API_URL);
    }
    return url;
};
