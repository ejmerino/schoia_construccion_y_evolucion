
// Use explicit hex codes for colors to ensure they work with inline styles,
// bypassing any potential issues with Tailwind's JIT compiler.

const areaColors = {
    // Azul
    exactas: { color: '#4a86e8', textColor: '#ffffff' },
    // Celeste
    computacion: { color: '#4fc3f7', textColor: '#ffffff' },
    // Verde
    vida: { color: '#6aa84f', textColor: '#ffffff' },
    // Naranja
    humanas: { color: '#f6b26b', textColor: '#ffffff' },
    // Amarillo
    electronica: { color: '#ffd966', textColor: '#000000' },
    // Rojo
    mecanica: { color: '#e06666', textColor: '#ffffff' },
    // Café
    construccion: { color: '#b45f06', textColor: '#ffffff' },
    // Morado
    seguridad: { color: '#8e7cc3', textColor: '#ffffff' },
    // Turquesa
    admin: { color: '#46bdc6', textColor: '#ffffff' },
    // Dorado
    titulacion: { color: '#f1c232', textColor: '#000000' },
    // Gris
    default: { color: '#d1d5db', textColor: '#1f2937' },
};

type SubjectAreaInfo = {
  name: string;
  color: string;
  textColor: string;
};

export const SUBJECT_AREA_CONFIG: Record<string, SubjectAreaInfo> = {
    'EXCT': { name: 'Ciencias Exactas', ...areaColors.exactas },
    'COMP': { name: 'Ciencias de la Computación', ...areaColors.computacion },
    'CVDA': { name: 'Ciencias de la Vida', ...areaColors.vida },
    'CHUM': { name: 'Ciencias Humanas y Sociales', ...areaColors.humanas },
    'ELEE': { name: 'Eléctrica y Electrónica', ...areaColors.electronica },
    'EMEC': { name: 'Ciencias de la Energía y Mecánica', ...areaColors.mecanica },
    'TCON': { name: 'Ciencias Tierra y Construcción', ...areaColors.construccion },
    'SEGD': { name: 'Seguridad y Defensa', ...areaColors.seguridad },
    'CADM': { name: 'Ciencias Económicas Administrativas y Comercio', ...areaColors.admin },
    'TITULACION': { name: 'Trabajo de Titulación', ...areaColors.titulacion },
    'DEFAULT': { name: 'Otro', ...areaColors.default },
};


export const getAreaByCode = (code: string): SubjectAreaInfo => {
    if (!code) return SUBJECT_AREA_CONFIG.DEFAULT;
    
    if (code.startsWith('MIC-PROFESIONALIZANTE')) {
        return SUBJECT_AREA_CONFIG['TITULACION'];
    }

    const prefix = code.substring(0, 4).toUpperCase();
    return SUBJECT_AREA_CONFIG[prefix as keyof typeof SUBJECT_AREA_CONFIG] || SUBJECT_AREA_CONFIG.DEFAULT;
};

