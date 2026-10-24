import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  Mail,
  Phone,
  UserPlus,
  LogIn,
  ChevronDown,
  ChevronUp,
  Download,
  Smartphone,
  Monitor,
  Printer,
  FileText,
  Share2,
} from 'lucide-react';
import { UserProfile, OsnSubject, UserRole } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadRegistrationCard } from '../services/registrationCardService';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: UserProfile) => void;
  onRegister?: (newUser: UserProfile) => void;
  allUsers: UserProfile[];
  deviceToken: string;
}

const OSN_SUBJECT_LIST: { subject: OsnSubject; icon: string }[] = [
  { subject: 'Matematika', icon: '∑' },
  { subject: 'Fisika', icon: '⚡' },
  { subject: 'Biologi', icon: '🧬' },
  { subject: 'Kimia', icon: '⚗️' },
  { subject: 'Informatika', icon: '💻' },
  { subject: 'Astronomi', icon: '🔭' },
  { subject: 'Kebumian', icon: '🌍' },
  { subject: 'Ekonomi', icon: '📈' },
  { subject: 'Geografi', icon: '🗺️' },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  allUsers,
  deviceToken,
}) => {
  // Modal active view: 'login' | 'register' | 'registered-success'
  const [activeView, setActiveView] = useState<'login' | 'register' | 'registered-success'>('login');

  // Simple Login Form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showDemoList, setShowDemoList] = useState(false);

  // Register Form state
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regSubject, setRegSubject] = useState<OsnSubject>('Matematika');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Post-registration state
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PWA Install Hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  // 1. SIMPLE LOGIN: HANYA USER DAN PASSWORD
  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputClean = loginUser.trim().toLowerCase();
    if (!inputClean) {
      setErrorMsg('Silakan masukkan User (Username / NISN / NIP / Email).');
      return;
    }

    const found = allUsers.find((u) => {
      const matchNisn = u.nisnOrNip && u.nisnOrNip.trim().toLowerCase() === inputClean;
      const matchUsername = u.username && u.username.trim().toLowerCase() === inputClean;
      const matchEmail = u.email && u.email.trim().toLowerCase() === inputClean;
      const matchName = u.name.toLowerCase().includes(inputClean);
      return matchNisn || matchUsername || matchEmail || matchName;
    });

    if (!found) {
      setErrorMsg('User tidak ditemukan. Pastikan NISN / NIP / Username benar, atau silakan Daftar Akun Baru.');
      return;
    }

    if (found.password && loginPassword && found.password !== loginPassword) {
      setErrorMsg('Password salah. Silakan periksa kembali atau gunakan akun demo.');
      return;
    }

    // Login dengan profil yang sesuai (otomatis memuat mapel yang sudah dipilih saat daftar)
    onLogin(found);
  };

  // Quick Demo Account Selection
  const handleQuickSelect = (user: UserProfile) => {
    onLogin(user);
  };

  // 2. REGISTRASI: FORMULIR PENDAFTARAN LENGKAP
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim()) {
      setErrorMsg('Nama Lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Alamat Email wajib diisi.');
      return;
    }
    if (!regWhatsapp.trim()) {
      setErrorMsg('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('User (Username / NISN / NIP) wajib diisi untuk login.');
      return;
    }
    if (!regPassword.trim()) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    // Cek apakah username sudah dipakai
    const existing = allUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === regUsername.trim().toLowerCase()) ||
        u.nisnOrNip.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (existing) {
      setErrorMsg(`User "${regUsername}" sudah terdaftar pada sistem. Silakan gunakan User lain atau masuk login.`);
      return;
    }

    const newUser: UserProfile = {
      id: `USER-${regRole.toUpperCase()}-${Date.now()}`,
      name: regFullName.trim(),
      nisnOrNip: regUsername.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      whatsapp: regWhatsapp.trim(),
      role: regRole,
      subject: regRole === 'admin' ? undefined : regSubject,
      grade:
        regRole === 'student'
          ? 'Siswa Binaan OSN'
          : regRole === 'teacher'
          ? 'Guru Pembina OSN'
          : 'Staf Administrator',
      avatar:
        regRole === 'admin'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : regRole === 'teacher'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      deviceToken: deviceToken,
      deviceName: 'Browser Device (SMAN 1 Pardasuka)',
      isDeviceLocked: true,
      password: regPassword,
    };

    if (onRegister) {
      onRegister(newUser);
    }

    // Alihkan ke tampilan download aplikasi & bukti registrasi
    setRegisteredUser(newUser);
    setActiveView('registered-success');
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setSuccessMsg('Aplikasi berhasil dipasang di perangkat Anda!');
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1a0e33] via-[#140a28] to-[#0c0517] border border-purple-700/60 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden animate-fadeIn max-h-[92vh] overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button if optional */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Branding */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 p-0.5 mx-auto shadow-xl shadow-purple-900/50">
            <div className="w-full h-full bg-[#160d2b] rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {activeView === 'login'
              ? 'Masuk ke Ruang Aplikasiku'
              : activeView === 'register'
              ? 'Formulir Pendaftaran Akun'
              : 'Pendaftaran Berhasil!'}
          </h2>
          <p className="text-xs text-purple-300/80">
            LMS & CBT Olimpiade Sains • SMAN 1 PARDASUKA
          </p>
        </div>

        {/* Navigation Switcher: Masuk vs Daftar (Hanya tampil saat bukan di layar sukses) */}
        {activeView !== 'registered-success' && (
          <div className="flex bg-[#120722] p-1 rounded-xl border border-purple-900/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveView('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'login'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: FITUR MASUK (LOGIN) - HANYA USER DAN PASSWORD     */}
        {/* ======================================================== */}
        {activeView === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleSimpleLogin} className="space-y-3.5 text-xs">
              {/* Field 1: User */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  User (NISN / NIP / Username / Email):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Masukkan User / NISN / NIP / Username..."
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-purple-200">Password:</label>
                  <span className="text-[10px] text-purple-400">Tersandi Aman</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan Password akun Anda..."
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <span>Masuk ke Ruang Aplikasiku</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Accounts Drawer Toggle */}
            <div className="pt-2 border-t border-purple-900/40 space-y-2">
              <button
                type="button"
                onClick={() => setShowDemoList(!showDemoList)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#130726] border border-purple-900/60 text-purple-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Akun Demo Cepat (1-Klik Masuk)
                </span>
                {showDemoList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDemoList && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 animate-fadeIn">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleQuickSelect(user)}
                      className="p-2.5 rounded-xl bg-[#170c2d] hover:bg-[#231245] border border-purple-800/40 hover:border-purple-500/80 flex items-center justify-between transition-all cursor-pointer group shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-lg object-cover border border-purple-600/60 shrink-0"
                        />
                        <div className="text-left">
                          <h4 className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-[170px]">
                            {user.name}
                          </h4>
                          <span className="text-[10px] text-purple-300/70 block">
                            User: <code>{user.username || user.nisnOrNip}</code>
                            {user.subject && ` • ${user.subject}`}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          user.role === 'admin'
                            ? 'bg-rose-950 text-rose-300 border-rose-600/60'
                            : user.role === 'teacher'
                            ? 'bg-amber-950 text-amber-300 border-amber-600/60'
                            : 'bg-purple-950 text-purple-300 border-purple-700/60'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Guru' : 'Siswa'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer switcher to register */}
            <div className="text-center pt-2 text-xs text-purple-300/80">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveView('register');
                  setErrorMsg(null);
                }}
                className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: FITUR DAFTAR (REGISTRASI AKUN BARU LENGKAP)      */}
        {/* ======================================================== */}
        {activeView === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            {/* 1. Nama Lengkap */}
            <div>
              <label className="block font-semibold text-purple-200 mb-1">
                Nama Lengkap:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Rahmat Hidayat, S.Pd. atau Jayabaya"
                  className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Sebagai: Admin, Guru atau Siswa */}
            <div>
              <label className="block font-semibold text-purple-200 mb-1">
                Sebagai (Peran Pengguna):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                    regRole === 'student'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-[1.02]'
                      : 'bg-[#150a29] text-purple-300 border-purple-900/60 hover:bg-[#1e0e38]'
                  }`}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('teacher')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                    regRole === 'teacher'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-[#150a29] text-purple-300 border-purple-900/60 hover:bg-[#1e0e38]'
                  }`}
                >
                  Guru Pembina
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('admin')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                    regRole === 'admin'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md scale-[1.02]'
                      : 'bg-[#150a29] text-purple-300 border-purple-900/60 hover:bg-[#1e0e38]'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* 3. Pilih Mapel (Wajib untuk Guru & Siswa, Admin otomatis master) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Pilih Mapel OSN:
                </label>
                {regRole === 'admin' ? (
                  <span className="text-[10px] text-rose-300 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    Semua 9 Bidang (Admin Master)
                  </span>
                ) : (
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                    Pilihan: {regSubject}
                  </span>
                )}
              </div>

              {regRole !== 'admin' ? (
                <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {OSN_SUBJECT_LIST.map((item) => (
                    <button
                      type="button"
                      key={item.subject}
                      onClick={() => setRegSubject(item.subject)}
                      className={`py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        regSubject === item.subject
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow'
                          : 'bg-[#150a29] text-purple-300/80 border-purple-900/50 hover:bg-[#1e0e38]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="truncate">{item.subject}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#130726] border border-rose-900/60 text-[11px] text-purple-300/80">
                  Akun Admin otomatis memiliki hak akses master ke seluruh 9 bidang mapel olimpiade sains.
                </div>
              )}
            </div>

            {/* 4. Alamat Email & 5. No Whatsapp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Alamat Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  No WhatsApp:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 6. User (Username / NISN / NIP) & 7. Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  User (Untuk Login):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Username / NISN / NIP"
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Buat password login"
                    className="w-full bg-[#110721] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] pt-2"
            >
              <span>Daftar Akun Baru Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer switcher to login */}
            <div className="text-center pt-1 text-xs text-purple-300/80">
              Sudah memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveView('login');
                  setErrorMsg(null);
                }}
                className="font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Masuk di Sini
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SETELAH MENGISI FORMULIR DAFTAR - DOWNLOAD APP  */}
        {/* ======================================================== */}
        {activeView === 'registered-success' && registeredUser && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#140827] border border-emerald-500/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Akun Anda Berhasil Didaftarkan!</h3>
                  <p className="text-[11px] text-emerald-300/90">
                    Selamat datang, <strong>{registeredUser.name}</strong>. Akun telah aktif di sistem.
                  </p>
                </div>
              </div>

              {/* Mini Akun Card */}
              <div className="p-3 rounded-xl bg-[#1a0e33] border border-purple-800/60 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">User Login:</span>
                  <span className="font-mono font-bold text-amber-300">{registeredUser.username || registeredUser.nisnOrNip}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Peran:</span>
                  <span className="font-bold text-white capitalize">{registeredUser.role === 'admin' ? 'Admin' : registeredUser.role === 'teacher' ? 'Guru Pembina' : 'Siswa'}</span>
                </div>
                {registeredUser.subject && (
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Bidang Mapel:</span>
                    <span className="font-bold text-cyan-300">{registeredUser.subject}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">WhatsApp:</span>
                  <span className="font-mono text-purple-200">{registeredUser.whatsapp}</span>
                </div>
              </div>
            </div>

            {/* Opsi 1: Pasang / Download Aplikasi Langsung ke HP / Laptop */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Download &amp; Pasang Aplikasi ke Perangkat:
              </span>

              <button
                type="button"
                onClick={handleTriggerInstall}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>
                  {isInstalled
                    ? 'Aplikasi Sudah Terpasang (Buka di Homescreen)'
                    : 'Download / Pasang Aplikasi ke Layar Utama'}
                </span>
              </button>

              {/* Panduan Install jika browser belum memunculkan dialog otomatis */}
              {showInstallGuide && (
                <div className="p-3.5 rounded-xl bg-[#120721] border border-cyan-800/60 text-[11px] text-purple-200 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    Cara Download / Pasang Cepat di Browser Anda:
                  </div>

                  {isIOS ? (
                    <div className="space-y-1 text-purple-300/90 pl-1">
                      <p>1. Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="w-3 h-3 inline mx-1 text-blue-400" /> di bilah bawah browser Safari.</p>
                      <p>2. Gulir ke bawah lalu pilih menu <strong>'Tambahkan ke Layar Utama' (Add to Home Screen ⊞)</strong>.</p>
                      <p>3. Ketuk 'Tambah' di pojok kanan atas. Ikon aplikasi langsung muncul di layar iPhone/iPad Anda.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-purple-300/90 pl-1">
                      <p>• <strong>Di HP Android (Chrome):</strong> Ketuk menu titik tiga (<strong>⋮</strong>) di pojok kanan atas &gt; pilih <strong>'Tambahkan ke Layar Utama'</strong> atau <strong>'Pasang Aplikasi'</strong>.</p>
                      <p>• <strong>Di Laptop / PC (Chrome / Edge):</strong> Klik ikon <strong>Pasang / Install (⤓)</strong> di ujung bilah alamat URL (address bar).</p>
                    </div>
                  )}
                </div>
              )}

              {/* Opsi 2: Unduh Kartu Bukti Registrasi PDF */}
              <button
                type="button"
                onClick={() => downloadRegistrationCard(registeredUser)}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh Kartu Bukti Pendaftaran (PDF / Cetak)</span>
              </button>

              {/* Opsi 3: Masuk ke Ruang Aplikasi */}
              <button
                type="button"
                onClick={() => onLogin(registeredUser)}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Lanjut Masuk ke Ruang Aplikasiku</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Device Security Footnote */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/30 text-[10px] text-purple-400/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>1-Device Browser Token:</span>
          </div>
          <span className="font-mono text-emerald-400/90 font-bold bg-[#100720] px-1.5 py-0.5 rounded border border-purple-900/60">
            {deviceToken.substring(0, 10)}...
          </span>
        </div>
      </div>
    </div>
  );
};
