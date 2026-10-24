import React from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#180e2f] border border-purple-700/60 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 mx-auto shadow-lg shadow-purple-900/50">
            <div className="w-full h-full bg-[#150a29] rounded-[14px] flex items-center justify-center">
              <Download className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">Download &amp; Pasang Aplikasi</h3>
          <p className="text-xs text-purple-300/80">
            Akses LMS &amp; CBT SMAN 1 Pardasuka seperti aplikasi native tanpa instalasi Play Store yang rumit.
          </p>
        </div>

        {/* Action Button: Auto Trigger if Supported */}
        {isInstallable && !isInstalled && (
          <button
            onClick={async () => {
              const ok = await install();
              if (ok) onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Pasang Sekarang (1-Klik)</span>
          </button>
        )}

        {isInstalled && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Aplikasi sudah terpasang di perangkat Anda dalam mode Standalone.</span>
          </div>
        )}

        {/* Step-by-step instructions for devices */}
        <div className="space-y-3 pt-1">
          {/* Android */}
          <div className="p-3 rounded-xl bg-[#120721] border border-purple-800/50 space-y-1.5 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              Untuk Pengguna HP Android (Google Chrome):
            </div>
            <ol className="list-decimal list-inside text-purple-300/90 text-[11px] space-y-1">
              <li>Buka browser Google Chrome di HP Anda.</li>
              <li>Ketuk ikon <strong>Titik Tiga (⋮)</strong> di sudut kanan atas.</li>
              <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Pasang Aplikasi"</strong>.</li>
              <li>Ikon aplikasi langsung muncul di menu HP Anda.</li>
            </ol>
          </div>

          {/* iPhone / iPad */}
          <div className="p-3 rounded-xl bg-[#120721] border border-purple-800/50 space-y-1.5 text-xs">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Untuk Pengguna iPhone / iPad (Safari):
            </div>
            <ol className="list-decimal list-inside text-purple-300/90 text-[11px] space-y-1">
              <li>Buka website ini melalui browser <strong>Safari</strong>.</li>
              <li>Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="w-3 h-3 inline mx-0.5 text-blue-400" /> di bilah navigasi bawah.</li>
              <li>Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen ⊞)</strong>.</li>
              <li>Ketuk <strong>Tambah</strong> di pojok kanan atas.</li>
            </ol>
          </div>

          {/* PC / Laptop */}
          <div className="p-3 rounded-xl bg-[#120721] border border-purple-800/50 space-y-1.5 text-xs">
            <div className="font-bold text-purple-300 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-purple-400" />
              Untuk Laptop / PC (Chrome / Edge):
            </div>
            <p className="text-purple-300/90 text-[11px]">
              Klik ikon <strong>Pasang / Install (⤓)</strong> yang ada di sebelah kanan bilah alamat URL (address bar) browser Anda.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-purple-200 text-xs font-semibold cursor-pointer transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
