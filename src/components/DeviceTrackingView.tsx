import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  RotateCcw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Users,
  Search,
  KeyRound,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { DeviceSession, UserProfile } from '../types';
import { forceGenerateNewDeviceToken } from '../services/deviceSecurity';

interface DeviceTrackingViewProps {
  currentUser: UserProfile;
  currentDeviceToken: string;
  onRefreshDeviceToken: () => void;
}

export const DeviceTrackingView: React.FC<DeviceTrackingViewProps> = ({
  currentUser,
  currentDeviceToken,
  onRefreshDeviceToken,
}) => {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentToReset, setSelectedStudentToReset] = useState<DeviceSession | null>(null);
  const [resetReason, setResetReason] = useState<string>('Siswa ganti perangkat di Lab Komputer');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Simulation state: Test 2nd device conflict
  const [simConflictResult, setSimConflictResult] = useState<{
    allowed: boolean;
    conflict: boolean;
    message: string;
  } | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/device-sessions');
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleResetToken = async () => {
    if (!selectedStudentToReset) return;

    try {
      const res = await fetch('/api/device-sessions/reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentToReset.studentId,
          reason: resetReason,
          adminName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccessMessage(data.message);
        setSelectedStudentToReset(null);
        fetchSessions();
        setTimeout(() => setResetSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateConflictLogin = async () => {
    setSimConflictResult(null);
    try {
      // Intentionally send a fake mismatched device token to test lock policy
      const fakeToken = `DEV-FAKE-CONFLICT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const res = await fetch('/api/device-sessions/verify-or-bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'SISWA-001', // Jayabaya Ibrahim who is already bound to DEV-CHROME-WIN-8941a
          studentName: 'Jayabaya Ibrahim (XI MIPA 1)',
          deviceToken: fakeToken,
          deviceName: 'Firefox 125 on Xiaomi Redmi Note (Simulasi HP Asing)',
        }),
      });

      const data = await res.json();
      setSimConflictResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleForceGenerateNewLocalToken = () => {
    forceGenerateNewDeviceToken();
    onRefreshDeviceToken();
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceToken.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Tracking & Manajemen Login 1-Device
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Sistem penguncian perangkat otomatis (Single Device Policy) untuk mencegah kecurangan ujian CBT SMAN 1 Pardasuka.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {resetSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* Security Architecture Explainer & Current Device Pill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1b0d36] to-[#110722] border border-purple-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Bagaimana Kebijakan 1-Device Bekerja di SMAN 1 Pardasuka?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#150a2b] p-3 rounded-xl border border-purple-900/50 space-y-1">
              <span className="font-bold text-amber-300 block">1. Binding Otomatis</span>
              <p className="text-purple-300/80 leading-relaxed">
                Saat siswa pertama kali login untuk ujian, fingerprint hardware browser dikunci ke akun NISN.
              </p>
            </div>
            <div className="bg-[#150a2b] p-3 rounded-xl border border-purple-900/50 space-y-1">
              <span className="font-bold text-rose-300 block">2. Blokir Multi-Login</span>
              <p className="text-purple-300/80 leading-relaxed">
                Jika akun dibuka dari HP/laptop lain secara bersamaan, login kedua langsung ditolak dengan peringatan konflik.
              </p>
            </div>
            <div className="bg-[#150a2b] p-3 rounded-xl border border-purple-900/50 space-y-1">
              <span className="font-bold text-emerald-300 block">3. Otoritas Reset Proktor</span>
              <p className="text-purple-300/80 leading-relaxed">
                Hanya Guru Pembina / Proktor yang memiliki wewenang me-reset token jika terjadi kendala teknis sah.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Device Status Card */}
        <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
              Perangkat Browser Anda Saat Ini:
            </span>
            <div className="font-mono text-sm font-black text-emerald-300 bg-purple-950/80 p-2.5 rounded-xl border border-purple-700/60 truncate">
              {currentDeviceToken}
            </div>
            <p className="text-[11px] text-purple-300/70 mt-2">
              Status: <strong className="text-emerald-400">Terverifikasi 1-Device</strong> (IP Lokal Lab SMAN 1 Pardasuka)
            </p>
          </div>

          <button
            onClick={handleForceGenerateNewLocalToken}
            className="w-full py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Regenerasi Token Perangkat Lokal
          </button>
        </div>
      </div>

      {/* Simulator: Test Conflict Login (Interactive Demonstration) */}
      <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Simulasi Uji Integritas: Coba Login dari Perangkat Kedua
            </h3>
            <p className="text-xs text-purple-300/70">
              Uji coba sistem penolakan login jika akun siswa "Jayabaya Ibrahim" dibuka di perangkat HP lain.
            </p>
          </div>

          <button
            onClick={handleSimulateConflictLogin}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow cursor-pointer shrink-0"
          >
            Jalankan Uji Coba Penolakan
          </button>
        </div>

        {simConflictResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
              simConflictResult.conflict
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {simConflictResult.conflict ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>PROTEKSI 1-DEVICE BEKERJA SEMPURNA: LOGIN PERANGKAT KEDUA DITOLAK!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Login Diterima</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{simConflictResult.message}</p>
          </div>
        )}
      </div>

      {/* Active Device Sessions Table */}
      <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Daftar Sesi Perangkat Siswa Terkunci ({sessions.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa, token, IP..."
              className="w-full bg-[#120924] border border-purple-700/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-400/60 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-purple-300">
            Memuat sesi perangkat siswa...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#120924] text-purple-300 font-bold border-b border-purple-900/60">
                <tr>
                  <th className="py-3 px-3">Siswa & ID</th>
                  <th className="py-3 px-3">Device Token</th>
                  <th className="py-3 px-3">Tipe Perangkat</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Waktu Login</th>
                  <th className="py-3 px-3 text-right">Aksi Proktor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40 text-purple-200">
                {filteredSessions.map((session) => (
                  <tr key={session.studentId} className="hover:bg-[#1f123c]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{session.studentName}</div>
                      <span className="text-[10px] text-purple-400 font-mono">{session.studentId}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-amber-300">
                      {session.deviceToken}
                    </td>
                    <td className="py-3 px-3 text-purple-300 truncate max-w-[180px]">
                      {session.deviceName}
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-400">{session.ipAddress}</td>
                    <td className="py-3 px-3 text-purple-300/80">
                      {new Date(session.loginTime).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedStudentToReset(session)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/50 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Token</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {selectedStudentToReset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0d36] border border-rose-600/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              Reset Token Perangkat Siswa
            </h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Anda akan mereset token perangkat untuk siswa{' '}
              <strong className="text-white">{selectedStudentToReset.studentName}</strong> (
              {selectedStudentToReset.studentId}). Tindakan ini membatalkan ikatan ke perangkat lama
              sehingga siswa dapat login pada perangkat baru.
            </p>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">
                Alasan Reset Token (Dicatat dalam Log):
              </label>
              <select
                aria-label="Pilih Alasan Reset Token"
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Siswa ganti perangkat di Lab Komputer">
                  Siswa ganti PC di Lab Komputer (Kendala Teknis PC)
                </option>
                <option value="Browser tertutup paksa atau cache terhapus">
                  Browser tertutup paksa / Cache terhapus
                </option>
                <option value="Perpindahan sesi ujian susulan">Perpindahan sesi ujian susulan</option>
                <option value="Izin resmi dari Koordinator Pembina OSN">
                  Izin resmi dari Koordinator Pembina OSN
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudentToReset(null)}
                className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetToken}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Konfirmasi Reset Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
