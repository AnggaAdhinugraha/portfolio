// ===========================
// PORTFOLIO MAIN JS
// ===========================

let portfolioData = null;

async function loadPortfolio() {
  try {
    const res = await fetch('/api/portfolio');
    portfolioData = await res.json();
    renderAll();
  } catch (e) {
    console.error('Gagal memuat data:', e);
  }
}

function renderAll() {
  renderProfile();
  renderAbout();
  renderEducation();
  renderExperience();
  renderProjects();
  renderSkills();
  renderCertificates();
  renderContact();
}

// ===========================
// HELPER: pastikan URL valid
// ===========================
function fixUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}

function renderProfile() {
  const p = portfolioData.profile;
  document.title = `${p.name} — Portfolio`;
  document.getElementById('heroName').textContent = p.name;
  document.getElementById('heroTitle').textContent = p.title;
  document.getElementById('heroSub').textContent = p.subtitle;
  document.getElementById('footerName').textContent = p.name;

  const navLogo = document.getElementById('navLogo');
  if (navLogo) {
    navLogo.innerHTML = `Home<span>.</span>`;
  }

  const photo = document.getElementById('heroPhoto');
  photo.src = p.photo || '/uploads/default-avatar.png';
  photo.onerror = () => {
    photo.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="%230d1320" width="300" height="300"/><circle cx="150" cy="120" r="60" fill="%2338bdf8" opacity="0.3"/><ellipse cx="150" cy="240" rx="90" ry="60" fill="%2338bdf8" opacity="0.2"/></svg>';
  };

  const githubEl = document.getElementById('heroGithub');
  const linkedinEl = document.getElementById('heroLinkedin');
  const instagramEl = document.getElementById('heroInstagram');

  if (p.github) {
    githubEl.href = fixUrl(p.github);
  } else {
    githubEl.style.display = 'none';
  }

  if (p.linkedin) {
    linkedinEl.href = fixUrl(p.linkedin);
  } else {
    linkedinEl.style.display = 'none';
  }

  // Instagram — link statis, selalu tampil
  if (instagramEl) {
    instagramEl.href = 'https://www.instagram.com/ngrhaa.28?igsh=cmU4NTY2bXA3MjY0';
  }
}

function renderAbout() {
  const p = portfolioData.profile;
  document.getElementById('aboutSummary').textContent = p.summary;

  const projectCount = (portfolioData.projects || []).length;
  const certCount = (portfolioData.certificates || []).length;

  const statProjects = document.getElementById('statProjects');
  const statCerts = document.getElementById('statCertificates');

  if (statProjects) statProjects.textContent = projectCount;
  if (statCerts) statCerts.textContent = certCount;
}

function renderEducation() {
  const container = document.getElementById('educationTimeline');
  container.innerHTML = portfolioData.education.map(e => `
    <div class="tl-item reveal">
      <div class="tl-dot"></div>
      <div class="tl-body">
        <div class="tl-company">${e.school}</div>
        <div class="tl-role">${e.degree}</div>
        <div class="tl-meta">
          <span class="tl-period">${e.period}</span>
          ${e.gpa ? `<span class="tl-gpa">IPK ${e.gpa}</span>` : ''}
        </div>
        ${e.description ? `<p style="font-size:0.85rem;color:var(--text-muted)">${e.description}</p>` : ''}
      </div>
    </div>
  `).join('');
  initReveal();
}

function renderExperience() {
  const container = document.getElementById('experienceTimeline');

  if (!portfolioData.experience || portfolioData.experience.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">Belum ada pengalaman kerja yang ditambahkan.</p>`;
    return;
  }

  container.innerHTML = portfolioData.experience.map(e => `
    <div class="tl-item reveal">
      <div class="tl-dot"></div>
      <div class="tl-body">
        <div class="tl-company">${e.company}</div>
        <div class="tl-role">${e.role}</div>
        <div class="tl-meta">
          <span class="tl-period">${e.period}</span>
          ${e.type ? `<span class="tl-type">${e.type}</span>` : ''}
        </div>
        <ul class="tl-points">
          ${(e.points || []).map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
  initReveal();
}

function renderProjects() {
  const container = document.getElementById('projectsGrid');

  if (!portfolioData.projects || portfolioData.projects.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">Belum ada proyek yang ditambahkan.</p>`;
    return;
  }

  container.innerHTML = portfolioData.projects.map(p => `
    <div class="project-card reveal">
      <div class="project-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" />`
          : `<span>💻</span>`}
      </div>
      <div class="project-body">
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.description}</div>
        <div class="tech-tags">
          ${(p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.github ? `<a href="${fixUrl(p.github)}" target="_blank" class="project-link">⚙ GitHub</a>` : ''}
          ${p.demo ? `<a href="${fixUrl(p.demo)}" target="_blank" class="project-link">🔗 Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
  initReveal();
}

function renderSkills() {
  const hard = document.getElementById('hardSkills');
  const soft = document.getElementById('softSkills');
  hard.innerHTML = (portfolioData.skills.hard || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
  soft.innerHTML = (portfolioData.skills.soft || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
}

function renderCertificates() {
  const container = document.getElementById('certGrid');

  if (!portfolioData.certificates || portfolioData.certificates.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">Belum ada sertifikat yang ditambahkan.</p>`;
    return;
  }

  container.innerHTML = portfolioData.certificates.map(c => `
    <div class="cert-card reveal">
      <div class="cert-icon">🏅</div>
      <div class="cert-body">
        <div class="cert-title">${c.title}</div>
        <div class="cert-meta">${c.issuer} · ${c.year}</div>
        ${c.link ? `<a href="${fixUrl(c.link)}" target="_blank" class="cert-link">Lihat Sertifikat →</a>` : ''}
      </div>
    </div>
  `).join('');
  initReveal();
}

function renderContact() {
  const p = portfolioData.profile;
  document.querySelector('#contactEmail .ci-text').textContent = p.email || '—';
  document.querySelector('#contactPhone .ci-text').textContent = p.phone || '—';
  document.querySelector('#contactLocation .ci-text').textContent = p.location || '—';

  const waBtn = document.getElementById('contactWaBtn');
  if (waBtn) {
    const nomorWa = '6282234512521';
    const pesanWa = encodeURIComponent(`Halo ${p.name}, saya tertarik untuk bekerja sama dengan kamu!`);
    waBtn.href = `https://wa.me/${nomorWa}?text=${pesanWa}`;
  }
}

// ===========================
// ACTIVE NAV ON SCROLL
// ===========================
function initActiveNav() {
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const offset = 120;
    let currentId = '';

    navItems.forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const section = document.querySelector(href);
      if (!section) return;
      const sectionTop = section.offsetTop - offset;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) currentId = href;
    });

    navItems.forEach(a => a.classList.remove('active'));
    if (currentId) {
      const activeLink = document.querySelector(`.nav-links a[href="${currentId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  navItems.forEach(a => {
    a.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

// ===========================
// NAVBAR SCROLL STYLE
// ===========================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ===========================
// HAMBURGER MENU
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ===========================
// SCROLL REVEAL
// ===========================
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

// ===========================
// AKSES ADMIN TERSEMBUNYI
// ===========================

// --- CARA 1: Konami Code ---
// Ketik urutan: ↑ ↑ ↓ ↓ ← → ← → B A
// Saat di halaman portofolio, akan redirect ke /admin
(function initKonamiCode() {
  const KONAMI = [
    'ArrowUp','ArrowUp',
    'ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight',
    'ArrowLeft','ArrowRight',
    'b','a'
  ];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        window.location.href = '/admin';
      }
    } else {
      idx = (e.key === KONAMI[0]) ? 1 : 0;
    }
  });
})();

// --- CARA 2: Triple-click cepat pada nama di footer ---
// Klik 3x dalam 600ms pada elemen #footerName → redirect ke /admin
(function initFooterTripleClick() {
  let clickCount = 0;
  let clickTimer = null;

  document.addEventListener('DOMContentLoaded', () => {
    const footerName = document.getElementById('footerName');
    if (!footerName) return;

    footerName.style.cursor = 'default';

    footerName.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);
      }
      if (clickCount >= 3) {
        clearTimeout(clickTimer);
        clickCount = 0;
        window.location.href = '/admin';
      }
    });
  });
})();

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  loadPortfolio();
  initReveal();
  initActiveNav();
});