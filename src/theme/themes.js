export const themes = {
    midnight: {
        id: 'midnight',
        name: 'Midnight',
        bgApp: '#0C0614', // Deep obsidian violet
        bgCard: 'rgba(28, 20, 41, 0.65)', // Glassmorphic card
        bgGlass: 'rgba(20, 12, 33, 0.5)',
        bgGlassBorder: 'rgba(128, 90, 213, 0.18)', // Soft purple border
        primary: '#9F7AEA', // Indigo/purple accent
        accent: '#F687B3', // Pink neon
        textPrimary: '#F7FAFC',
        textSecondary: '#A0AEC0',
        divider: 'rgba(128, 90, 213, 0.1)',
        gradientStart: '#1A0E2E',
        gradientEnd: '#08020F',
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        bgApp: '#030D1B', // Deep abyssal blue
        bgCard: 'rgba(12, 33, 56, 0.65)', // Glassmorphic card
        bgGlass: 'rgba(7, 22, 38, 0.5)',
        bgGlassBorder: 'rgba(49, 130, 206, 0.18)', // Soft blue border
        primary: '#3182CE', // Slate blue
        accent: '#319795', // Teal/Cyan
        textPrimary: '#F7FAFC',
        textSecondary: '#A0AEC0',
        divider: 'rgba(49, 130, 206, 0.1)',
        gradientStart: '#061D38',
        gradientEnd: '#01060D',
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Glow',
        bgApp: '#150E0C', // Charcoal slate with amber hints
        bgCard: 'rgba(38, 26, 21, 0.65)', // Glassmorphic card
        bgGlass: 'rgba(28, 18, 14, 0.5)',
        bgGlassBorder: 'rgba(221, 107, 32, 0.18)', // Soft amber border
        primary: '#DD6B20', // Warm Amber/Orange
        accent: '#E53E3E', // Vivid red/coral
        textPrimary: '#F7FAFC',
        textSecondary: '#A0AEC0',
        divider: 'rgba(221, 107, 32, 0.1)',
        gradientStart: '#2A170F',
        gradientEnd: '#090504',
    }
};

export const categories = [
    { id: 'personal', name: 'Personal', color: '#4299E1', icon: 'person' },
    { id: 'work', name: 'Work', color: '#805AD5', icon: 'briefcase' },
    { id: 'fitness', name: 'Health & Gym', color: '#48BB78', icon: 'barbell' },
    { id: 'learning', name: 'Learning', color: '#DD6B20', icon: 'book' },
    { id: 'ideas', name: 'Creative Ideas', color: '#ED64A6', icon: 'bulb' }
];

export const priorities = {
    high: { id: 'high', name: 'High', color: '#E53E3E', labelBg: 'rgba(229, 62, 62, 0.12)' },
    medium: { id: 'medium', name: 'Medium', color: '#DD6B20', labelBg: 'rgba(221, 107, 32, 0.12)' },
    low: { id: 'low', name: 'Low', color: '#3182CE', labelBg: 'rgba(49, 130, 206, 0.12)' }
};
