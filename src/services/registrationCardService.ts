import { UserProfile } from '../types';

export function downloadRegistrationCard(user: UserProfile) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup terblokir oleh browser. Silakan izinkan popup untuk mengunduh bukti pendaftaran.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kartu Registrasi Akun OSN - ${user.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #111;
      margin: 0;
      padding: 20px;
      background: #fff;
    }
    .kop {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .kop h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
    .kop h1 { margin: 4px 0; font-size: 19pt; font-weight: 900; letter-spacing: 1px; }
    .kop p { margin: 2px 0; font-size: 10.5pt; font-style: italic; }
    .card-box {
      border: 2px solid #3b0764;
      border-radius: 12px;
      padding: 24px;
      background: #faf5ff;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .card-title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      color: #4c1d95;
      margin-bottom: 15px;
      border-bottom: 1px dashed #7e22ce;
      padding-bottom: 8px;
      text-transform: uppercase;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11pt; }
    td { padding: 8px 6px; vertical-align: top; }
    td.label { width: 35%; font-weight: bold; color: #374151; }
    td.colon { width: 3%; }
    td.val { font-weight: 600; color: #111827; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      background: #6b21a8;
      color: #fff;
      border-radius: 12px;
      font-size: 10pt;
      font-weight: bold;
    }
    .security-note {
      margin-top: 20px;
      padding: 12px;
      background: #fdf2f8;
      border-left: 4px solid #db2777;
      font-size: 9.5pt;
      color: #831843;
    }
    .ttd-row {
      margin-top: 35px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 11pt;
    }
    .ttd-box { width: 200px; }
    .ttd-space { height: 65px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="kop">
    <h2>PEMERINTAH PROVINSI LAMPUNG</h2>
    <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
    <h1>SMA NEGERI 1 PARDASUKA</h1>
    <p>Jl. Raya Pardasuka, Kec. Pardasuka, Kab. Pringsewu, Lampung 35372</p>
    <p>Portal LMS & CBT Olimpiade Sains Nasional (OSN) SMAN 1 Pardasuka</p>
  </div>

  <div class="card-box">
    <div class="card-title">KARTU BUKTI REGISTRASI AKUN OSN SMAN 1 PARDASUKA</div>

    <table>
      <tr>
        <td class="label">Nama Lengkap</td>
        <td class="colon">:</td>
        <td class="val">${user.name}</td>
      </tr>
      <tr>
        <td class="label">Peran Pengguna</td>
        <td class="colon">:</td>
        <td class="val">
          <span class="badge">
            ${user.role === 'admin' ? 'Admin Master' : user.role === 'teacher' ? 'Guru Pembina OSN' : 'Siswa Peserta OSN'}
          </span>
        </td>
      </tr>
      <tr>
        <td class="label">Bidang Mapel OSN</td>
        <td class="colon">:</td>
        <td class="val"><strong>${user.subject || 'Semua Bidang (Master Admin)'}</strong></td>
      </tr>
      <tr>
        <td class="label">User / NISN / NIP</td>
        <td class="colon">:</td>
        <td class="val"><code>${user.username || user.nisnOrNip}</code></td>
      </tr>
      <tr>
        <td class="label">Alamat Email</td>
        <td class="colon">:</td>
        <td class="val">${user.email || '-'}</td>
      </tr>
      <tr>
        <td class="label">Nomor WhatsApp</td>
        <td class="colon">:</td>
        <td class="val">${user.whatsapp || '-'}</td>
      </tr>
      <tr>
        <td class="label">Tanggal Registrasi</td>
        <td class="colon">:</td>
        <td class="val">${currentDate}</td>
      </tr>
      <tr>
        <td class="label">Keamanan Perangkat</td>
        <td class="colon">:</td>
        <td class="val">Terikat 1-Device Policy (${user.deviceToken ? user.deviceToken.substring(0, 14) + '...' : 'Aktif'})</td>
      </tr>
    </table>

    <div class="security-note">
      <strong>Catatan Keamanan:</strong> Simpan kartu ini sebagai bukti akun resmi. Login hanya dapat dilakukan menggunakan ID Pengguna dan Password yang telah Anda daftarkan pada perangkat browser ini.
    </div>

    <div class="ttd-row">
      <div class="ttd-box">
        <p>Peserta Terdaftar,</p>
        <div class="ttd-space"></div>
        <p><strong>${user.name}</strong></p>
      </div>
      <div class="ttd-box">
        <p>Pardasuka, ${currentDate}<br/>Koordinator OSN,</p>
        <div class="ttd-space"></div>
        <p><strong>Drs. Ahmad Subarjo, M.Pd.</strong><br/>NIP. 197508142002121003</p>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 25px;" class="no-print">
    <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; font-weight: bold; background: #6b21a8; color: #fff; border: none; border-radius: 8px; cursor: pointer;">
      Cetak / Simpan sebagai PDF
    </button>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog after render
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
