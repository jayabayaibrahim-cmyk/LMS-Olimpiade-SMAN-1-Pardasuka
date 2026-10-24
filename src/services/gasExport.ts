import { Question, ExamResult } from '../types';

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * =====================================================================
 * RUANG APLIKASIKU - SMAN 1 PARDASUKA
 * Google Apps Script (GAS) Webhook & Sheet Sync Engine
 * Versi: 2.4 (Olimpiade Sains Nasional Edition)
 * =====================================================================
 * CARA MEMASANG:
 * 1. Buka Google Sheets Anda (e.g. "Rekap Ujian OSN SMAN 1 Pardasuka").
 * 2. Klik menu 'Ekstensi' > 'Apps Script'.
 * 3. Hapus kode bawaan, lalu salin dan tempel (Paste) seluruh kode ini.
 * 4. Klik 'Terapkan' (Deploy) > 'Penerapan Baru' (New Deployment).
 * 5. Pilih jenis: 'Aplikasi Web' (Web App).
 * 6. Set "Jalankan sebagai": 'Saya' (Me).
 * 7. Set "Siapa yang memiliki akses": 'Siapa saja' (Anyone).
 * 8. Klik 'Terapkan' dan salin Webhook URL ke aplikasi Ruang Aplikasiku.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action || 'submit_exam_result';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'submit_exam_result') {
      var sheet = ss.getSheetByName('Hasil_Ujian_CBT');
      if (!sheet) {
        sheet = ss.insertSheet('Hasil_Ujian_CBT');
        // Buat Baris Header
        sheet.appendRow([
          'Timestamp',
          'NISN',
          'Nama Siswa',
          'Mata Pelajaran OSN',
          'Judul Ujian',
          'Skor Akhir',
          'Persentase',
          'Predikat',
          'Jumlah Benar',
          'Jumlah Salah',
          'Kosong',
          'Pelanggaran Tab Switch',
          'Device Token Terkunci'
        ]);
        sheet.getRange("A1:M1").setFontWeight("bold").setBackground("#9333ea").setFontColor("#ffffff");
      }

      var result = payload.data;
      sheet.appendRow([
        new Date(),
        result.nisn || '-',
        result.studentName || '-',
        result.subject || '-',
        result.examTitle || '-',
        result.score || 0,
        (result.percentageScore || 0) + '%',
        result.predicate || '-',
        result.correctCount || 0,
        result.wrongCount || 0,
        result.unansweredCount || 0,
        result.tabSwitchViolations || 0,
        result.deviceToken || 'VERIFIED-1-DEVICE'
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Hasil ujian siswa SMAN 1 Pardasuka berhasil tersimpan di Google Sheets!',
        rowAdded: sheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'sync_question_bank') {
      var qSheet = ss.getSheetByName('Bank_Soal_Bloom_SOLO');
      if (!qSheet) {
        qSheet = ss.insertSheet('Bank_Soal_Bloom_SOLO');
        qSheet.appendRow([
          'ID Soal',
          'Bidang OSN',
          'Topik',
          'Taksonomi Bloom',
          'Taksonomi SOLO',
          'Tingkat Kesulitan',
          'Teks Soal',
          'Kunci Jawaban',
          'Pembahasan Ilmiah'
        ]);
        qSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#2563eb").setFontColor("#ffffff");
      }

      var questions = payload.questions || [];
      for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        qSheet.appendRow([
          q.id,
          q.subject,
          q.topic,
          q.bloomLevel,
          q.soloLevel,
          q.difficulty,
          q.questionText,
          ['A', 'B', 'C', 'D', 'E'][q.correctAnswerIndex] || 'A',
          q.explanation
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: questions.length + ' butir soal berhasil disinkronisasi ke Bank Soal Google Sheets!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ignored',
      message: 'Aksi tidak dikenal'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    school: 'SMAN 1 PARDASUKA - Pringsewu, Lampung',
    system: 'Ruang Aplikasiku LMS & CBT API Webhook',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
}

export function exportResultsToCsv(results: ExamResult[]): void {
  const headers = [
    'NISN',
    'Nama Siswa',
    'Bidang OSN',
    'Judul Ujian',
    'Pengerjaan Ke-',
    'Tanggal Ujian',
    'Skor',
    'Persentase',
    'Predikat',
    'Benar',
    'Salah',
    'Kosong',
    'Pelanggaran Tab',
  ];

  const rows = results.map((r) => [
    `"${r.nisn}"`,
    `"${r.studentName}"`,
    `"${r.subject}"`,
    `"${r.examTitle}"`,
    `"Ke-${r.attemptNumber || 1}"`,
    `"${new Date(r.submittedAt).toLocaleDateString('id-ID')}"`,
    r.score,
    `"${r.percentageScore}%"`,
    `"${r.predicate}"`,
    r.correctCount,
    r.wrongCount,
    r.unansweredCount,
    r.tabSwitchViolations,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadFile(csvContent, `Rekap_Nilai_CBT_SMAN1Pardasuka_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportQuestionsToCsv(questions: Question[]): void {
  const headers = [
    'ID',
    'Bidang',
    'Topik',
    'Bloom',
    'SOLO',
    'Tingkat',
    'Kesulitan',
    'Soal',
    'Opsi A',
    'Opsi B',
    'Opsi C',
    'Opsi D',
    'Opsi E',
    'Kunci',
    'Pembahasan',
  ];

  const rows = questions.map((q) => [
    `"${q.id}"`,
    `"${q.subject}"`,
    `"${q.topic}"`,
    `"${q.bloomLevel}"`,
    `"${q.soloLevel}"`,
    `"${q.level}"`,
    `"${q.difficulty}"`,
    `"${q.questionText.replace(/"/g, '""')}"`,
    `"${(q.options[0] || '').replace(/"/g, '""')}"`,
    `"${(q.options[1] || '').replace(/"/g, '""')}"`,
    `"${(q.options[2] || '').replace(/"/g, '""')}"`,
    `"${(q.options[3] || '').replace(/"/g, '""')}"`,
    `"${(q.options[4] || '').replace(/"/g, '""')}"`,
    `"${['A', 'B', 'C', 'D', 'E'][q.correctAnswerIndex]}"`,
    `"${(q.explanation || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadFile(csvContent, `Bank_Soal_SMAN1Pardasuka_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportQuestionsToJson(questions: Question[]): void {
  const jsonContent = JSON.stringify(questions, null, 2);
  downloadFile(jsonContent, `Bank_Soal_SMAN1Pardasuka_${Date.now()}.json`, 'application/json');
}

function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
