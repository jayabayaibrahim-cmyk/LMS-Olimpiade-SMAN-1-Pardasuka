export interface SchoolConfig {
  schoolName: string;
  subDistrict: string;
  portalTitle: string;
  logoUrl: string | null; // Base64 data URL or external image URL
  headmasterName: string;
  headmasterNip: string;
  coordinatorName: string;
  coordinatorNip: string;
}

const STORAGE_KEY = 'sman1_pardasuka_school_config';

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'SMA NEGERI 1 PARDASUKA',
  subDistrict: 'KABUPATEN PRINGSEWU • PROVINSI LAMPUNG',
  portalTitle: 'Portal Resmi Pembinaan & Evaluasi Olimpiade Sains Nasional (OSN)',
  logoUrl: null, // If null, fallback to official gold emblem
  headmasterName: 'Drs. H. Syarifuddin, M.Pd.',
  headmasterNip: 'NIP. 196805141995121001',
  coordinatorName: 'Drs. Ahmad Subarjo, M.Pd.',
  coordinatorNip: 'NIP. 197408212002121004',
};

export function getSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SCHOOL_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Failed to read school config:', err);
  }
  return DEFAULT_SCHOOL_CONFIG;
}

export function saveSchoolConfig(config: Partial<SchoolConfig>): SchoolConfig {
  const current = getSchoolConfig();
  const updated: SchoolConfig = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('school_config_updated', { detail: updated }));
  } catch (err) {
    console.error('Failed to save school config:', err);
  }
  return updated;
}

export function resetSchoolConfig(): SchoolConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('school_config_updated', { detail: DEFAULT_SCHOOL_CONFIG }));
  } catch (err) {
    console.error('Failed to reset school config:', err);
  }
  return DEFAULT_SCHOOL_CONFIG;
}
