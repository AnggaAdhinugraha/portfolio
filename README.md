# 🚀 Portfolio Website — Angga Adhinugraha

Website portfolio pribadi dengan sistem admin CRUD, dibangun menggunakan **Node.js + Express**.

---

## 📁 Struktur Folder

```
portfolio/
├── server.js              ← File utama server
├── package.json           ← Daftar dependencies
├── data/
│   └── portfolio.json     ← Database (JSON)
└── public/
    ├── index.html         ← Halaman portfolio (publik)
    ├── admin.html         ← Halaman admin
    ├── uploads/           ← Folder foto/file upload
    ├── css/
    │   ├── style.css      ← Style halaman utama
    │   └── admin.css      ← Style admin panel
    └── js/
        ├── main.js        ← Logic halaman utama
        └── admin.js       ← Logic admin panel
```

---

## ⚡ Cara Menjalankan di VS Code

### Langkah 1 — Install Node.js
Download dan install dari: https://nodejs.org (pilih versi LTS)

### Langkah 2 — Buka folder di VS Code
```
File → Open Folder → pilih folder "portfolio"
```

### Langkah 3 — Buka Terminal di VS Code
```
Terminal → New Terminal (atau tekan Ctrl + `)
```

### Langkah 4 — Install dependencies
```bash
npm install
```

### Langkah 5 — Jalankan server
```bash
node server.js
```

Atau, untuk auto-restart saat ada perubahan (development):
```bash
npm run dev
```

### Langkah 6 — Buka di browser
- **Portfolio (publik):** http://localhost:3000
- **Admin panel:**       http://localhost:3000/admin

---

## 🔐 Login Admin

| Field    | Value      |
|----------|-----------|
| Username | `angga`   |
| Password | `angga123` |

> ⚠️ **Ganti password** di file `server.js` baris 14:
> ```js
> const ADMIN_PASSWORD_HASH = bcrypt.hashSync('PASSWORD_BARU_KAMU', 10);
> ```

---

## ✅ Fitur Admin Panel

| Fitur | Keterangan |
|-------|-----------|
| 👤 Profil | Edit nama, title, foto, email, HP, lokasi, ringkasan |
| 🔗 Sosial | Edit link GitHub & LinkedIn |
| 💼 Pengalaman | Tambah/hapus pengalaman kerja |
| 🎓 Pendidikan | Tambah/hapus riwayat pendidikan |
| 🚀 Project | Tambah/hapus project + gambar + link |
| ⚡ Keahlian | Edit hard skill & soft skill |
| 🏅 Sertifikat | Tambah/hapus sertifikat + upload file |

---

## 🌍 Cara Agar Bisa Dilihat Semua Orang (Deploy)

### Opsi 1 — Railway (Gratis, Paling Mudah)
1. Buat akun di https://railway.app
2. Hubungkan ke GitHub repository kamu
3. Upload project ke GitHub terlebih dahulu
4. Di Railway: New Project → Deploy from GitHub → pilih repo
5. Otomatis dapat URL publik seperti: `https://portfolio-angga.up.railway.app`

### Opsi 2 — Render (Gratis)
1. Buat akun di https://render.com
2. New → Web Service → hubungkan GitHub
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Deploy → dapat URL publik

### Opsi 3 — VPS (Berbayar, Lebih Kontrol)
- Gunakan DigitalOcean, Vultr, atau Biznet Gio (Indonesia)
- Upload file via SFTP atau Git
- Jalankan dengan PM2: `pm2 start server.js --name portfolio`

---

## 📦 Upload ke GitHub (Persiapan Deploy)

```bash
git init
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/USERNAME/portfolio.git
git push -u origin main
```

---

## 🛠️ Teknologi yang Digunakan

- **Backend:** Node.js, Express.js
- **Auth:** express-session, bcryptjs
- **Upload:** Multer
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Font:** Syne (display) + DM Sans (body)
- **Database:** JSON file (portable, tanpa setup DB)

---

Dibuat dengan ❤️ untuk Angga Adhinugraha
