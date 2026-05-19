// ===========================
// ADMIN PANEL JS — dengan fitur Edit
// ===========================

let portfolioData = null;

// ===========================
// AUTH
// ===========================
async function checkAuth() {
  const res = await fetch('/api/check-auth');
  const data = await res.json();
  if (data.isAdmin) showAdmin();
  else showLogin();
}

function showLogin() {
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('adminWrap').style.display = 'none';
}

function showAdmin() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('adminWrap').style.display = 'flex';
  loadData();
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';

  if (!username || !password) {
    errEl.textContent = 'Isi username dan password!';
    errEl.style.display = 'block'; return;
  }
  const res = await fetch('/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) showAdmin();
  else {
    errEl.textContent = data.message || 'Login gagal';
    errEl.style.display = 'block';
  }
});

document.getElementById('loginPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  showLogin();
});

// ===========================
// TABS
// ===========================
const tabTitles = {
  profile: 'Profil', experience: 'Pengalaman', education: 'Pendidikan',
  projects: 'Project', skills: 'Keahlian', certificates: 'Sertifikat'
};

document.querySelectorAll('.snav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.snav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    document.getElementById('tabTitle').textContent = tabTitles[btn.dataset.tab];
  });
});

// ===========================
// TOAST
// ===========================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===========================
// MODAL
// ===========================
function openModal(title, bodyHTML, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('editModal').style.display = 'flex';
  document.getElementById('modalSaveBtn').onclick = onSave;
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('editModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editModal')) closeModal();
});

// ===========================
// LOAD DATA
// ===========================
async function loadData() {
  const res = await fetch('/api/portfolio');
  portfolioData = await res.json();
  fillProfile();
  fillExperience();
  fillEducation();
  fillProjects();
  fillSkills();
  fillCertificates();
}

// ===========================
// PROFILE
// ===========================
function fillProfile() {
  const p = portfolioData.profile;
  document.getElementById('photoPreview').src = p.photo || '/uploads/default-avatar.png';
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pTitle').value = p.title || '';
  document.getElementById('pSubtitle').value = p.subtitle || '';
  document.getElementById('pEmail').value = p.email || '';
  document.getElementById('pPhone').value = p.phone || '';
  document.getElementById('pLocation').value = p.location || '';
  document.getElementById('pGithub').value = p.github || '';
  document.getElementById('pLinkedin').value = p.linkedin || '';
  document.getElementById('pSummary').value = p.summary || '';
}

document.getElementById('photoFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => document.getElementById('photoPreview').src = ev.target.result;
    reader.readAsDataURL(file);
  }
});

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  const fd = new FormData();
  fd.append('name', document.getElementById('pName').value);
  fd.append('title', document.getElementById('pTitle').value);
  fd.append('subtitle', document.getElementById('pSubtitle').value);
  fd.append('email', document.getElementById('pEmail').value);
  fd.append('phone', document.getElementById('pPhone').value);
  fd.append('location', document.getElementById('pLocation').value);
  fd.append('github', document.getElementById('pGithub').value);
  fd.append('linkedin', document.getElementById('pLinkedin').value);
  fd.append('summary', document.getElementById('pSummary').value);
  const photoFile = document.getElementById('photoFile').files[0];
  if (photoFile) fd.append('photo', photoFile);

  const res = await fetch('/api/admin/profile', { method: 'PUT', body: fd });
  const data = await res.json();
  if (data.success) { showToast('Profil berhasil disimpan!'); portfolioData.profile = data.data; }
  else showToast('Gagal menyimpan profil', 'error');
});

// ===========================
// EXPERIENCE
// ===========================
function fillExperience() {
  const list = document.getElementById('expList');
  list.innerHTML = portfolioData.experience.map(e => `
    <div class="item-card">
      <div class="item-header">
        <div>
          <div class="item-title">${e.company}</div>
          <div class="item-sub">${e.role}</div>
          <div class="item-meta">${e.period} · ${e.type}</div>
        </div>
        <div class="item-actions">
          <button class="btn-edit" onclick="editExp(${e.id})">✏ Edit</button>
          <button class="btn-danger" onclick="deleteExp(${e.id})">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editExp(id) {
  const e = portfolioData.experience.find(x => x.id === id);
  if (!e) return;

  const typeOptions = ['Full Time','Part Time','Freelance','Magang','Praktik Kerja Lapangan','Studi Independen']
    .map(t => `<option${e.type === t ? ' selected' : ''}>${t}</option>`).join('');

  openModal('Edit Pengalaman', `
    <div class="form-grid">
      <div class="form-group">
        <label>Nama Perusahaan</label>
        <input type="text" id="m_eCompany" value="${e.company || ''}" placeholder="PT. ABC Indonesia" />
      </div>
      <div class="form-group">
        <label>Posisi / Role</label>
        <input type="text" id="m_eRole" value="${e.role || ''}" placeholder="Web Developer" />
      </div>
      <div class="form-group">
        <label>Periode</label>
        <input type="text" id="m_ePeriod" value="${e.period || ''}" placeholder="Jan 2024 - Des 2024" />
      </div>
      <div class="form-group">
        <label>Tipe</label>
        <select id="m_eType">${typeOptions}</select>
      </div>
    </div>
    <div class="form-group">
      <label>Poin Pekerjaan (satu poin per baris)</label>
      <textarea id="m_ePoints" rows="4" placeholder="Mengembangkan fitur X&#10;Mengelola database Y">${(e.points || []).join('\n')}</textarea>
    </div>
  `, async () => {
    const body = {
      company: document.getElementById('m_eCompany').value.trim(),
      role: document.getElementById('m_eRole').value.trim(),
      period: document.getElementById('m_ePeriod').value.trim(),
      type: document.getElementById('m_eType').value,
      points: document.getElementById('m_ePoints').value.trim()
    };
    if (!body.company || !body.role) { showToast('Isi nama perusahaan dan posisi!', 'error'); return; }

    const res = await fetch(`/api/admin/experience/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      const idx = portfolioData.experience.findIndex(x => x.id === id);
      portfolioData.experience[idx] = data.data;
      fillExperience();
      closeModal();
      showToast('Pengalaman berhasil diperbarui!');
    } else showToast('Gagal memperbarui', 'error');
  });
}

document.getElementById('addExpBtn').addEventListener('click', async () => {
  const body = {
    company: document.getElementById('eCompany').value.trim(),
    role: document.getElementById('eRole').value.trim(),
    period: document.getElementById('ePeriod').value.trim(),
    type: document.getElementById('eType').value,
    points: document.getElementById('ePoints').value.trim()
  };
  if (!body.company || !body.role) { showToast('Isi nama perusahaan dan posisi!', 'error'); return; }

  const res = await fetch('/api/admin/experience', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) {
    portfolioData.experience.unshift(data.data);
    fillExperience();
    ['eCompany','eRole','ePeriod','ePoints'].forEach(id => document.getElementById(id).value = '');
    showToast('Pengalaman berhasil ditambahkan!');
  } else showToast('Gagal menambahkan', 'error');
});

async function deleteExp(id) {
  if (!confirm('Hapus pengalaman ini?')) return;
  const res = await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    portfolioData.experience = portfolioData.experience.filter(e => e.id !== id);
    fillExperience(); showToast('Berhasil dihapus!');
  } else showToast('Gagal menghapus', 'error');
}

// ===========================
// EDUCATION
// ===========================
function fillEducation() {
  const list = document.getElementById('eduList');
  list.innerHTML = portfolioData.education.map(e => `
    <div class="item-card">
      <div class="item-header">
        <div>
          <div class="item-title">${e.school}</div>
          <div class="item-sub">${e.degree}</div>
          <div class="item-meta">${e.period}${e.gpa ? ' · IPK ' + e.gpa : ''}</div>
        </div>
        <div class="item-actions">
          <button class="btn-edit" onclick="editEdu(${e.id})">✏ Edit</button>
          <button class="btn-danger" onclick="deleteEdu(${e.id})">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editEdu(id) {
  const e = portfolioData.education.find(x => x.id === id);
  if (!e) return;

  openModal('Edit Pendidikan', `
    <div class="form-grid">
      <div class="form-group">
        <label>Nama Sekolah / Universitas</label>
        <input type="text" id="m_edSchool" value="${e.school || ''}" placeholder="Universitas XYZ" />
      </div>
      <div class="form-group">
        <label>Jurusan / Gelar</label>
        <input type="text" id="m_edDegree" value="${e.degree || ''}" placeholder="S1 Teknologi Informasi" />
      </div>
      <div class="form-group">
        <label>Periode</label>
        <input type="text" id="m_edPeriod" value="${e.period || ''}" placeholder="2021 - 2025" />
      </div>
      <div class="form-group">
        <label>IPK (opsional)</label>
        <input type="text" id="m_edGpa" value="${e.gpa || ''}" placeholder="3.90/4.00" />
      </div>
    </div>
    <div class="form-group">
      <label>Keterangan (opsional)</label>
      <input type="text" id="m_edDesc" value="${e.description || ''}" placeholder="Lulus dengan predikat..." />
    </div>
  `, async () => {
    const body = {
      school: document.getElementById('m_edSchool').value.trim(),
      degree: document.getElementById('m_edDegree').value.trim(),
      period: document.getElementById('m_edPeriod').value.trim(),
      gpa: document.getElementById('m_edGpa').value.trim(),
      description: document.getElementById('m_edDesc').value.trim()
    };
    if (!body.school || !body.degree) { showToast('Isi nama sekolah dan jurusan!', 'error'); return; }

    const res = await fetch(`/api/admin/education/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      const idx = portfolioData.education.findIndex(x => x.id === id);
      portfolioData.education[idx] = data.data;
      fillEducation();
      closeModal();
      showToast('Pendidikan berhasil diperbarui!');
    } else showToast('Gagal memperbarui', 'error');
  });
}

document.getElementById('addEduBtn').addEventListener('click', async () => {
  const body = {
    school: document.getElementById('edSchool').value.trim(),
    degree: document.getElementById('edDegree').value.trim(),
    period: document.getElementById('edPeriod').value.trim(),
    gpa: document.getElementById('edGpa').value.trim(),
    description: document.getElementById('edDesc').value.trim()
  };
  if (!body.school || !body.degree) { showToast('Isi nama sekolah dan jurusan!', 'error'); return; }

  const res = await fetch('/api/admin/education', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) {
    portfolioData.education.unshift(data.data);
    fillEducation();
    ['edSchool','edDegree','edPeriod','edGpa','edDesc'].forEach(id => document.getElementById(id).value = '');
    showToast('Pendidikan berhasil ditambahkan!');
  } else showToast('Gagal menambahkan', 'error');
});

async function deleteEdu(id) {
  if (!confirm('Hapus pendidikan ini?')) return;
  const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    portfolioData.education = portfolioData.education.filter(e => e.id !== id);
    fillEducation(); showToast('Berhasil dihapus!');
  } else showToast('Gagal menghapus', 'error');
}

// ===========================
// PROJECTS
// ===========================
function fillProjects() {
  const list = document.getElementById('projList');
  list.innerHTML = portfolioData.projects.map(p => `
    <div class="item-card">
      <div class="item-header">
        <div>
          <div class="item-title">${p.title}</div>
          <div class="item-meta">${(p.tech||[]).join(' · ')}</div>
        </div>
        <div class="item-actions">
          <button class="btn-edit" onclick="editProj(${p.id})">✏ Edit</button>
          <button class="btn-danger" onclick="deleteProj(${p.id})">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editProj(id) {
  const p = portfolioData.projects.find(x => x.id === id);
  if (!p) return;

  openModal('Edit Project', `
    <div class="form-grid">
      <div class="form-group">
        <label>Nama Project</label>
        <input type="text" id="m_prTitle" value="${p.title || ''}" placeholder="My Awesome App" />
      </div>
      <div class="form-group">
        <label>Ganti Gambar (opsional)</label>
        <input type="file" id="m_prImage" accept="image/*" />
        ${p.image ? `<img src="${p.image}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;margin-top:6px" />` : ''}
      </div>
      <div class="form-group">
        <label>Link GitHub (opsional)</label>
        <input type="url" id="m_prGithub" value="${p.github || ''}" placeholder="https://github.com/..." />
      </div>
      <div class="form-group">
        <label>Link Demo (opsional)</label>
        <input type="url" id="m_prDemo" value="${p.demo || ''}" placeholder="https://..." />
      </div>
    </div>
    <div class="form-group">
      <label>Deskripsi</label>
      <textarea id="m_prDesc" rows="3" placeholder="Deskripsi singkat project...">${p.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Teknologi (pisahkan dengan koma)</label>
      <input type="text" id="m_prTech" value="${(p.tech||[]).join(', ')}" placeholder="Python, Django, PostgreSQL" />
    </div>
  `, async () => {
    const fd = new FormData();
    fd.append('title', document.getElementById('m_prTitle').value.trim());
    fd.append('description', document.getElementById('m_prDesc').value.trim());
    fd.append('tech', document.getElementById('m_prTech').value.trim());
    fd.append('github', document.getElementById('m_prGithub').value.trim());
    fd.append('demo', document.getElementById('m_prDemo').value.trim());
    const img = document.getElementById('m_prImage').files[0];
    if (img) fd.append('image', img);

    if (!document.getElementById('m_prTitle').value.trim()) { showToast('Isi nama project!', 'error'); return; }

    const res = await fetch(`/api/admin/project/${id}`, { method: 'PUT', body: fd });
    const data = await res.json();
    if (data.success) {
      const idx = portfolioData.projects.findIndex(x => x.id === id);
      portfolioData.projects[idx] = data.data;
      fillProjects();
      closeModal();
      showToast('Project berhasil diperbarui!');
    } else showToast('Gagal memperbarui', 'error');
  });
}

document.getElementById('addProjBtn').addEventListener('click', async () => {
  const fd = new FormData();
  fd.append('title', document.getElementById('prTitle').value.trim());
  fd.append('description', document.getElementById('prDesc').value.trim());
  fd.append('tech', document.getElementById('prTech').value.trim());
  fd.append('github', document.getElementById('prGithub').value.trim());
  fd.append('demo', document.getElementById('prDemo').value.trim());
  const img = document.getElementById('prImage').files[0];
  if (img) fd.append('image', img);

  if (!document.getElementById('prTitle').value.trim()) { showToast('Isi nama project!', 'error'); return; }

  const res = await fetch('/api/admin/project', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.success) {
    portfolioData.projects.unshift(data.data);
    fillProjects();
    ['prTitle','prDesc','prTech','prGithub','prDemo'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('prImage').value = '';
    showToast('Project berhasil ditambahkan!');
  } else showToast('Gagal menambahkan', 'error');
});

async function deleteProj(id) {
  if (!confirm('Hapus project ini?')) return;
  const res = await fetch(`/api/admin/project/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
    fillProjects(); showToast('Berhasil dihapus!');
  } else showToast('Gagal menghapus', 'error');
}

// ===========================
// SKILLS
// ===========================
function fillSkills() {
  const hard = portfolioData.skills.hard || [];
  const soft = portfolioData.skills.soft || [];
  document.getElementById('hardSkillsInput').value = hard.join(', ');
  document.getElementById('softSkillsInput').value = soft.join(', ');
  updateSkillPreview();
}

function updateSkillPreview() {
  const hard = document.getElementById('hardSkillsInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  const soft = document.getElementById('softSkillsInput').value.split(',').map(s=>s.trim()).filter(Boolean);
  document.getElementById('hardPreview').innerHTML = hard.map(s=>`<span class="skill-chip">${s}</span>`).join('');
  document.getElementById('softPreview').innerHTML = soft.map(s=>`<span class="skill-chip">${s}</span>`).join('');
}

document.getElementById('hardSkillsInput').addEventListener('input', updateSkillPreview);
document.getElementById('softSkillsInput').addEventListener('input', updateSkillPreview);

document.getElementById('saveSkillsBtn').addEventListener('click', async () => {
  const body = {
    hard: document.getElementById('hardSkillsInput').value,
    soft: document.getElementById('softSkillsInput').value
  };
  const res = await fetch('/api/admin/skills', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.success) { showToast('Keahlian berhasil disimpan!'); portfolioData.skills = data.data; }
  else showToast('Gagal menyimpan', 'error');
});

// ===========================
// CERTIFICATES
// ===========================
function fillCertificates() {
  const list = document.getElementById('certList');
  list.innerHTML = portfolioData.certificates.map(c => `
    <div class="item-card">
      <div class="item-header">
        <div>
          <div class="item-title">${c.title}</div>
          <div class="item-meta">${c.issuer} · ${c.year}</div>
          ${c.link ? `<a href="${c.link}" target="_blank" style="font-size:0.75rem;color:var(--accent2)">Lihat →</a>` : ''}
        </div>
        <div class="item-actions">
          <button class="btn-edit" onclick="editCert(${c.id})">✏ Edit</button>
          <button class="btn-danger" onclick="deleteCert(${c.id})">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editCert(id) {
  const c = portfolioData.certificates.find(x => x.id === id);
  if (!c) return;

  openModal('Edit Sertifikat', `
    <div class="form-grid">
      <div class="form-group">
        <label>Nama Sertifikat</label>
        <input type="text" id="m_cTitle" value="${c.title || ''}" placeholder="BNSP Network Administrator" />
      </div>
      <div class="form-group">
        <label>Penerbit</label>
        <input type="text" id="m_cIssuer" value="${c.issuer || ''}" placeholder="BNSP" />
      </div>
      <div class="form-group">
        <label>Tahun</label>
        <input type="text" id="m_cYear" value="${c.year || ''}" placeholder="2024" />
      </div>
      <div class="form-group">
        <label>Ganti File (opsional)</label>
        <input type="file" id="m_cFile" accept="image/*,.pdf" />
      </div>
    </div>
    <div class="form-group">
      <label>Atau Link URL</label>
      <input type="url" id="m_cLink" value="${c.link || ''}" placeholder="https://..." />
    </div>
  `, async () => {
    const fd = new FormData();
    fd.append('title', document.getElementById('m_cTitle').value.trim());
    fd.append('issuer', document.getElementById('m_cIssuer').value.trim());
    fd.append('year', document.getElementById('m_cYear').value.trim());
    fd.append('link', document.getElementById('m_cLink').value.trim());
    const file = document.getElementById('m_cFile').files[0];
    if (file) fd.append('file', file);

    if (!document.getElementById('m_cTitle').value.trim()) { showToast('Isi nama sertifikat!', 'error'); return; }

    const res = await fetch(`/api/admin/certificate/${id}`, { method: 'PUT', body: fd });
    const data = await res.json();
    if (data.success) {
      const idx = portfolioData.certificates.findIndex(x => x.id === id);
      portfolioData.certificates[idx] = data.data;
      fillCertificates();
      closeModal();
      showToast('Sertifikat berhasil diperbarui!');
    } else showToast('Gagal memperbarui', 'error');
  });
}

document.getElementById('addCertBtn').addEventListener('click', async () => {
  const fd = new FormData();
  fd.append('title', document.getElementById('cTitle').value.trim());
  fd.append('issuer', document.getElementById('cIssuer').value.trim());
  fd.append('year', document.getElementById('cYear').value.trim());
  fd.append('link', document.getElementById('cLink').value.trim());
  const file = document.getElementById('cFile').files[0];
  if (file) fd.append('file', file);

  if (!document.getElementById('cTitle').value.trim()) { showToast('Isi nama sertifikat!', 'error'); return; }

  const res = await fetch('/api/admin/certificate', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.success) {
    portfolioData.certificates.unshift(data.data);
    fillCertificates();
    ['cTitle','cIssuer','cYear','cLink'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('cFile').value = '';
    showToast('Sertifikat berhasil ditambahkan!');
  } else showToast('Gagal menambahkan', 'error');
});

async function deleteCert(id) {
  if (!confirm('Hapus sertifikat ini?')) return;
  const res = await fetch(`/api/admin/certificate/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.success) {
    portfolioData.certificates = portfolioData.certificates.filter(c => c.id !== id);
    fillCertificates(); showToast('Berhasil dihapus!');
  } else showToast('Gagal menghapus', 'error');
}

// ===========================
// INIT
// ===========================
checkAuth();