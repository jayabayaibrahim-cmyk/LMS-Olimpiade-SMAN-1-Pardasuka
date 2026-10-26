import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  LayoutDashboard,
  Cpu,
  FileSpreadsheet,
  GraduationCap,
  Users,
  Lock,
  RotateCcw,
  Calendar,
  LogIn,
  LogOut,
  Building,
  BarChart3,
  UserPlus,
  Download,
  Youtube,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSchoolConfig, SchoolConfig } from '../services/schoolConfigService';
import { InstallAppModal } from './InstallAppModal';
import { getSubjectAbbr, getRoleAbbr } from '../utils/abbreviations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  deviceToken: string;
  onResetDevicePrompt: () => void;
  onOpenLoginModal: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenSchoolSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  allUsers,
  deviceToken,
  onResetDevicePrompt,
  onOpenLoginModal,
  isLoggedIn,
  onLogout,
  onOpenSchoolSettings,
}) => {
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getSchoolConfig());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e.detail) setSchoolConfig(e.detail);
      else setSchoolConfig(getSchoolConfig());
    };
    window.addEventListener('school_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('school_config_updated', handleConfigUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#120a22]/90 backdrop-blur-md border-b border-purple-900/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Branding */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform overflow-hidden">
              <div className="w-full h-full bg-[#160d2b] rounded-[10px] flex items-center justify-center overflow-hidden">
                {schoolConfig.logoUrl ? (
                  <img
                    src={schoolConfig.logoUrl}
                    alt={schoolConfig.schoolName}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-6 transition-transform" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-purple-100 to-amber-300 bg-clip-text text-transparent truncate">
                  Ruang Aplikasiku
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 shrink-0">
                  OSN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-purple-300/80 tracking-wide truncate">
                <span className="hidden sm:inline">{schoolConfig.schoolName}</span>
                <span className="sm:hidden">SMAN 1 Pardasuka</span>{' '}
                <span className="text-amber-400/90 hidden xs:inline">• Sains</span>
              </p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('bimbingan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bimbingan'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Calendar className="w-4 h-4 text-pink-400" />
              Jadwal Bimbingan
            </button>

            <button
              onClick={() => setActiveTab('cbt')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cbt'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              Ujian CBT OSN
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              {currentUser.role === 'student' ? (
                <>
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Soal Terjadwal
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Bank Soal & AI
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'modules'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              Modul OSN
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'media'
                  ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-400" />
              Media Belajar
            </button>

            {/* Fitur Analisis Soal (Khusus Admin Sekolah - Dihilangkan dari Akun Guru & Siswa) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'analysis'
                    ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                    : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Analisis Soal
              </button>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'security'
                      ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Tracking 1-Device
                </button>

                <button
                  onClick={() => setActiveTab('gas')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'gas'
                      ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-inner'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Export GAS
                </button>
              </>
            )}

            {currentUser.role === 'admin' && onOpenSchoolSettings && (
              <button
                onClick={onOpenSchoolSettings}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow transition-all cursor-pointer ml-1"
              >
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Logo Sekolah</span>
              </button>
            )}
          </nav>

          {/* Right Controls: 1-Device Status & Login/User Switcher */}
          {/* Right Controls: 1-Device Status & Login/User Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Download / Install App Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              title="Download & Pasang Aplikasi ke Layar Utama"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download App</span>
            </button>

            {/* 1-Device Lock Indicator Pill (Hanya Tampil di Akun Admin) */}
            {currentUser.role === 'admin' && (
              <div
                onClick={() => setActiveTab('security')}
                title="1-Device Policy: Akun terikat ke token perangkat browser ini"
                className="cursor-pointer hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono hover:bg-emerald-900/50 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">1-DEV:</span>
                <span className="text-emerald-200 truncate max-w-[65px]">{deviceToken.substring(0, 8)}...</span>
              </div>
            )}

            {/* User Profile / Login Box */}
            {isLoggedIn ? (
              <div className="relative flex items-center gap-1.5 sm:gap-2 bg-[#1b1035] border border-purple-800/50 rounded-xl p-1 sm:p-1.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-purple-600/60 shrink-0"
                />
                <div className="flex flex-col text-left pr-0.5 sm:pr-1 min-w-0">
                  <span className="text-xs font-bold text-white leading-tight truncate max-w-[65px] sm:max-w-[105px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold uppercase leading-none truncate max-w-[65px] sm:max-w-[105px]">
                    {currentUser.role === 'admin'
                      ? 'Admin'
                      : `${getRoleAbbr(currentUser.role)}${currentUser.subject ? ` • ${getSubjectAbbr(currentUser.subject)}` : ''}`}
                  </span>
                </div>

                {currentUser.role === 'admin' && onOpenSchoolSettings && (
                  <button
                    onClick={onOpenSchoolSettings}
                    title="Atur Logo Sekolah & KOP Surat"
                    className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 cursor-pointer flex items-center gap-0.5 text-[10px] font-bold shrink-0"
                  >
                    <Building className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={onOpenLoginModal}
                  title="Ganti Akun Pengguna"
                  className="px-1.5 sm:px-2 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-[10px] font-semibold cursor-pointer shrink-0"
                >
                  Ganti
                </button>

                <button
                  onClick={onLogout}
                  title="Keluar / Logout"
                  className="p-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar with Concise Abbreviations to Prevent Word Stacking */}
        <div className="lg:hidden flex overflow-x-auto gap-1.5 sm:gap-2 py-2 border-t border-purple-900/30 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bimbingan')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'bimbingan' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            <span className="sm:hidden">Jadwal</span>
            <span className="hidden sm:inline">Jadwal Bimbingan</span>
          </button>
          <button
            onClick={() => setActiveTab('cbt')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'cbt' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            Ujian CBT
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'generator' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            {currentUser.role === 'student' ? 'Soal' : 'Bank Soal'}
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
              activeTab === 'modules' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            Modul
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap flex items-center gap-1 transition-colors ${
              activeTab === 'media' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span className="sm:hidden">Media</span>
            <span className="hidden sm:inline">Media Belajar</span>
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
                activeTab === 'analysis' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
              }`}
            >
              Analisis
            </button>
          )}
          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
                  activeTab === 'security' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
                }`}
              >
                1-Device
              </button>
              <button
                onClick={() => setActiveTab('gas')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-colors ${
                  activeTab === 'gas' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-purple-900/30'
                }`}
              >
                Export GAS
              </button>
            </>
          )}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unduh App</span>
          </button>
        </div>
      </div>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </header>
  );
};
