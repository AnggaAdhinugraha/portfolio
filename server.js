const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// ADMIN CREDENTIALS (Ganti password sesuai keinginan)
// ==============================
const ADMIN_USERNAME = 'angga';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('angga123', 10); // password: angga123

// ==============================
// MIDDLEWARE
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({
  secret: 'angga-portfolio-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 hari
}));

// ==============================
// MULTER - File Upload Config
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public/uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// ==============================
// HELPER: Read/Write Data
// ==============================
const DATA_PATH = path.join(__dirname, 'data/portfolio.json');

function getData() {
  return fs.readJsonSync(DATA_PATH);
}

function saveData(data) {
  fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });
}

// ==============================
// AUTH MIDDLEWARE
// ==============================
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

// ==============================
// ROUTES - PUBLIC
// ==============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Get all portfolio data (public)
app.get('/api/portfolio', (req, res) => {
  const data = getData();
  res.json(data);
});

// ==============================
// ROUTES - AUTH
// ==============================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.isAdmin = true;
    req.session.username = username;
    res.json({ success: true, message: 'Login berhasil' });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// ==============================
// ROUTES - ADMIN CRUD
// ==============================

// UPDATE Profile
app.put('/api/admin/profile', isAdmin, upload.single('photo'), (req, res) => {
  try {
    const data = getData();
    const { name, title, subtitle, email, phone, location, github, linkedin, portfolio, summary } = req.body;
    data.profile = {
      ...data.profile,
      name: name || data.profile.name,
      title: title || data.profile.title,
      subtitle: subtitle || data.profile.subtitle,
      email: email || data.profile.email,
      phone: phone || data.profile.phone,
      location: location || data.profile.location,
      github: github !== undefined ? github : data.profile.github,
      linkedin: linkedin !== undefined ? linkedin : data.profile.linkedin,
      portfolio: portfolio !== undefined ? portfolio : data.profile.portfolio,
      summary: summary || data.profile.summary,
    };
    if (req.file) {
      data.profile.photo = '/uploads/' + req.file.filename;
    }
    saveData(data);
    res.json({ success: true, data: data.profile });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- EXPERIENCE CRUD ----
app.post('/api/admin/experience', isAdmin, (req, res) => {
  try {
    const data = getData();
    const exp = req.body;
    exp.id = Date.now();
    if (typeof exp.points === 'string') exp.points = exp.points.split('\n').filter(p => p.trim());
    data.experience.unshift(exp);
    saveData(data);
    res.json({ success: true, data: exp });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/admin/experience/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    const idx = data.experience.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = { ...data.experience[idx], ...req.body };
    if (typeof updated.points === 'string') updated.points = updated.points.split('\n').filter(p => p.trim());
    data.experience[idx] = updated;
    saveData(data);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/experience/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    data.experience = data.experience.filter(e => e.id !== id);
    saveData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- EDUCATION CRUD ----
app.post('/api/admin/education', isAdmin, (req, res) => {
  try {
    const data = getData();
    const edu = req.body;
    edu.id = Date.now();
    data.education.unshift(edu);
    saveData(data);
    res.json({ success: true, data: edu });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/admin/education/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    const idx = data.education.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    data.education[idx] = { ...data.education[idx], ...req.body };
    saveData(data);
    res.json({ success: true, data: data.education[idx] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/education/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    data.education = data.education.filter(e => e.id !== id);
    saveData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- PROJECT CRUD ----
app.post('/api/admin/project', isAdmin, upload.single('image'), (req, res) => {
  try {
    const data = getData();
    const project = req.body;
    project.id = Date.now();
    if (typeof project.tech === 'string') project.tech = project.tech.split(',').map(t => t.trim()).filter(Boolean);
    if (req.file) project.image = '/uploads/' + req.file.filename;
    data.projects.unshift(project);
    saveData(data);
    res.json({ success: true, data: project });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/admin/project/:id', isAdmin, upload.single('image'), (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = { ...data.projects[idx], ...req.body };
    if (typeof updated.tech === 'string') updated.tech = updated.tech.split(',').map(t => t.trim()).filter(Boolean);
    if (req.file) updated.image = '/uploads/' + req.file.filename;
    data.projects[idx] = updated;
    saveData(data);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/project/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    data.projects = data.projects.filter(p => p.id !== id);
    saveData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- SKILLS CRUD ----
app.put('/api/admin/skills', isAdmin, (req, res) => {
  try {
    const data = getData();
    const { hard, soft } = req.body;
    if (hard) data.skills.hard = typeof hard === 'string' ? hard.split(',').map(s => s.trim()).filter(Boolean) : hard;
    if (soft) data.skills.soft = typeof soft === 'string' ? soft.split(',').map(s => s.trim()).filter(Boolean) : soft;
    saveData(data);
    res.json({ success: true, data: data.skills });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- CERTIFICATE CRUD ----
app.post('/api/admin/certificate', isAdmin, upload.single('file'), (req, res) => {
  try {
    const data = getData();
    const cert = req.body;
    cert.id = Date.now();
    if (req.file) cert.link = '/uploads/' + req.file.filename;
    data.certificates.unshift(cert);
    saveData(data);
    res.json({ success: true, data: cert });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/admin/certificate/:id', isAdmin, upload.single('file'), (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    const idx = data.certificates.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = { ...data.certificates[idx], ...req.body };
    if (req.file) updated.link = '/uploads/' + req.file.filename;
    data.certificates[idx] = updated;
    saveData(data);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/certificate/:id', isAdmin, (req, res) => {
  try {
    const data = getData();
    const id = parseInt(req.params.id);
    data.certificates = data.certificates.filter(c => c.id !== id);
    saveData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio berjalan di: http://localhost:${PORT}`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`👤 Username: angga | Password: angga123\n`);
});
