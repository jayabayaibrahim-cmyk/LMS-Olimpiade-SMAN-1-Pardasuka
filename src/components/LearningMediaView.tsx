import React, { useState, useMemo } from 'react';
import {
  Youtube,
  Play,
  Plus,
  Search,
  Filter,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Lightbulb,
  Video,
} from 'lucide-react';
import { LearningMedia, OsnSubject, CompetitionLevel, UserProfile } from '../types';

interface LearningMediaViewProps {
  mediaList: LearningMedia[];
  currentUser: UserProfile;
  onAddMedia: (media: LearningMedia) => void;
  onDeleteMedia?: (mediaId: string) => void;
  initialSubject?: OsnSubject;
}

const OSN_SUBJECTS: OsnSubject[] = [
  'Matematika',
  'Fisika',
  'Biologi',
  'Kimia',
  'Astronomi',
  'Kebumian',
  'Informatika',
  'Ekonomi',
  'Geografi',
];

const COMPETITION_LEVELS: CompetitionLevel[] = [
  'Kabupaten (OSN-K)',
  'Provinsi (OSN-P)',
  'Nasional (OSN-N)',
];

// Helper to extract YouTube video ID from various link formats
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

export const LearningMediaView: React.FC<LearningMediaViewProps> = ({
  mediaList,
  currentUser,
  onAddMedia,
  onDeleteMedia,
  initialSubject,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || (currentUser.subject ? currentUser.subject : 'Semua')
  );
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Video Player Modal
  const [activePlayingMedia, setActivePlayingMedia] = useState<LearningMedia | null>(null);

  // Add Media Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Manual Form States (Input Video YouTube oleh Guru)
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualSubject, setManualSubject] = useState<OsnSubject>(
    currentUser.subject || 'Matematika'
  );
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualUrl, setManualUrl] = useState<string>('');
  const [manualChannel, setManualChannel] = useState<string>('');
  const [manualDuration, setManualDuration] = useState<string>('20:00');
  const [manualLevel, setManualLevel] = useState<CompetitionLevel>('Kabupaten (OSN-K)');
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualKeyPoints, setManualKeyPoints] = useState<string>('');

  // Filtered Media
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchSub = selectedSubject === 'Semua' || item.subject === selectedSubject;
      const matchLevel = selectedLevel === 'Semua' || item.level === selectedLevel;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        (item.channelOrCreator && item.channelOrCreator.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchSub && matchLevel && matchSearch;
    });
  }, [mediaList, selectedSubject, selectedLevel, searchQuery]);

  // Handle Manual Save by Teacher
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const yId = extractYouTubeId(manualUrl);
    if (!manualTitle.trim() || !manualUrl.trim() || !yId) {
      alert('Mohon masukkan judul dan link YouTube yang valid (format: https://www.youtube.com/watch?v=... atau https://youtu.be/...)');
      return;
    }

    const keyPointsArray = manualKeyPoints
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const newMedia: LearningMedia = {
      id: `MEDIA-${Date.now()}`,
      title: manualTitle.trim(),
      subject: manualSubject,
      topic: manualTopic.trim() || 'Materi Silabus OSN',
      youtubeUrl: manualUrl.trim(),
      youtubeId: yId,
      thumbnailUrl: `https://img.youtube.com/vi/${yId}/hqdefault.jpg`,
      channelOrCreator: manualChannel.trim() || currentUser.name || 'Guru Pembina OSN',
      duration: manualDuration.trim() || '20:00',
      level: manualLevel,
      description: manualDescription.trim() || 'Video pembahasan konsep dan latihan materi olimpiade sains.',
      keyPoints: keyPointsArray.length > 0 ? keyPointsArray : ['Konsep esensial dan pembahasan soal tipe olimpiade'],
      addedBy: currentUser.name || 'Guru Pembina',
      aiEngine: 'manual',
      sourceType: 'youtube_manual',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddMedia(newMedia);

    // Reset manual form
    setManualTitle('');
    setManualUrl('');
    setManualTopic('');
    setManualChannel('');
    setManualDuration('20:00');
    setManualDescription('');
    setManualKeyPoints('');
    setIsAddModalOpen(false);
  };

  const canManage = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const previewManualYId = extractYouTubeId(manualUrl);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1b0d36] via-[#241247] to-[#120a22] border border-purple-800/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold tracking-wide">
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                MEDIA PEMBELAJARAN DIGITAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 text-[11px] font-semibold">
                SMAN 1 PARDASUKA
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Video & Media Pembelajaran OSN</span>
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Koleksi video YouTube pembelajaran olimpiade sains terkurasi sesuai mapel OSN untuk memperdalam penguasaan konsep teori dan pembahasan soal.
            </p>
          </div>

          {/* Action Button for Teacher / Admin */}
          {canManage && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-purple-950/60 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ Tambah Video Pembelajaran</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#170e2c]/80 border border-purple-900/40 shadow-lg space-y-4">
        {/* Subject Chips */}
        <div>
          <label className="text-[11px] font-bold text-purple-300/80 uppercase tracking-wider block mb-2">
            Pilih Bidang Mata Pelajaran:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedSubject('Semua')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubject === 'Semua'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                  : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40 hover:text-white border border-purple-800/40'
              }`}
            >
              Semua Bidang ({mediaList.length})
            </button>
            {OSN_SUBJECTS.map((sub) => {
              const count = mediaList.filter((m) => m.subject === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedSubject === sub
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                      : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/40 hover:text-white border border-purple-800/40'
                  }`}
                >
                  <span>{sub}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 opacity-80">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Level Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-purple-900/30">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, judul video, topik, atau channel YouTube..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300/70 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Tingkat:
            </span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="Semua">Semua Tingkat</option>
              {COMPETITION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid Cards */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#170e2c]/60 border border-purple-900/40 text-center space-y-4">
          <Video className="w-12 h-12 text-purple-400/50 mx-auto" />
          <h3 className="text-base font-bold text-white">Belum Ada Media Pembelajaran</h3>
          <p className="text-xs text-purple-300/70 max-w-md mx-auto">
            Tidak ditemukan video untuk filter bidang &quot;{selectedSubject}&quot; atau kata kunci pencarian.
            {canManage && ' Anda dapat menggunakan tombol "+ Tambah Video Pembelajaran" di atas untuk menambahkan link video YouTube.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((media) => {
            const yId = media.youtubeId || extractYouTubeId(media.youtubeUrl);
            const thumbUrl =
              media.thumbnailUrl ||
              (yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : '');

            return (
              <div
                key={media.id}
                className="group rounded-2xl bg-[#180e2f]/90 border border-purple-800/40 hover:border-purple-600/70 shadow-xl hover:shadow-2xl hover:shadow-purple-950/50 transition-all flex flex-col overflow-hidden"
              >
                {/* Thumbnail Header with Play Button */}
                <div
                  onClick={() => setActivePlayingMedia(media)}
                  className="relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer group/thumb"
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-950">
                      <Youtube className="w-12 h-12 text-red-500 opacity-60" />
                    </div>
                  )}

                  {/* Dark Overlay with Play Icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-80 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-red-600 group-hover/thumb:bg-red-500 text-white flex items-center justify-center shadow-xl group-hover/thumb:scale-110 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {media.duration && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{media.duration}</span>
                    </div>
                  )}

                  {/* Subject Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-200 text-[10px] font-bold border border-purple-600/60 shadow flex items-center gap-1">
                    <span>{media.subject}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-purple-300/80 truncate">
                        {media.channelOrCreator || 'Edukasi OSN'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/40 shrink-0">
                        {media.level}
                      </span>
                    </div>

                    <h3
                      onClick={() => setActivePlayingMedia(media)}
                      className="text-sm font-bold text-white hover:text-purple-200 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {media.title}
                    </h3>

                    <p className="text-xs text-purple-300/80 line-clamp-2 leading-relaxed">
                      {media.description}
                    </p>

                    {/* Key points preview */}
                    {media.keyPoints && media.keyPoints.length > 0 && (
                      <div className="pt-2 border-t border-purple-900/40 space-y-1">
                        <span className="text-[10px] font-bold text-amber-300/90 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          Intisari Pembahasan:
                        </span>
                        <ul className="text-[11px] text-purple-200/80 space-y-0.5 list-disc list-inside line-clamp-2 pl-0.5">
                          {media.keyPoints.slice(0, 2).map((pt, idx) => (
                            <li key={idx} className="truncate">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                        <Youtube className="w-3 h-3 text-red-400" />
                        <span>{media.addedBy || 'Guru Pembina'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canManage && onDeleteMedia && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus video pembelajaran "${media.title}"?`)) {
                              onDeleteMedia(media.id);
                            }
                          }}
                          title="Hapus Media"
                          className="p-1.5 rounded-lg text-purple-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <a
                        href={media.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka langsung di YouTube"
                        className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => setActivePlayingMedia(media)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Tonton</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: YOUTUBE VIDEO PLAYER MODAL */}
      {activePlayingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl rounded-3xl bg-[#140b27] border border-purple-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/90 via-purple-900/80 to-[#140b27] border-b border-purple-800/40 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600/90 text-white flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    Pemutar YouTube SMAN 1 Pardasuka
                  </span>
                  <span className="text-xs text-purple-300 font-semibold">
                    {activePlayingMedia.subject} • {activePlayingMedia.level}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                  {activePlayingMedia.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePlayingMedia(null)}
                className="w-9 h-9 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Iframe Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activePlayingMedia.youtubeId || extractYouTubeId(activePlayingMedia.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1`}
                title={activePlayingMedia.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Details & Pedagogical Notes */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-purple-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
                <div>
                  <span className="text-xs text-purple-400 block font-medium">Pemateri / Kanal YouTube:</span>
                  <span className="font-bold text-white text-sm">
                    {activePlayingMedia.channelOrCreator || 'Tim Pembina OSN'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={activePlayingMedia.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/60 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                    <span>Buka di Aplikasi YouTube</span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Deskripsi & Konsep Materi:
                </h4>
                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                  {activePlayingMedia.description}
                </p>
              </div>

              {activePlayingMedia.keyPoints && activePlayingMedia.keyPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Intisari & Poin Kunci Pembahasan:
                  </h4>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-purple-100">
                    {activePlayingMedia.keyPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT VIDEO PEMBELAJARAN (GURU & ADMIN) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-[#150b2b] border border-purple-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-purple-900 to-[#150b2b] border-b border-purple-800/50 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-600/90 text-white flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5" />
                    INPUT MEDIA PEMBELAJARAN
                  </span>
                  <span className="text-xs text-purple-300 font-semibold">
                    Panel Guru & Pembina
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Tambah Video Pembelajaran YouTube
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    Judul Video Pembelajaran: *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Contoh: Trik Menyelesaikan Persamaan Modulo OSN-K"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    Link URL Video YouTube: *
                  </label>
                  <input
                    type="url"
                    required
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  {manualUrl && previewManualYId ? (
                    <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50">
                      <img
                        src={`https://img.youtube.com/vi/${previewManualYId}/hqdefault.jpg`}
                        alt="Preview Thumbnail"
                        className="w-16 aspect-video object-cover rounded-md border border-emerald-600/50"
                      />
                      <div className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Link YouTube Valid (ID: <strong>{previewManualYId}</strong>)</span>
                      </div>
                    </div>
                  ) : manualUrl ? (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pastikan format link YouTube valid (contoh: https://www.youtube.com/watch?v=...)</span>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">
                      Bidang Mata Pelajaran:
                    </label>
                    <select
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value as OsnSubject)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {OSN_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">
                      Tingkat Kompetisi:
                    </label>
                    <select
                      value={manualLevel}
                      onChange={(e) => setManualLevel(e.target.value as CompetitionLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {COMPETITION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">
                      Topik / Materi:
                    </label>
                    <input
                      type="text"
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      placeholder="Contoh: Aljabar Linier & Modulo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">
                      Nama Pemateri / Channel YouTube:
                    </label>
                    <input
                      type="text"
                      value={manualChannel}
                      onChange={(e) => setManualChannel(e.target.value)}
                      placeholder="Contoh: Guru Pembina OSN SMAN 1 Pardasuka"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-purple-300 block mb-1">
                      Estimasi Durasi Video:
                    </label>
                    <input
                      type="text"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(e.target.value)}
                      placeholder="Contoh: 24:15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    Deskripsi Ringkas Video:
                  </label>
                  <textarea
                    rows={2}
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Uraikan konsep materi, eksperimen, atau trik yang dibahas dalam video..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-300 block mb-1">
                    Poin Intisari Materi (Pisahkan dengan baris baru):
                  </label>
                  <textarea
                    rows={3}
                    value={manualKeyPoints}
                    onChange={(e) => setManualKeyPoints(e.target.value)}
                    placeholder="Poin 1: Penurunan rumus kongruensi&#10;Poin 2: Trik teorema Fermat&#10;Poin 3: Contoh soal tipe OSN-K"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/40">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    Simpan Video Pembelajaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
