/* =============================================
   LANGUAGE TOGGLE
============================================= */
let currentLang = 'pt';

function applyLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    btn.textContent = lang === 'pt' ? 'PT → EN' : 'EN → PT';
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  applyLanguage(currentLang === 'pt' ? 'en' : 'pt');
});

const mobileToggle = document.getElementById('lang-toggle-mobile');
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    applyLanguage(currentLang === 'pt' ? 'en' : 'pt');
  });
}

/* =============================================
   NAVIGATION SCROLL SHADOW
============================================= */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* =============================================
   HAMBURGER MENU
============================================= */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* =============================================
   SCROLL REVEAL (IntersectionObserver)
============================================= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =============================================
   SMOOTH SCROLL (polyfill para browsers antigos)
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =============================================
   GITHUB API
============================================= */
const GITHUB_USERNAME = 'kaikyalvaro1708';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Java:       '#b07219',
  'C#':       '#178600',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  PHP:        '#4F5D95',
  Ruby:       '#701516',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  Dart:       '#00B4AB',
  Shell:      '#89e051',
  Vue:        '#42b883',
  default:    '#858585',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

function buildRepoCard(repo) {
  const langDot = repo.language
    ? `<span class="lang-dot" style="background:${getLangColor(repo.language)};"></span><span>${repo.language}</span>`
    : '';

  return `
    <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-card">
      <div class="repo-name">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="opacity:.5;flex-shrink:0">
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0
            01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0
            01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356
            0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
        </svg>
        ${repo.name}
      </div>
      <p class="repo-desc">${repo.description || (currentLang === 'pt' ? 'Sem descrição.' : 'No description.')}</p>
      <div class="repo-meta">
        ${repo.language ? `<span class="repo-lang">${langDot}</span>` : ''}
        <span class="repo-stars">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0
              01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8
              12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818
              6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
          </svg>
          ${repo.stargazers_count}
        </span>
      </div>
    </a>`;
}

async function loadGitHubRepos() {
  const grid = document.getElementById('repos-grid');
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6&type=public`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    if (!repos.length) {
      grid.innerHTML = `<p style="color:var(--gray-500);font-size:14px;grid-column:1/-1;"
        data-pt="Nenhum repositório público encontrado."
        data-en="No public repositories found.">
        Nenhum repositório público encontrado.</p>`;
      return;
    }

    grid.innerHTML = repos.map(buildRepoCard).join('');

    /* Animação de entrada nos cards carregados */
    grid.querySelectorAll('.repo-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 80 + i * 70);
    });
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--gray-500);font-size:14px;">
        <p style="margin-bottom:8px;">⚠️
          <span data-pt="Não foi possível carregar os repositórios."
                data-en="Could not load repositories.">
            Não foi possível carregar os repositórios.
          </span>
        </p>
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank"
           style="color:var(--blue);font-weight:600;"
           data-pt="Ver GitHub →" data-en="View GitHub →">
          Ver GitHub →
        </a>
      </div>`;
  }
}

loadGitHubRepos();

/* =============================================
   INSTAGRAM VIDEO — garante autoplay em loop
============================================= */
document.querySelectorAll('.insta-video').forEach(video => {
  video.muted = true;
  const tryPlay = () => { const p = video.play(); if (p) p.catch(() => {}); };
  tryPlay();
  video.addEventListener('pause', () => { if (!document.hidden) tryPlay(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
});
