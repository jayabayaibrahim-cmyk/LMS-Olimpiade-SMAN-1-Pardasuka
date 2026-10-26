import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Send,
  Download,
  AlertCircle,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  generateGoogleAppsScriptCode,
  exportResultsToCsv,
  exportQuestionsToCsv,
} from '../services/gasExport';
import { ExamResult, Question } from '../types';

interface GasIntegrationViewProps {
  examResults: ExamResult[];
  questions: Question[];
}

export const GasIntegrationView: React.FC<GasIntegrationViewProps> = ({
  examResults,
  questions,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    'https://script.google.com/macros/s/AKfycbz_SMAN1Pardasuka_Example_GAS_Webhook/exec'
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const gasCode = generateGoogleAppsScriptCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setTestStatus(null);

    // Simulate sending payload to Google Apps Script
    setTimeout(() => {
      setIsTesting(false);
      setTestStatus(
        'Simulasi Berhasil: Payload JSON berformat doPost(e) siap diteruskan ke Google Spreadsheet SMAN 1 Pardasuka! (Respons: 200 OK - rowAdded: 1)'
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            Integrasi & Ekspor Google Apps Script (GAS)
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Otomatisasi pengiriman nilai ujian CBT dan Bank Soal langsung ke Google Spreadsheet panitia SMAN 1 Pardasuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportResultsToCsv(examResults)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="sm:hidden">CSV Nilai</span>
            <span className="hidden sm:inline">Download CSV Rekap Nilai</span>
          </button>
          <button
            onClick={() => exportQuestionsToCsv(questions)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="sm:hidden">CSV Soal</span>
            <span className="hidden sm:inline">Download CSV Bank Soal</span>
          </button>
        </div>
      </div>

      {/* Step by step installation guide */}
      <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Panduan Langkah Pasang Script di Google Spreadsheet Sekolah
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#130926] p-4 rounded-xl border border-purple-900/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white">Buat Spreadsheet</h4>
            <p className="text-purple-300/80 leading-relaxed">
              Buka Google Sheets baru dengan judul "Rekap Ujian OSN SMAN 1 Pardasuka".
            </p>
          </div>

          <div className="bg-[#130926] p-4 rounded-xl border border-purple-900/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white">Buka Apps Script</h4>
            <p className="text-purple-300/80 leading-relaxed">
              Klik menu <strong>Ekstensi</strong> di bilah atas, lalu pilih <strong>Apps Script</strong>.
            </p>
          </div>

          <div className="bg-[#130926] p-4 rounded-xl border border-purple-900/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Paste Kode Script</h4>
            <p className="text-purple-300/80 leading-relaxed">
              Salin kode <code>Code.gs</code> di bawah ini, hapus kode lama, lalu tempelkan.
            </p>
          </div>

          <div className="bg-[#130926] p-4 rounded-xl border border-purple-900/50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <h4 className="font-bold text-white">Deploy Web App</h4>
            <p className="text-purple-300/80 leading-relaxed">
              Klik <strong>Terapkan</strong> &gt; <strong>Aplikasi Web</strong> (Akses: <em>Siapa Saja</em>), salin URL-nya.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Configuration & Tester */}
      <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          Konfigurasi Webhook URL Google Apps Script
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 bg-[#120924] border border-purple-700/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            onClick={handleTestWebhook}
            disabled={isTesting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isTesting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Tes Kirim Webhook (doPost)</span>
          </button>
        </div>

        {testStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Kode Script Siap Pakai: <code>Code.gs</code>
            </h3>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="bg-[#0f071c] p-4 rounded-xl border border-purple-900/60 font-mono text-[11px] text-purple-200 overflow-x-auto max-h-96 leading-relaxed select-all">
            {gasCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
