import { Question, ExamResult, BimbinganSchedule, OsnModule } from '../types';
import { getSchoolConfig } from './schoolConfigService';

/**
 * Print utility for generating standardized PDF / Print layouts for:
 * 1. CBT Exam Results (with full recap, questions, and explanations attached)
 * 2. Bimbingan Guidance Schedules & Coaching Questions
 * 3. OSN Syllabus Modules
 */

const PRINT_STYLES = `
  @media print {
    body {
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: 700;
    }
  }
`;

function getSchoolHeaderHtml(title: string, subtitle: string): string {
  const cfg = getSchoolConfig();

  const logoElement = cfg.logoUrl
    ? `<img src="${cfg.logoUrl}" alt="${cfg.schoolName}" style="width: 52px; height: 52px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1;" />`
    : `<div style="width: 52px; height: 52px; border-radius: 10px; background: #581c87; color: #fbbf24; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 1px solid #7e22ce;">
        🏛️
      </div>`;

  return `
    <div style="border-bottom: 3px double #334155; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoElement}
        <div>
          <div style="font-size: 16px; font-weight: 900; letter-spacing: 0.5px; color: #1e1b4b; text-transform: uppercase;">
            ${cfg.schoolName}
          </div>
          <div style="font-size: 11px; color: #475569; font-weight: 600;">
            ${cfg.subDistrict}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${cfg.portalTitle}
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; font-weight: 800; color: #6b21a8; text-transform: uppercase;">
          ${title}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
          ${subtitle}
        </div>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 3px;">
          Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
        </div>
      </div>
    </div>
  `;
}

function openPrintWindow(title: string, bodyHtml: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup terblokir oleh browser. Harap izinkan popup untuk mencetak dokumen PDF.');
    return;
  }

  const cfg = getSchoolConfig();
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          ${PRINT_STYLES}
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 24px;
            max-width: 900px;
            margin: 0 auto;
            line-height: 1.5;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 14px;
            background: #ffffff;
          }
          .btn-print {
            padding: 8px 16px;
            background: #7c3aed;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #475569; font-weight: 600;">Pratinjau Dokumen PDF Resmi ${cfg.schoolName}</span>
          <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
        </div>
        ${bodyHtml}
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * Print CBT Exam Results with Full Recap Table, Questions and Discussions Appendix
 */
export function printCbtResultPdf(result: ExamResult, questions?: Question[]) {
  const cfg = getSchoolConfig();
  const header = getSchoolHeaderHtml(
    'LEMBAR HASIL & PEMBAHASAN UJIAN CBT OSN',
    `Kode Berkas: ${result.id}`
  );

  const studentInfo = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
      <div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Nama Siswa</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${result.studentName}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">NISN / ID Peserta</div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${result.nisn}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Bidang Olimpiade</div>
        <div style="font-size: 13px; font-weight: 800; color: #6b21a8;">${result.subject}</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Pengerjaan Ke</div>
        <div style="font-size: 13px; font-weight: 800; color: #0284c7;">Ke-${result.attemptNumber || 1} Kali</div>
      </div>
      <div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Waktu Pengiriman</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155;">${result.submittedAt.split('T')[0]}</div>
      </div>
    </div>
  `;

  const kpiStats = `
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #fefce8;">
        <div style="font-size: 10px; color: #854d0e; font-weight: 700;">SKOR AKHIR</div>
        <div style="font-size: 24px; font-weight: 900; color: #a16207;">${result.score}</div>
        <div style="font-size: 10px; color: #713f12;">Maks: ${result.maxPossibleScore}</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #f0fdf4;">
        <div style="font-size: 10px; color: #166534; font-weight: 700;">BENAR (+4)</div>
        <div style="font-size: 24px; font-weight: 900; color: #15803d;">${result.correctCount}</div>
        <div style="font-size: 10px; color: #14532d;">${result.totalQuestions} Butir</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #fef2f2;">
        <div style="font-size: 10px; color: #991b1b; font-weight: 700;">SALAH (-1)</div>
        <div style="font-size: 24px; font-weight: 900; color: #b91c1c;">${result.wrongCount}</div>
        <div style="font-size: 10px; color: #7f1d1d;">Penalti Skor</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc;">
        <div style="font-size: 10px; color: #475569; font-weight: 700;">KOSONG (0)</div>
        <div style="font-size: 24px; font-weight: 900; color: #64748b;">${result.unansweredCount}</div>
        <div style="font-size: 10px; color: #334155;">Tidak Dijawab</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #faf5ff;">
        <div style="font-size: 10px; color: #6b21a8; font-weight: 700;">PREDIKAT</div>
        <div style="font-size: 14px; font-weight: 900; color: #7e22ce; margin-top: 6px;">${result.predicate}</div>
        <div style="font-size: 10px; color: #581c87;">${result.percentageScore}% Akurasi</div>
      </div>
    </div>
  `;

  let bloomRows = '';
  if (result.bloomAnalysis) {
    Object.entries(result.bloomAnalysis).forEach(([bloom, data]) => {
      const pct = Math.round((data.correct / (data.total || 1)) * 100);
      bloomRows += `
        <tr>
          <td style="font-weight: 600;">Taksonomi Bloom ${bloom}</td>
          <td>${data.total} Butir</td>
          <td>${data.correct} Benar</td>
          <td style="font-weight: bold; color: ${pct >= 70 ? '#15803d' : '#b91c1c'};">${pct}%</td>
        </tr>
      `;
    });
  }

  // 1. REKAPITULASI JAWABAN PESERTA (Rekap No, Kunci, Jawaban Siswa, Status, Poin)
  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
  let answerRecapRows = '';

  if (questions && questions.length > 0) {
    answerRecapRows = questions
      .map((q, idx) => {
        const studentAnsIdx = result.answers[q.id];
        const isAnswered = studentAnsIdx !== undefined && studentAnsIdx !== -1;
        const studentAnsLabel = isAnswered ? (OPTION_LABELS[studentAnsIdx] || `Pilihan ${studentAnsIdx + 1}`) : '-';
        const keyLabel = OPTION_LABELS[q.correctAnswerIndex] || `Pilihan ${q.correctAnswerIndex + 1}`;
        const isCorrect = isAnswered && studentAnsIdx === q.correctAnswerIndex;

        let statusBadge = '';
        let pointText = '';
        if (isCorrect) {
          statusBadge = '<span style="color: #15803d; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">✓ Benar</span>';
          pointText = '+4 Poin';
        } else if (isAnswered) {
          statusBadge = '<span style="color: #b91c1c; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">✗ Salah</span>';
          pointText = '-1 Poin';
        } else {
          statusBadge = '<span style="color: #64748b; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">- Kosong</span>';
          pointText = '0 Poin';
        }

        return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>${q.topic || 'OSN Terjadwal'}</td>
            <td style="text-align: center; font-weight: bold; color: #166534; background: #f0fdf4;">${keyLabel}</td>
            <td style="text-align: center; font-weight: bold; color: ${isCorrect ? '#166534' : isAnswered ? '#b91c1c' : '#64748b'};">${studentAnsLabel}</td>
            <td style="text-align: center;">${statusBadge}</td>
            <td style="text-align: center; font-weight: 700;">${pointText}</td>
            <td style="font-size: 10px; color: #475569;">${q.bloomLevel}</td>
          </tr>
        `;
      })
      .join('');
  }

  // 2. LAMPIRAN LENGKAP BUTIR SOAL & PEMBAHASAN RESMI
  let questionsDiscussionHtml = '';
  if (questions && questions.length > 0) {
    questionsDiscussionHtml = `
      <div class="page-break" style="margin-top: 30px;"></div>
      <div style="border-bottom: 2px solid #7c3aed; padding-bottom: 8px; margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 900; color: #581c87; text-transform: uppercase;">
          LAMPIRAN BUTIR SOAL, SKEMA DIAGRAM & PEMBAHASAN RESMI CBT
        </h3>
        <p style="font-size: 11px; color: #64748b;">
          Daftar butir soal lengkap beserta perbandingan jawaban peserta, kunci jawaban resmi, dan uraian pembahasan ilmiah oleh Guru Pembina.
        </p>
      </div>

      ${questions
        .map((q, idx) => {
          const studentAnsIdx = result.answers[q.id];
          const isAnswered = studentAnsIdx !== undefined && studentAnsIdx !== -1;
          const isCorrect = isAnswered && studentAnsIdx === q.correctAnswerIndex;

          const optionsList =
            q.options && q.options.length > 0
              ? `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; font-size: 11px;">
                  ${q.options
                    .map((opt, optIdx) => {
                      const isStudentSelected = optIdx === studentAnsIdx;
                      const isCorrectKey = optIdx === q.correctAnswerIndex;

                      let style = 'padding: 5px 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #ffffff;';
                      let labelBadge = '';

                      if (isCorrectKey && isStudentSelected) {
                        style = 'padding: 5px 8px; border: 1.5px solid #22c55e; border-radius: 6px; background: #f0fdf4; font-weight: bold; color: #15803d;';
                        labelBadge = ' <span style="font-size: 10px; color: #166534; font-weight: bold;">[✓ Jawaban Anda & KUNCI]</span>';
                      } else if (isCorrectKey) {
                        style = 'padding: 5px 8px; border: 1.5px solid #22c55e; border-radius: 6px; background: #f0fdf4; font-weight: bold; color: #15803d;';
                        labelBadge = ' <span style="font-size: 10px; color: #166534; font-weight: bold;">[KUNCI RESMI]</span>';
                      } else if (isStudentSelected) {
                        style = 'padding: 5px 8px; border: 1.5px solid #ef4444; border-radius: 6px; background: #fef2f2; font-weight: bold; color: #b91c1c;';
                        labelBadge = ' <span style="font-size: 10px; color: #b91c1c; font-weight: bold;">[✗ Jawaban Anda]</span>';
                      }

                      return `<div style="${style}">${opt}${labelBadge}</div>`;
                    })
                    .join('')}
                </div>`
              : '';

          const diagramHtml = q.diagramSvg
            ? `<div style="margin: 10px 0; padding: 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center;">
                <div style="max-height: 180px; overflow: hidden; display: flex; justify-content: center;">${q.diagramSvg}</div>
                ${q.imageCaption ? `<div style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 4px;">${q.imageCaption}</div>` : ''}
              </div>`
            : '';

          return `
            <div class="card" style="margin-bottom: 16px; page-break-inside: avoid; border-left: 4px solid ${
              isCorrect ? '#22c55e' : isAnswered ? '#ef4444' : '#94a3b8'
            };">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
                <div>
                  <span style="font-weight: 900; color: #4c1d95; font-size: 12px;">BUTIR SOAL #${idx + 1}</span>
                  <span style="font-size: 11px; color: #475569; margin-left: 8px;">Topik: ${q.topic}</span>
                </div>
                <div style="font-size: 10px; display: flex; gap: 4px;">
                  <span class="badge" style="background: #e0e7ff; color: #3730a3;">${q.bloomLevel}</span>
                  <span class="badge" style="background: #fce7f3; color: #9d174d;">SOLO: ${q.soloLevel}</span>
                  <span class="badge" style="background: ${isCorrect ? '#dcfce7' : isAnswered ? '#fee2e2' : '#f1f5f9'}; color: ${isCorrect ? '#166534' : isAnswered ? '#991b1b' : '#475569'};">
                    ${isCorrect ? 'Benar (+4)' : isAnswered ? 'Salah (-1)' : 'Kosong (0)'}
                  </span>
                </div>
              </div>

              <p style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 6px; line-height: 1.5;">
                ${q.questionText}
              </p>
              ${q.formulaOrContext ? `<div style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">Konteks/Rumus: ${q.formulaOrContext}</div>` : ''}
              ${diagramHtml}
              ${optionsList}

              ${
                q.sampleEssayAnswer
                  ? `<div style="margin-top: 8px; padding: 6px 10px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; font-size: 11px;">
                      <strong style="color: #7e22ce;">Solusi Kunci Esai:</strong> ${q.sampleEssayAnswer}
                    </div>`
                  : ''
              }

              <!-- Kotak Pembahasan Komprehensif -->
              <div style="margin-top: 10px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #7c3aed; border-radius: 0 6px 6px 0; font-size: 11px; line-height: 1.5;">
                <strong style="color: #6b21a8; display: block; margin-bottom: 2px;">Pembahasan Ilmiah Guru Pembina:</strong>
                <span style="color: #334155;">${q.explanation}</span>
              </div>
            </div>
          `;
        })
        .join('')}
    `;
  }

  const signature = `
    <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; page-break-inside: avoid;">
      <div>
        <p>Mengetahui,</p>
        <p style="font-weight: bold; margin-top: 4px;">Kepala ${cfg.schoolName}</p>
        <div style="height: 50px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">${cfg.headmasterName}</p>
        <p style="color: #64748b;">${cfg.headmasterNip}</p>
      </div>
      <div style="text-align: right;">
        <p>Pardasuka, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="font-weight: bold; margin-top: 4px;">Koordinator Pembina OSN / CBT</p>
        <div style="height: 50px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">${cfg.coordinatorName}</p>
        <p style="color: #64748b;">${cfg.coordinatorNip}</p>
      </div>
    </div>
  `;

  const body = `
    ${header}
    ${studentInfo}
    <h3 style="font-size: 13px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px;">Ujian: ${result.examTitle}</h3>
    ${kpiStats}
    
    <h4 style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 16px; margin-bottom: 8px;">
      1. Analisis Kognitif Taksonomi Bloom & Daya Serap Siswa
    </h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th>Tingkat Kognitif</th>
          <th>Jumlah Soal</th>
          <th>Jawaban Benar</th>
          <th>Persentase Ketercapaian</th>
        </tr>
      </thead>
      <tbody>
        ${bloomRows || '<tr><td colspan="4" style="text-align: center;">Data kognitif tersimpan</td></tr>'}
      </tbody>
    </table>

    ${
      answerRecapRows
        ? `
      <h4 style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 16px; margin-bottom: 8px;">
        2. Rekapitulasi Jawaban Siswa & Kunci Jawaban Resmi Ujian
      </h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">No</th>
            <th>Topik Materi</th>
            <th style="width: 70px; text-align: center;">Kunci Resmi</th>
            <th style="width: 80px; text-align: center;">Jawaban Anda</th>
            <th style="width: 90px; text-align: center;">Status</th>
            <th style="width: 80px; text-align: center;">Skor Poin</th>
            <th>Taksonomi Bloom</th>
          </tr>
        </thead>
        <tbody>
          ${answerRecapRows}
        </tbody>
      </table>
    `
        : ''
    }
    
    <div style="font-size: 10px; color: #64748b; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
      Catatan Integritas: Tercatat ${result.tabSwitchViolations || 0} kali perpindahan tab browser selama sesi ujian berlangsung. Dokumen ini sah dan diterbitkan secara digital oleh Sistem CBT ${cfg.schoolName}.
    </div>

    ${questionsDiscussionHtml}
    
    ${signature}
  `;

  openPrintWindow(`Hasil_CBT_${result.studentName}_${result.subject}.pdf`, body);
}

/**
 * Print Bimbingan Guidance Schedule & Questions
 */
export function printBimbinganSchedulePdf(schedule: BimbinganSchedule) {
  const header = getSchoolHeaderHtml(
    'LEMBAR KEGIATAN & SOAL BIMBINGAN OSN',
    `Agenda ID: ${schedule.id}`
  );

  const scheduleInfo = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px;">
      <div style="font-size: 16px; font-weight: 900; color: #1e1b4b; margin-bottom: 6px;">
        ${schedule.title}
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 11px; margin-top: 10px;">
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Bidang OSN:</span>
          <strong style="color: #6b21a8; font-size: 13px;">${schedule.subject}</strong>
        </div>
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Waktu Pelaksanaan:</span>
          <strong>${schedule.date} • ${schedule.timeStart} - ${schedule.timeEnd} WIB</strong>
        </div>
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Lokasi Pembinaan:</span>
          <strong>${schedule.location}</strong>
        </div>
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Guru Pembina:</span>
          <strong>${schedule.mentorName}</strong>
        </div>
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Target Bloom:</span>
          <strong style="color: #2563eb;">${schedule.targetBloom}</strong>
        </div>
        <div>
          <span style="color: #64748b; display: block; font-weight: 600;">Target SOLO:</span>
          <strong style="color: #db2777;">${schedule.targetSolo}</strong>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px;">
        <strong>Topik Kajian:</strong> ${schedule.topic}
        ${schedule.notes ? `<br><strong style="color: #475569;">Instruksi Pembina:</strong> <em>${schedule.notes}</em>` : ''}
      </div>
    </div>
  `;

  let questionsHtml = '';
  if (schedule.coachingQuestions && schedule.coachingQuestions.length > 0) {
    questionsHtml = schedule.coachingQuestions
      .map((q, idx) => {
        const optionsList =
          q.options && q.options.length > 0
            ? `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; font-size: 11px;">
                ${q.options
                  .map(
                    (opt, optIdx) => `
                    <div style="padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 4px; ${
                      optIdx === q.correctAnswerIndex
                        ? 'background: #f0fdf4; border-color: #86efac; font-weight: bold; color: #166534;'
                        : 'background: #ffffff;'
                    }">
                      ${opt} ${optIdx === q.correctAnswerIndex ? '✓ [Kunci]' : ''}
                    </div>
                  `
                  )
                  .join('')}
              </div>`
            : '';

        const diagramHtml = q.diagramSvg
          ? `<div style="margin: 10px 0; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center;">
              <div style="max-height: 180px; overflow: hidden; display: flex; justify-content: center;">${q.diagramSvg}</div>
              ${q.imageCaption ? `<div style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 4px;">${q.imageCaption}</div>` : ''}
            </div>`
          : '';

        return `
          <div class="card" style="margin-bottom: 14px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 800; color: #581c87;">SOAL LATIHAN #${idx + 1}</span>
              <div style="font-size: 10px; color: #64748b;">
                <span class="badge" style="background: #e0e7ff; color: #3730a3;">${q.bloomLevel}</span>
                <span class="badge" style="background: #fce7f3; color: #9d174d;">SOLO: ${q.soloLevel}</span>
              </div>
            </div>
            <p style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 6px;">
              ${q.questionText}
            </p>
            ${q.formulaOrContext ? `<div style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">Formula: ${q.formulaOrContext}</div>` : ''}
            ${diagramHtml}
            ${optionsList}
            <div style="margin-top: 8px; padding: 6px 10px; background: #f8fafc; border-left: 3px solid #7c3aed; font-size: 11px;">
              <strong style="color: #6b21a8;">Pembahasan Ilmiah:</strong> ${q.explanation}
            </div>
          </div>
        `;
      })
      .join('');
  } else {
    questionsHtml = `
      <div style="text-align: center; padding: 24px; color: #64748b; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
        Belum ada butir soal yang dilampirkan pada sesi bimbingan ini.
      </div>
    `;
  }

  const body = `
    ${header}
    ${scheduleInfo}
    <h3 style="font-size: 13px; font-weight: 800; color: #1e1b4b; margin-top: 16px; margin-bottom: 10px;">
      Kumpulan Butir Soal & Pembedahan Konsep Sesi Bimbingan
    </h3>
    ${questionsHtml}
    <div style="margin-top: 30px; text-align: right; font-size: 11px;">
      <p>Pardasuka, ${schedule.date}</p>
      <p style="font-weight: bold; margin-top: 4px;">Guru Pembina Bidang ${schedule.subject}</p>
      <div style="height: 45px;"></div>
      <p style="font-weight: bold; text-decoration: underline;">${schedule.mentorName}</p>
      <p style="color: #64748b;">NIP. / ID: ${schedule.mentorId}</p>
    </div>
  `;

  openPrintWindow(`Jadwal_Bimbingan_${schedule.subject}_${schedule.date}.pdf`, body);
}

/**
 * Print OSN Module & Syllabus
 */
export function printOsnModulePdf(module: OsnModule) {
  const header = getSchoolHeaderHtml(
    'DOKUMEN SILABUS & MODUL PEMBINAAN OSN',
    `Bidang: ${module.subject}`
  );

  const subtopicsHtml = module.subtopics
    .map(
      (s, idx) => `
      <li style="margin-bottom: 4px;">
        <strong>Topik ${idx + 1}:</strong> ${s}
      </li>
    `
    )
    .join('');

  const formulasHtml = module.keyFormulas
    .map(
      (f) => `
      <div style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; background: #f8fafc;">
        <div style="display: flex; justify-content: space-between;">
          <strong style="color: #7c3aed; font-size: 11px;">${f.name}</strong>
          <span style="font-family: monospace; font-size: 10px; color: #475569;">Rumus Kunci</span>
        </div>
        <div style="font-family: monospace; font-size: 12px; font-weight: bold; color: #0f172a; margin: 4px 0;">
          ${f.formula}
        </div>
        <div style="font-size: 10px; color: #64748b;">
          ${f.explanation}
        </div>
      </div>
    `
    )
    .join('');

  const tipsHtml = module.tips
    .map(
      (t) => `
      <li style="margin-bottom: 4px;">${t}</li>
    `
    )
    .join('');

  let questionsHtml = '';
  if (module.moduleQuestions && module.moduleQuestions.length > 0) {
    questionsHtml = `
      <h3 style="font-size: 13px; font-weight: 800; color: #1e1b4b; margin-top: 24px; margin-bottom: 12px;">
        Bank Soal Teragenda Dalam Modul (${module.moduleQuestions.length} Butir)
      </h3>
      ${module.moduleQuestions
        .map(
          (q, idx) => `
          <div class="card" style="margin-bottom: 12px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px;">
              <strong style="color: #581c87;">Soal Modul #${idx + 1} (${(q.questionType || 'PG').toUpperCase()})</strong>
              <span style="font-size: 10px; color: #64748b;">${q.bloomLevel} • ${q.soloLevel}</span>
            </div>
            <p style="font-weight: 600; font-size: 12px; margin-bottom: 6px;">${q.questionText}</p>
            ${q.diagramSvg ? `<div style="text-align: center; margin: 8px 0; max-height: 160px; overflow: hidden;">${q.diagramSvg}</div>` : ''}
            ${
              q.options && q.options.length > 0
                ? `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                    ${q.options
                      .map(
                        (opt, oIdx) => `
                        <div style="padding: 3px 6px; border: 1px solid #e2e8f0; border-radius: 4px; ${
                          oIdx === q.correctAnswerIndex ? 'background: #f0fdf4; font-weight: bold; color: #166534;' : ''
                        }">
                          ${opt} ${oIdx === q.correctAnswerIndex ? '✓' : ''}
                        </div>
                      `
                      )
                      .join('')}
                  </div>`
                : ''
            }
            ${
              q.sampleEssayAnswer
                ? `<div style="margin-top: 6px; padding: 6px 10px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; font-size: 11px;">
                    <strong style="color: #7e22ce;">Solusi Esai:</strong> ${q.sampleEssayAnswer}
                  </div>`
                : ''
            }
            <div style="margin-top: 6px; padding: 4px 8px; background: #f8fafc; font-size: 10px; color: #475569;">
              <strong>Pembahasan:</strong> ${q.explanation}
            </div>
          </div>
        `
        )
        .join('')}
    `;
  }

  const body = `
    ${header}
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge" style="background: #f3e8ff; color: #6b21a8; font-size: 12px;">Bidang: ${module.subject}</span>
        <span style="font-size: 11px; font-weight: bold; color: #854d0e;">${module.difficultyTier}</span>
      </div>
      <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 8px 0 4px 0;">
        ${module.title}
      </h2>
      <p style="font-size: 11px; color: #475569; line-height: 1.5;">
        ${module.summary}
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #ffffff;">
        <h3 style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          📚 Silabus & Pokok Bahasan Puspresnas
        </h3>
        <ul style="padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
          ${subtopicsHtml}
        </ul>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #ffffff;">
        <h3 style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          💡 Strategi & Tips Penalaran HOTS
        </h3>
        <ul style="padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.6;">
          ${tipsHtml}
        </ul>
      </div>
    </div>

    <h3 style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px;">
      ⚡ Rumus Kunci & Teorema Esensial Olimpiade
    </h3>
    <div style="margin-bottom: 20px;">
      ${formulasHtml}
    </div>

    ${questionsHtml}

    <div style="margin-top: 40px; text-align: right; font-size: 11px;">
      <p>Pardasuka, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="font-weight: bold; margin-top: 4px;">Tim Pembina Olimpiade Sains SMAN 1 Pardasuka</p>
      <div style="height: 45px;"></div>
      <p style="font-weight: bold; text-decoration: underline;">Koordinator Materi & Kurikulum OSN</p>
    </div>
  `;

  openPrintWindow(`Modul_Silabus_OSN_${module.subject}.pdf`, body);
}

export interface ItemAnalysisData {
  questionId: string;
  subject: string;
  topic: string;
  bloomLevel: string;
  soloLevel: string;
  difficultyIndex: number;
  difficultyCategory: 'Mudah' | 'Sedang' | 'Sukar (HOTS)';
  discriminationIndex: number;
  discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Revisi';
  optionDistribution: { opt: string; percent: number; isCorrect: boolean }[];
  recommendation: 'Diterima' | 'Revisi Opsi Pengecoh' | 'Revisi Redaksi Soal';
  questionText?: string;
}

export function printItemAnalysisReport(
  title: string,
  subject: string,
  items: ItemAnalysisData[],
  teacherName: string = 'Drs. Ahmad Subarjo, M.Pd.'
) {
  const headerHtml = getSchoolHeaderHtml(
    'LAPORAN ANALISIS BUTIR SOAL',
    `Bidang: ${subject} • Instrumen Asesmen OSN`
  );

  const avgDifficulty = items.length > 0
    ? (items.reduce((acc, it) => acc + it.difficultyIndex, 0) / items.length).toFixed(2)
    : '0.00';
  const avgDiscrimination = items.length > 0
    ? (items.reduce((acc, it) => acc + it.discriminationIndex, 0) / items.length).toFixed(2)
    : '0.00';
  const acceptedCount = items.filter((it) => it.recommendation === 'Diterima').length;

  const tableRowsHtml = items
    .map(
      (it, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #4338ca;">${it.questionId}</td>
        <td>
          <div style="font-weight: 600; color: #1e1b4b;">${it.topic}</div>
          <div style="font-size: 10px; color: #64748b;">${it.bloomLevel} | ${it.soloLevel}</div>
        </td>
        <td style="text-align: center;">
          <div style="font-weight: bold;">${it.difficultyIndex.toFixed(2)}</div>
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${
            it.difficultyCategory === 'Sukar (HOTS)'
              ? '#fef2f2; color: #b91c1c;'
              : it.difficultyCategory === 'Sedang'
              ? '#fefce8; color: #a16207;'
              : '#ecfdf5; color: #047857;'
          }">${it.difficultyCategory}</span>
        </td>
        <td style="text-align: center;">
          <div style="font-weight: bold;">${it.discriminationIndex.toFixed(2)}</div>
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${
            it.discriminationCategory === 'Sangat Baik'
              ? '#ecfdf5; color: #047857;'
              : it.discriminationCategory === 'Baik'
              ? '#eff6ff; color: #1d4ed8;'
              : '#fef2f2; color: #b91c1c;'
          }">${it.discriminationCategory}</span>
        </td>
        <td>
          <div style="font-size: 10px; display: flex; gap: 4px;">
            ${it.optionDistribution
              .map(
                (o) =>
                  `<span style="padding: 1px 4px; border-radius: 3px; font-weight: ${
                    o.isCorrect ? 'bold' : 'normal'
                  }; background: ${o.isCorrect ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #475569;'}">${
                    o.opt
                  }:${o.percent}%</span>`
              )
              .join(' ')}
          </div>
        </td>
        <td style="text-align: center; font-weight: bold; color: ${
          it.recommendation === 'Diterima' ? '#15803d' : '#b45309'
        };">
          ${it.recommendation}
        </td>
      </tr>
    `
    )
    .join('');

  const body = `
    ${headerHtml}

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 800; color: #1e1b4b; margin: 0 0 6px 0;">
        ${title}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px; font-size: 11px;">
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Jumlah Butir Soal</div>
          <div style="font-size: 16px; font-weight: 800; color: #1e1b4b;">${items.length} Soal</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Rata-rata Tingkat Kesukaran (P)</div>
          <div style="font-size: 16px; font-weight: 800; color: #4338ca;">${avgDifficulty}</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Rata-rata Daya Pembeda (D)</div>
          <div style="font-size: 16px; font-weight: 800; color: #047857;">${avgDiscrimination}</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Kualitas Diterima Bank Soal</div>
          <div style="font-size: 16px; font-weight: 800; color: #0284c7;">${acceptedCount} / ${items.length}</div>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">No</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 75px;">Kode Soal</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">Materi & Tingkat Kognitif</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 95px; text-align: center;">Tk. Kesukaran (P)</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 95px; text-align: center;">Daya Pembeda (D)</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 140px;">Distribusi Opsi (A-E)</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 110px; text-align: center;">Rekomendasi</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; font-size: 11px;">
      <div>
        <p>Mengetahui,</p>
        <p style="font-weight: bold;">Kepala SMAN 1 Pardasuka</p>
        <div style="height: 55px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">Dra. Hj. Nuraini, M.Pd.</p>
        <p style="color: #64748b;">NIP. 196804121995032001</p>
      </div>

      <div style="text-align: right;">
        <p>Pardasuka, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="font-weight: bold;">Guru Pembina / Penyusun Soal</p>
        <div style="height: 55px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">${teacherName}</p>
        <p style="color: #64748b;">Koordinator Pembina OSN</p>
      </div>
    </div>
  `;

  openPrintWindow(`Laporan_Analisis_Butir_Soal_${subject}.pdf`, body);
}

/**
 * Print comprehensive CBT exam results recap
 */
export function printCbtRecapSummaryPdf(results: ExamResult[], filterLabel?: string) {
  const header = getSchoolHeaderHtml(
    'REKAPITULASI PENGERJAAN & HASIL UJIAN CBT OSN',
    filterLabel || 'Rekapitulasi Kumulatif Simulasi Olimpiade Sains Nasional'
  );

  const uniqueStudents = new Set(results.map((r) => r.studentId)).size;
  const totalSubmissions = results.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalSubmissions)
    : 0;
  const maxScore = totalSubmissions > 0
    ? Math.max(...results.map((r) => r.score))
    : 0;

  const rowsHtml = results.map((r, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
      <td style="font-family: monospace;">${r.nisn}</td>
      <td style="font-weight: 700;">${r.studentName}</td>
      <td style="color: #6b21a8; font-weight: 600;">${r.subject}</td>
      <td>${r.examTitle}</td>
      <td style="text-align: center; font-weight: 800; color: #0284c7;">Ke-${r.attemptNumber || 1}</td>
      <td style="text-align: center; font-weight: 900; color: #b45309;">${r.score}</td>
      <td style="text-align: center;">${r.percentageScore}%</td>
      <td style="text-align: center; font-weight: 600;">${r.predicate}</td>
      <td style="font-size: 10px; color: #64748b;">${new Date(r.submittedAt).toLocaleDateString('id-ID')}</td>
    </tr>
  `).join('');

  const body = `
    ${header}

    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
        RINGKASAN REKAPITULASI PENGERJAAN CBT
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px;">
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Jumlah Siswa Mengerjakan</div>
          <div style="font-size: 16px; font-weight: 800; color: #0284c7;">${uniqueStudents} Siswa</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Total Frekuensi Pengerjaan</div>
          <div style="font-size: 16px; font-weight: 800; color: #6b21a8;">${totalSubmissions} Kali (Attempts)</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Rata-rata Skor OSN</div>
          <div style="font-size: 16px; font-weight: 800; color: #047857;">${avgScore} Poin</div>
        </div>
        <div style="background: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <div style="color: #64748b;">Skor Tertinggi Tercatat</div>
          <div style="font-size: 16px; font-weight: 800; color: #d97706;">${maxScore} Poin</div>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 30px; text-align: center;">No</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 75px;">NISN</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">Nama Siswa</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">Bidang</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">Judul Ujian</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 65px; text-align: center;">Pengerjaan</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 50px; text-align: center;">Skor</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 55px; text-align: center;">Akurasi</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 95px; text-align: center;">Predikat</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; width: 75px;">Tanggal</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; font-size: 11px;">
      <div>
        <p>Mengetahui,</p>
        <p style="font-weight: bold;">Kepala SMAN 1 Pardasuka</p>
        <div style="height: 55px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">Dra. Hj. Nuraini, M.Pd.</p>
        <p style="color: #64748b;">NIP. 196804121995032001</p>
      </div>

      <div style="text-align: right;">
        <p>Pardasuka, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="font-weight: bold;">Koordinator Pembina OSN / Proktor CBT</p>
        <div style="height: 55px;"></div>
        <p style="font-weight: bold; text-decoration: underline;">Drs. Ahmad Subarjo, M.Pd.</p>
        <p style="color: #64748b;">NIP. 197508142002121003</p>
      </div>
    </div>
  `;

  openPrintWindow(`Rekapitulasi_CBT_SMAN1Pardasuka_${Date.now()}.pdf`, body);
}


