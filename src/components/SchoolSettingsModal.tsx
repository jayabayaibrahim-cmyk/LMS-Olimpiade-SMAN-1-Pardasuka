import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Building,
  Award,
  Sparkles,
  ShieldCheck,
  Key,
  Cpu,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getSchoolConfig,
  saveSchoolConfig,
  resetSchoolConfig,
  SchoolConfig,
  DEFAULT_SCHOOL_CONFIG,
} from '../services/schoolConfigService';
import {
  getSavedGeminiApiKey,
  saveGeminiApiKey,
  getSavedGeminiEngine,
  saveGeminiEngine,
  getSavedReasoningLevel,
  saveReasoningLevel,
  ReasoningLevel,
} from '../services/aiQuestionService';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: SchoolConfig) => void;
}

const PRESET_LOGOS = [
  {
    name: 'Lambang Emas SMAN 1 Pardasuka',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    description: 'Logo Akademik Resmi Prestasi',
  },
  {
    name: 'Emblem Sains & Olimpiade OSN',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=150&auto=format&fit=crop&q=80',
    description: 'Fokus Pembinaan Sains',
  },
  {
    name: 'Logo Garuda / Pendidikan Nasional',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    description: 'Identitas Satuan Pendidikan',
  },
];

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<SchoolConfig>(getSchoolConfig());
  const [logoPreview, setLogoPreview] = useState<string | null>(config.logoUrl);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini AI Engine, Reasoning & API Key states
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => getSavedGeminiApiKey());
  const [defaultEngine, setDefaultEngine] = useState<string>(() => getSavedGeminiEngine());
  const [defaultReasoning, setDefaultReasoning] = useState<ReasoningLevel>(() => getSavedReasoningLevel());
  const [showKey, setShowKey] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas gambar (PNG, JPG, JPEG, SVG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setConfig((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setLogoPreview(url);
    setConfig((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleClearLogo = () => {
    setLogoPreview(null);
    setConfig((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const saved = saveSchoolConfig(config);
    saveGeminiApiKey(geminiApiKey);
    saveGeminiEngine(defaultEngine);
    saveReasoningLevel(defaultReasoning);
    if (onConfigSaved) onConfigSaved(saved);
    setSaveSuccessNotice('Identitas Sekolah & Pengaturan Engine Gemini Berhasil Disimpan!');
    setTimeout(() => {
      setSaveSuccessNotice(null);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan pengaturan logo dan identitas ke bawaan SMAN 1 Pardasuka?')) {
      const reset = resetSchoolConfig();
      setConfig(reset);
      setLogoPreview(reset.logoUrl);
      if (onConfigSaved) onConfigSaved(reset);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#180d32] border border-purple-700/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-8 animate-fadeIn text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900 border border-purple-600/70 flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pengaturan Identitas & Logo Sekolah
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Khusus Admin
                </span>
              </h3>
              <p className="text-xs text-purple-300/80">
                Logo yang diunggah akan otomatis ditampilkan pada Header Aplikasi dan KOP Lembar Cetak PDF Resmi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {saveSuccessNotice}
          </div>
        )}

        {/* Section: Upload & Logo Selection */}
        <div className="bg-[#120924] p-4 rounded-xl border border-purple-900/70 space-y-4">
          <label className="block text-xs font-bold text-purple-200">
            1. Unggah / Pilih Logo Resmi Sekolah:
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Logo Preview Box */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-purple-600/60 bg-[#1e103d] flex flex-col items-center justify-center p-2 relative shrink-0 shadow-inner overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Pratinjau Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-purple-950 flex items-center justify-center text-amber-400 font-black text-xl border border-purple-800">
                    🏛️
                  </div>
                  <span className="text-[10px] text-purple-400 block mt-1">Logo Default</span>
                </div>
              )}
            </div>

            {/* Upload Buttons */}
            <div className="space-y-2.5 flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>Unggah Gambar Logo dari Komputer</span>
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-semibold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hapus Logo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-purple-400">
                Format didukung: PNG (transparan disarankan), JPG, SVG, WebP. Maksimal 3MB.
              </p>

              {/* URL Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-purple-300 shrink-0">Atau Tautan URL:</span>
                <input
                  type="url"
                  placeholder="https://contoh.com/logo-sekolah.png"
                  value={config.logoUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig((prev) => ({ ...prev, logoUrl: val || null }));
                    setLogoPreview(val || null);
                  }}
                  className="flex-1 bg-[#190d33] border border-purple-800/80 rounded-lg px-2.5 py-1 text-xs text-white placeholder-purple-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Preset Logos */}
          <div className="pt-2 border-t border-purple-900/40">
            <span className="text-[11px] font-semibold text-purple-300 block mb-2">
              Pilihan Contoh Emblem Logo Sekolah:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_LOGOS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all text-left ${
                    config.logoUrl === preset.url
                      ? 'bg-purple-900/50 border-purple-500 ring-1 ring-purple-400'
                      : 'bg-[#180e30] border-purple-900/50 hover:border-purple-700'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-8 h-8 rounded-lg object-cover border border-purple-700/60 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate">{preset.name}</p>
                    <p className="text-[10px] text-purple-400 truncate">{preset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Identitas & Pejabat Sekolah untuk KOP Surat */}
        <div className="bg-[#120924] p-4 rounded-xl border border-purple-900/70 space-y-3">
          <label className="block text-xs font-bold text-purple-200">
            2. Data Teks KOP Surat & Pejabat Pengesah:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-purple-300 font-semibold mb-1">Nama Satuan Pendidikan:</span>
              <input
                type="text"
                value={config.schoolName}
                onChange={(e) => setConfig((prev) => ({ ...prev, schoolName: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
            <div>
              <span className="block text-purple-300 font-semibold mb-1">Wilayah / Kabupaten:</span>
              <input
                type="text"
                value={config.subDistrict}
                onChange={(e) => setConfig((prev) => ({ ...prev, subDistrict: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
            <div>
              <span className="block text-purple-300 font-semibold mb-1">Nama Kepala Sekolah:</span>
              <input
                type="text"
                value={config.headmasterName}
                onChange={(e) => setConfig((prev) => ({ ...prev, headmasterName: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
            <div>
              <span className="block text-purple-300 font-semibold mb-1">NIP Kepala Sekolah:</span>
              <input
                type="text"
                value={config.headmasterNip}
                onChange={(e) => setConfig((prev) => ({ ...prev, headmasterNip: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
            <div>
              <span className="block text-purple-300 font-semibold mb-1">Koordinator Pembina OSN:</span>
              <input
                type="text"
                value={config.coordinatorName}
                onChange={(e) => setConfig((prev) => ({ ...prev, coordinatorName: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
            <div>
              <span className="block text-purple-300 font-semibold mb-1">NIP Koordinator:</span>
              <input
                type="text"
                value={config.coordinatorNip}
                onChange={(e) => setConfig((prev) => ({ ...prev, coordinatorNip: e.target.value }))}
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg px-3 py-1.5 text-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Konfigurasi Default AI Gemini (Engine & API Key) */}
        <div className="bg-[#120924] p-4 rounded-xl border border-purple-900/70 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Konfigurasi Bawaan Engine AI Gemini & API Key:</span>
            </label>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                defaultEngine === 'gemini-4-argon'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                  : 'bg-purple-950 text-purple-300 border-purple-700/60'
              }`}
            >
              {defaultEngine === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Engine Default */}
            <div>
              <span className="block text-purple-300 font-semibold mb-1">Engine Default:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDefaultEngine('gemini-3.8-flash')}
                  className={`py-2 px-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                    defaultEngine === 'gemini-3.8-flash'
                      ? 'bg-purple-600 border-purple-400 text-white shadow'
                      : 'bg-[#190d33] border-purple-800 text-purple-300 hover:border-purple-600'
                  }`}
                >
                  Gemini 3.8 Flash
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultEngine('gemini-4-argon')}
                  className={`py-2 px-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                    defaultEngine === 'gemini-4-argon'
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 border-cyan-300 text-white shadow'
                      : 'bg-[#190d33] border-purple-800 text-purple-300 hover:border-cyan-600'
                  }`}
                >
                  Gemini 4 Argon
                </button>
              </div>
            </div>

            {/* Tingkat Penalaran Default */}
            <div>
              <span className="block text-purple-300 font-semibold mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Penalaran Bawaan (Reasoning):</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['rendah', 'sedang', 'tinggi'] as ReasoningLevel[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setDefaultReasoning(r)}
                    className={`py-2 px-1 rounded-lg text-[11px] font-bold text-center border capitalize transition-all cursor-pointer ${
                      defaultReasoning === r
                        ? 'bg-gradient-to-r from-amber-600 to-purple-600 border-amber-400 text-white shadow'
                        : 'bg-[#190d33] border-purple-800 text-purple-300 hover:border-purple-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="pt-2 border-t border-purple-900/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini API Key Kustom (Opsional):</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  geminiApiKey
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                    : 'bg-purple-950 text-purple-300 border-purple-800/60'
                }`}
              >
                {geminiApiKey ? 'Kunci Kustom Aktif' : 'Default Server'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Kosongkan untuk memakai kunci server (process.env.GEMINI_API_KEY)..."
                className="w-full bg-[#190d33] border border-purple-800 rounded-lg pl-3 pr-14 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-purple-400 focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-purple-400 hover:text-white transition-colors cursor-pointer"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-purple-400/80">
              Kunci ini akan digunakan saat menyusun soal dengan Gemini 4 Argon dan Gemini 3.8 Flash.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Identitas & Logo Sekolah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
