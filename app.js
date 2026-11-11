/**
 * SKYNET STUDIOS // CLIENT ENGINE
 * Ultra-Interactive Vanilla JS Core (Light Theme Edition)
 * Features: Card Spotlight Tracking, 3D Tilt Physics, Magnetic CTAs, 
 * Live Filter Tabs, Native Modal, Dynamic Currency Toggle, 
 * Service Pre-Selection, Estimator & Form Handler.
 * (Custom cursor follower completely removed; system cursor restored)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. SPOTLIGHT EFFECT ON CARDS (Mouse-Tracking Radial Illumination)
  // =========================================================================
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // =========================================================================
  // 2. CARD HOVER & ACTIVE INTERACTIONS
  // (Shaky 3D tilt script removed. Cards remain flat, stable, and elevate
  // with smooth CSS vertical lift translateY(-8px) and tactile active press)
  // =========================================================================

  // =========================================================================
  // 3. MAGNETIC HOVER PULL PHYSICS FOR PRIMARY CTAS
  // =========================================================================
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // =========================================================================
  // 4. STICKY NAVBAR SCROLL STATE & MOBILE DRAWER
  // =========================================================================
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile drawer upon clicking any link inside it
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================================================
  // 5. SECURITY & ADMIN PROTECTION ENGINE
  // =========================================================================

  /**
   * Strict input sanitization stripping HTML tags, scripts, event handlers, and dangerous characters.
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/<[^>]*>/g, '') // Strip all HTML tags
      .replace(/javascript:/gi, '') // Strip javascript: URIs
      .replace(/data:\s*text\/html/gi, '') // Strip data HTML
      .replace(/on\w+\s*=/gi, '') // Strip inline event handlers
      .replace(/[<>'"`]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case "'": return '&#39;';
          case '"': return '&quot;';
          case '`': return '&#96;';
          default: return char;
        }
      })
      .trim();
  }

  /**
   * Sanitizes names: allows only letters, spaces, hyphens, periods, and apostrophes.
   */
  function sanitizeName(name) {
    return sanitizeInput(name).replace(/[^a-zA-Z\s\.\'\-]/g, '').trim();
  }

  /**
   * Sanitizes address: strips dangerous symbols while preserving address syntax.
   */
  function sanitizeAddress(addr) {
    return sanitizeInput(addr).replace(/[\<\>\{\}\[\]\\\|\^\`\~]/g, '').trim();
  }

  /**
   * Validates Indian mobile and WhatsApp numbers (10 digits starting with 6-9, optional +91/91/0 prefix).
   */
  function isValidIndianPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    const indianRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
    return indianRegex.test(cleaned);
  }

  /**
   * Normalizes a phone number for display/transmission.
   */
  function normalizeIndianPhone(phone) {
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    const tenDigits = cleaned.slice(-10);
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  /**
   * Computes SHA-256 hash using Web Crypto API (crypto.subtle.digest).
   */
  async function computeSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Admin Security Configuration
  // Default Passkey: "skynet2026"
  const DEFAULT_ADMIN_HASH = '6b297cb1d136f0145cba3b8a665c76ca4a06e6411170d6b81fdb9410ea239cc4';
  const ADMIN_SESSION_KEY = 'skynet_admin_session';
  const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30-minute inactivity timeout

  function getExpectedAdminHash() {
    return localStorage.getItem('skynet_admin_hash') || DEFAULT_ADMIN_HASH;
  }

  function isAdminAuthenticated() {
    try {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      if (!session || !session.token || !session.timestamp) return false;
      
      const elapsed = Date.now() - session.timestamp;
      if (elapsed > ADMIN_SESSION_TIMEOUT_MS) {
        revokeAdminSession(true);
        return false;
      }
      return session.token === getExpectedAdminHash();
    } catch (e) {
      return false;
    }
  }

  function touchAdminActivity() {
    if (!isAdminAuthenticated()) return;
    try {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        session.timestamp = Date.now();
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      }
    } catch (e) {}
  }

  window.addEventListener('click', touchAdminActivity);
  window.addEventListener('keydown', touchAdminActivity);

  function grantAdminSession(hash) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      token: hash,
      timestamp: Date.now()
    }));
    document.body.classList.add('admin-mode');
    const badge = document.getElementById('adminSessionBadge');
    if (badge) badge.style.display = 'inline-flex';

    // Refresh portfolio to reveal admin controls
    const activeTab = document.querySelector('.filter-tab.active');
    const activeFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    renderPortfolio(activeFilter);
    showNotificationToast('🛡️ Admin Mode Unlocked. Portfolio controls active.');
  }

  function revokeAdminSession(isTimeout = false) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    document.body.classList.remove('admin-mode');
    const badge = document.getElementById('adminSessionBadge');
    if (badge) badge.style.display = 'none';

    if (addProjectModal && typeof addProjectModal.close === 'function' && addProjectModal.open) {
      addProjectModal.close();
      document.body.style.overflow = '';
    }

    const activeTab = document.querySelector('.filter-tab.active');
    const activeFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    renderPortfolio(activeFilter);

    if (isTimeout) {
      showNotificationToast('🔒 Admin session expired (30m inactivity).');
    } else {
      showNotificationToast('🔒 Admin session ended.');
    }
  }

  // Periodic timeout check every 30 seconds
  setInterval(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      isAdminAuthenticated();
    }
  }, 30000);

  // Initialize admin state on page load
  if (isAdminAuthenticated()) {
    document.body.classList.add('admin-mode');
    const badge = document.getElementById('adminSessionBadge');
    if (badge) badge.style.display = 'inline-flex';
  }

  // Admin Modal Elements
  const adminAuthModal = document.getElementById('adminAuthModal');
  const adminAuthForm = document.getElementById('adminAuthForm');
  const adminPasskeyInput = document.getElementById('adminPasskeyInput');
  const adminAuthError = document.getElementById('adminAuthError');
  const adminAuthErrorText = document.getElementById('adminAuthErrorText');
  const closeAdminAuthBtn = document.getElementById('closeAdminAuthBtn');
  const cancelAdminAuthBtn = document.getElementById('cancelAdminAuthBtn');
  const togglePasskeyVisibilityBtn = document.getElementById('togglePasskeyVisibilityBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  function openAdminAuthModal() {
    if (adminAuthModal) {
      if (adminAuthError) adminAuthError.style.display = 'none';
      if (adminPasskeyInput) adminPasskeyInput.value = '';
      if (typeof adminAuthModal.showModal === 'function') {
        adminAuthModal.showModal();
      } else {
        adminAuthModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      if (adminPasskeyInput) setTimeout(() => adminPasskeyInput.focus(), 80);
    }
  }

  function closeAdminAuthModal() {
    if (adminAuthModal) {
      if (typeof adminAuthModal.close === 'function') {
        adminAuthModal.close();
      } else {
        adminAuthModal.removeAttribute('open');
      }
      document.body.style.overflow = '';
      if (adminPasskeyInput) adminPasskeyInput.value = '';
    }
  }

  if (closeAdminAuthBtn) closeAdminAuthBtn.addEventListener('click', closeAdminAuthModal);
  if (cancelAdminAuthBtn) cancelAdminAuthBtn.addEventListener('click', closeAdminAuthModal);
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', () => revokeAdminSession(false));

  if (togglePasskeyVisibilityBtn && adminPasskeyInput) {
    togglePasskeyVisibilityBtn.addEventListener('click', () => {
      const isPassword = adminPasskeyInput.type === 'password';
      adminPasskeyInput.type = isPassword ? 'text' : 'password';
    });
  }

  if (adminAuthForm) {
    adminAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredPasskey = adminPasskeyInput ? adminPasskeyInput.value.trim() : '';
      if (!enteredPasskey) {
        if (adminAuthError) {
          adminAuthErrorText.textContent = 'Please enter the admin passkey.';
          adminAuthError.style.display = 'flex';
        }
        return;
      }

      // Hash passkey with SHA-256 via Web Crypto API
      const enteredHash = await computeSHA256(enteredPasskey);
      const expectedHash = getExpectedAdminHash();

      if (enteredHash === expectedHash) {
        closeAdminAuthModal();
        grantAdminSession(enteredHash);
        setTimeout(() => openAddModal(), 200);
      } else {
        if (adminAuthError) {
          adminAuthErrorText.textContent = 'Invalid passkey. Access denied.';
          adminAuthError.style.display = 'flex';
          adminAuthError.classList.remove('shake-anim');
          void adminAuthError.offsetWidth;
          adminAuthError.classList.add('shake-anim');
        }
        if (adminPasskeyInput) {
          adminPasskeyInput.value = '';
          adminPasskeyInput.focus();
        }
      }
    });
  }

  // Secret Admin Shortcut: Ctrl + Shift + A or Cmd + Shift + A
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if (isAdminAuthenticated()) {
        openAddModal();
      } else {
        openAdminAuthModal();
      }
    }
  });

  // =========================================================================
  // =========================================================================
  // 6. PORTFOLIO DYNAMIC STORAGE ARCHITECTURE & EMPTY STATE RENDERING
  // =========================================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectsGrid = document.getElementById('projectsGrid');
  const showMoreProjectsBtn = document.getElementById('showMoreProjectsBtn');
  const portfolioShowMoreWrapper = document.getElementById('portfolioShowMoreWrapper');
  const portfolioEmptyState = document.getElementById('portfolioEmptyState');
  let isPortfolioExpanded = false;

  const PORTFOLIO_STORAGE_KEY = 'skynet_portfolio_projects';

  function getStoredProjects() {
    try {
      const data = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn('Could not read portfolio projects from localStorage:', err);
      return [];
    }
  }

  function saveStoredProjects(projects) {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.warn('Could not save portfolio projects to localStorage:', err);
    }
  }

  function createProjectCardElement(project, index, isAllFilter, isExpanded) {
    const card = document.createElement('article');
    card.className = 'project-card spotlight-card';
    card.setAttribute('data-category', project.category);
    card.setAttribute('data-id', project.id);

    if (isAllFilter && !isExpanded && index >= 2) {
      card.classList.add('hidden');
    }

    const catLabels = {
      landing: 'LANDING PAGE // 3D INTERACTIVE',
      fullstack: 'FULL-STACK WEB APP // BESPOKE',
      shopify: 'SHOPIFY & E-COMMERCE // CUSTOM THEME',
      ongoing: 'PROJECTS ON-GOING // ACTIVE SPRINT'
    };
    const catLabelText = catLabels[project.category] || 'PROJECT DELIVERABLE';

    const badgeClasses = {
      landing: 'badge-cyan',
      fullstack: 'badge-violet',
      shopify: 'badge-green',
      ongoing: 'badge-orange'
    };
    const badgeClass = badgeClasses[project.category] || 'badge-cyan';

    const visualClass = project.category === 'landing' ? 'mockup-landing' :
                        project.category === 'fullstack' ? 'mockup-cloud' :
                        project.category === 'shopify' ? 'mockup-store' : 'mockup-dashboard';

    card.innerHTML = `
      ${isAdminAuthenticated() && project.id && project.id.startsWith('project-') ? `
        <button type="button" class="btn-delete-project" data-delete-id="${escapeHTML(project.id)}" title="Delete project (Admin only)">✕ Delete</button>
      ` : ''}
      <div class="project-image-box">
        <div class="project-visual-mockup" style="background: linear-gradient(135deg, rgba(0,210,255,0.08), rgba(123,44,191,0.08));">
          <div class="mockup-screen">
            <div class="mockup-header-bar">
              <span class="mock-dot red"></span>
              <span class="mock-dot yellow"></span>
              <span class="mock-dot green"></span>
              <span class="mock-url">${escapeHTML(project.domain || 'project.skynet.dev')}</span>
            </div>
            <div class="mockup-body ${visualClass}" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:16px;">
              <div class="mock-badge" style="background:rgba(0,180,216,0.15); color:#0077B6; padding:3px 10px; border-radius:9999px; font-size:0.7rem; font-weight:700; margin-bottom:8px;">
                ${project.category === 'ongoing' ? 'ACTIVE BUILD' : 'PRODUCTION READY'}
              </div>
              <div class="mock-title" style="font-size:1.05rem; font-weight:800; color:#0F172A; max-width:240px; line-height:1.2;">
                ${escapeHTML(project.name)}
              </div>
            </div>
          </div>
        </div>
        <div class="project-overlay">
          <button class="btn-case-study" type="button" data-project="${escapeHTML(project.id)}">View Project</button>
        </div>
        <div class="project-metric-badge ${badgeClass}">
          ${escapeHTML(project.metric || '🚀 Production Ready')}
        </div>
      </div>
      <div class="project-info">
        <div class="project-meta-top">
          <span class="project-category">${catLabelText}</span>
          <span class="project-year">${escapeHTML(project.finishTime || '2026')}</span>
        </div>
        <h3 class="project-name">${escapeHTML(project.name)}</h3>
        <p class="project-summary">${escapeHTML(project.summary)}</p>
        <div class="project-tech-tags">
          ${(project.techTags || []).map(tag => `<span class="tech-tag">${escapeHTML(tag)}</span>`).join('')}
        </div>
      </div>
    `;

    // Spotlight cursor tracking
    card.addEventListener('mousemove', (ev) => {
      const rect = card.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    return card;
  }

  function renderPortfolio(filterVal) {
    const activeTab = document.querySelector('.filter-tab.active');
    const currentFilter = filterVal || (activeTab ? activeTab.getAttribute('data-filter') : 'all');
    const projects = getStoredProjects();

    // 1. Dynamic category counts
    const countAllEl = document.getElementById('countAll');
    const countLandingEl = document.getElementById('countLanding');
    const countFullstackEl = document.getElementById('countFullstack');
    const countShopifyEl = document.getElementById('countShopify');
    const countOngoingEl = document.getElementById('countOngoing');

    const landingCount = projects.filter(p => p.category === 'landing').length;
    const fullstackCount = projects.filter(p => p.category === 'fullstack').length;
    const shopifyCount = projects.filter(p => p.category === 'shopify').length;
    const ongoingCount = projects.filter(p => p.category === 'ongoing').length;

    if (countAllEl) countAllEl.textContent = `(${projects.length})`;
    if (countLandingEl) countLandingEl.textContent = `(${landingCount})`;
    if (countFullstackEl) countFullstackEl.textContent = `(${fullstackCount})`;
    if (countShopifyEl) countShopifyEl.textContent = `(${shopifyCount})`;
    if (countOngoingEl) countOngoingEl.textContent = `(${ongoingCount})`;

    if (!projectsGrid) return;

    // 2. Empty state check (when there are 0 projects in storage)
    if (projects.length === 0) {
      if (portfolioEmptyState) {
        portfolioEmptyState.classList.remove('hidden');
        portfolioEmptyState.style.display = 'flex';
      }
      projectsGrid.innerHTML = '';
      if (portfolioShowMoreWrapper) {
        portfolioShowMoreWrapper.style.display = 'none';
      }
      return;
    }

    // Projects exist: hide the empty state placeholder
    if (portfolioEmptyState) {
      portfolioEmptyState.classList.add('hidden');
      portfolioEmptyState.style.display = 'none';
    }

    // 3. Filter projects matching the active tab
    const matching = (currentFilter === 'all')
      ? projects
      : projects.filter(p => p.category === currentFilter);

    projectsGrid.innerHTML = '';

    if (matching.length === 0) {
      const noMatchMsg = document.createElement('div');
      noMatchMsg.className = 'portfolio-category-empty';
      noMatchMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: #64748B; font-family: var(--font-sans); font-size: 1rem; font-weight: 500; background: rgba(255,255,255,0.7); border-radius: 16px; border: 1px dashed rgba(203,213,225,0.8);';
      noMatchMsg.innerHTML = `No projects currently filed under this category. Click <strong>+ Add</strong> above to add one.`;
      projectsGrid.appendChild(noMatchMsg);
      if (portfolioShowMoreWrapper) portfolioShowMoreWrapper.style.display = 'none';
      return;
    }

    const isAll = (currentFilter === 'all');
    matching.forEach((proj, idx) => {
      const cardEl = createProjectCardElement(proj, idx, isAll, isPortfolioExpanded);
      cardEl.style.animation = `fadeUp 0.35s ease forwards ${idx * 0.05}s`;
      projectsGrid.appendChild(cardEl);
    });

    // 4. Update 'Show More' visibility
    if (portfolioShowMoreWrapper) {
      if (isAll && !isPortfolioExpanded && matching.length > 2) {
        portfolioShowMoreWrapper.style.display = 'flex';
      } else {
        portfolioShowMoreWrapper.style.display = 'none';
      }
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterVal = tab.getAttribute('data-filter');
      renderPortfolio(filterVal);
    });
  });

  if (showMoreProjectsBtn) {
    showMoreProjectsBtn.addEventListener('click', () => {
      isPortfolioExpanded = true;
      const activeTab = document.querySelector('.filter-tab.active');
      const activeFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
      renderPortfolio(activeFilter);
      if (portfolioShowMoreWrapper) {
        portfolioShowMoreWrapper.style.display = 'none';
      }
    });
  }

  // Initial render from localStorage (displays empty state if 0 projects)
  renderPortfolio('all');

  // =========================================================================
  // 6B. '+ ADD' PROJECT / ONGOING BUILD MODAL & FORM HANDLER
  // =========================================================================
  const addProjectModal = document.getElementById('addProjectModal');
  const openAddProjectModalBtn = document.getElementById('openAddProjectModalBtn');
  const closeAddProjectBtn = document.getElementById('closeAddProjectBtn');
  const cancelAddProjectBtn = document.getElementById('cancelAddProjectBtn');
  const addProjectForm = document.getElementById('addProjectForm');

  function openAddModal() {
    if (!isAdminAuthenticated()) {
      openAdminAuthModal();
      return;
    }

    if (addProjectModal) {
      if (typeof addProjectModal.showModal === 'function') {
        addProjectModal.showModal();
      } else {
        addProjectModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      const firstInput = document.getElementById('newProjectName');
      if (firstInput) setTimeout(() => firstInput.focus(), 80);
    }
  }

  function closeAddModal() {
    if (addProjectModal) {
      if (typeof addProjectModal.close === 'function') {
        addProjectModal.close();
      } else {
        addProjectModal.removeAttribute('open');
      }
      document.body.style.overflow = '';
      if (addProjectForm) addProjectForm.reset();
    }
  }

  const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
  if (openAddProjectModalBtn) openAddProjectModalBtn.addEventListener('click', openAddModal);
  if (emptyStateAddBtn) emptyStateAddBtn.addEventListener('click', openAddModal);
  if (closeAddProjectBtn) closeAddProjectBtn.addEventListener('click', closeAddModal);
  if (cancelAddProjectBtn) cancelAddProjectBtn.addEventListener('click', closeAddModal);

  // Close on backdrop click
  if (addProjectModal) {
    addProjectModal.addEventListener('click', (e) => {
      const rect = addProjectModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeAddModal();
      }
    });
  }

  // Handle admin deletion of custom projects from portfolio grid
  if (projectsGrid) {
    projectsGrid.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-project');
      if (deleteBtn) {
        e.stopPropagation();
        if (!isAdminAuthenticated()) {
          openAdminAuthModal();
          return;
        }

        const projectId = deleteBtn.getAttribute('data-delete-id');
        if (!projectId) return;

        if (confirm('Are you sure you want to permanently delete this project?')) {
          touchAdminActivity();
          let projects = getStoredProjects();
          projects = projects.filter(p => p.id !== projectId);
          saveStoredProjects(projects);

          const activeTab = document.querySelector('.filter-tab.active');
          const currentFilter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
          renderPortfolio(currentFilter);
          showNotificationToast('✓ Project removed from archive.');
        }
      }
    });
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function showNotificationToast(msg) {
    let toast = document.getElementById('skynetToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'skynetToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0F172A;
        color: #FFFFFF;
        padding: 14px 24px;
        border-radius: 9999px;
        font-family: var(--font-sans);
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3500);
  }

  if (addProjectForm) {
    addProjectForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isAdminAuthenticated()) {
        closeAddModal();
        openAdminAuthModal();
        return;
      }

      touchAdminActivity();

      const rawName = document.getElementById('newProjectName').value.trim();
      const rawCategory = document.getElementById('newProjectCategory').value;
      const rawDomain = document.getElementById('newProjectDomain').value.trim() || 'project.skynet.dev';
      const rawFinishTime = document.getElementById('newProjectFinishTime').value.trim() || 'Active Sprint';
      const rawMetric = document.getElementById('newProjectMetric').value.trim() || '🚀 In Production';
      const rawTechInput = document.getElementById('newProjectTech').value.trim();
      const rawSummary = document.getElementById('newProjectSummary').value.trim();

      const name = sanitizeInput(rawName);
      const category = ['landing', 'fullstack', 'shopify', 'ongoing'].includes(rawCategory) ? rawCategory : 'landing';
      const domain = sanitizeInput(rawDomain);
      const finishTime = sanitizeInput(rawFinishTime);
      const metric = sanitizeInput(rawMetric);
      const summary = sanitizeInput(rawSummary);

      if (!name || !summary) {
        alert('Please provide at least a project title and description.');
        return;
      }

      const techTags = rawTechInput
        ? rawTechInput.split(',').map(t => sanitizeInput(t.trim())).filter(Boolean)
        : ['Next.js 15', 'Full-Stack', 'Tailwind'];

      const newProject = {
        id: `project-${Date.now()}`,
        name,
        category,
        domain,
        finishTime,
        metric,
        techTags,
        summary,
        createdAt: Date.now()
      };

      // Save to localStorage array
      const projects = getStoredProjects();
      projects.unshift(newProject);
      saveStoredProjects(projects);

      // Switch active tab indicator to the newly created project's category
      filterTabs.forEach((t) => {
        const matches = (t.getAttribute('data-filter') === category);
        t.classList.toggle('active', matches);
        t.setAttribute('aria-selected', matches ? 'true' : 'false');
      });

      // Immediately render new project into grid & hide empty state
      renderPortfolio(category);

      closeAddModal();
      showNotificationToast(`✓ "${name}" published to archive successfully!`);
    });
  }

  // =========================================================================
  // 7. CASE STUDY MODAL DIALOG
  // =========================================================================
  const modal = document.getElementById('caseStudyModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalHireBtn = document.getElementById('modalHireBtn');

  // Case Studies Database
  const caseStudiesData = {
    hyperion: {
      category: 'LANDING PAGE // 3D INTERACTIVE',
      metric: '+215% Conversion Boost',
      title: 'Hyperion AI — Generative Cloud Launch',
      lead: 'Designing a modern product launch site that converted over 18,000 waitlist users in 72 hours.',
      challenge: 'Hyperion needed to stand out in a saturated AI SaaS market with an experience that demonstrated their algorithmic speed before users even signed up.',
      solution: 'Constructed an ultra-lightweight Next.js 15 site with custom Three.js shader nodes, dynamic scroll-linked typography, and 0.28s LCP.',
      stats: [
        { num: '18.4K', lbl: 'Waitlist Signups' },
        { num: '100', lbl: 'Performance Score' },
        { num: '0.28s', lbl: 'LCP Load Time' }
      ],
      tech: ['Next.js 15', 'Three.js', 'GSAP', 'Tailwind CSS', 'Vercel Edge']
    },
    strataflow: {
      category: 'FULL-STACK APP // SAAS',
      metric: '99.99% Uptime SLA',
      title: 'StrataFlow — Real-Time Liquidity Hub',
      lead: 'Building a multi-tenant institutional FinTech dashboard handling millions in weekly transactional telemetry.',
      challenge: 'Handling real-time WebSocket market streams without frontend frame drops or UI latency for enterprise traders.',
      solution: 'Engineered a modular React + Node.js architecture with PostgreSQL and Redis caching, delivering 12ms round-trip updates.',
      stats: [
        { num: '$14M+', lbl: 'Volume Processed' },
        { num: '12ms', lbl: 'Average Latency' },
        { num: '99.99%', lbl: 'Uptime Reliability' }
      ],
      tech: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'WebSockets', 'Stripe']
    },
    lumina: {
      category: 'SHOPIFY & E-COMMERCE // CUSTOM THEME',
      metric: '+182% ROAS Uplift',
      title: 'Lumina Apparel — High-Fashion Shopify 2.0',
      lead: 'Transforming a sluggish legacy e-commerce store into a lightning-fast custom Liquid showcase.',
      challenge: 'High cart abandonment (72%) and slow collection filtering leading to lost paid ad revenue.',
      solution: 'Built custom Shopify Liquid 2.0 theme with 1-click slide-cart upsells, sticky buy CTA, and sub-second instant search.',
      stats: [
        { num: '+182%', lbl: 'ROAS Improvement' },
        { num: '3.8%', lbl: 'Conversion Rate' },
        { num: '0.4s', lbl: 'Mobile Filter Speed' }
      ],
      tech: ['Shopify Liquid', 'Vanilla JS', 'Tailwind CSS', 'Klaviyo', 'Recharge API']
    },
    synapse: {
      category: 'FULL-STACK APP // DEVTOOL PORTAL',
      metric: '12ms Global Latency',
      title: 'Synapse Cloud — Edge Deployment Portal',
      lead: 'Empowering engineering teams with instant micro-cluster provisioning and continuous delivery pipelines.',
      challenge: 'Complex serverless management requiring an intuitive, accessible dashboard with real-time log tailing.',
      solution: 'Delivered an intuitive dashboard with FastAPI backend, automated TLS certificates, and live SSE terminal streaming.',
      stats: [
        { num: '24K+', lbl: 'Active Clusters' },
        { num: '12ms', lbl: 'P99 Edge Latency' },
        { num: '4.9/5', lbl: 'Dev Satisfaction' }
      ],
      tech: ['Next.js', 'FastAPI', 'Docker', 'Redis', 'Server-Sent Events']
    },
    vortex: {
      category: 'LANDING PAGE // HARDWARE LAUNCH',
      metric: '100/100 Lighthouse',
      title: 'Vortex Sound — Spatial Audio Hardware',
      lead: 'A sensory digital experience mimicking 360-degree spatial audio acoustics directly through web speakers.',
      challenge: 'Showcasing physical hardware audio technology online with high audio fidelity and smooth visual rendering.',
      solution: 'Implemented Web Audio API frequency analyzers coupled with interactive WebGL particle waves that pulse to sound.',
      stats: [
        { num: '$1.4M', lbl: 'Pre-Order GMV' },
        { num: '100/100', lbl: 'Lighthouse Score' },
        { num: '3.4m', lbl: 'Avg. Time on Page' }
      ],
      tech: ['HTML5', 'Web Audio API', 'WebGL', 'CSS Grid', 'Stripe']
    },
    chronos: {
      category: 'SHOPIFY & E-COMMERCE // LUXURY D2C',
      metric: '$2.8M First Month GMV',
      title: 'Chronos Horology — Swiss Watchmaker Store',
      lead: 'Crafting an ultra-luxury digital showroom with 360-degree 3D watch customizers and private concierge booking.',
      challenge: 'High-ticket items ($4,000+) requiring trust, immaculate presentation, and bespoke concierge integration.',
      solution: 'Developed an exclusive Shopify Plus experience with WebGL model inspection, high-security escrow, and VIP appointment booking.',
      stats: [
        { num: '$2.8M', lbl: 'First Month GMV' },
        { num: '$4,250', lbl: 'Average Order Value' },
        { num: '100%', lbl: 'Zero Security Incidents' }
      ],
      tech: ['Shopify Plus', 'Three.js', 'GraphQL API', 'Calendly API', 'Tailwind']
    }
  };

  // Open Modal logic (Delegated for dynamically rendered cards)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-case-study');
    if (!btn) return;
    e.stopPropagation();

    const projId = btn.getAttribute('data-project');
    const stored = getStoredProjects();
    const customProject = stored.find(p => p.id === projId);

    let data;
    if (customProject) {
      data = {
        category: (customProject.category || 'PROJECT').toUpperCase() + ' // PRODUCTION BUILD',
        metric: customProject.metric || '🚀 Production Ready',
        title: customProject.name,
        lead: customProject.summary,
        challenge: 'Architected and engineered strictly to client deliverables, high-converting UX benchmarks, and sub-second performance standards.',
        solution: customProject.summary,
        stats: [
          { num: '100%', lbl: 'Bespoke Code' },
          { num: '<0.8s', lbl: 'Page Load' },
          { num: '99.9%', lbl: 'Reliability' }
        ],
        tech: customProject.techTags && customProject.techTags.length ? customProject.techTags : ['Next.js 15', 'Full-Stack']
      };
    } else {
      data = caseStudiesData[projId] || caseStudiesData.hyperion;
    }

    const catEl = document.getElementById('modalCategory');
    const metricEl = document.getElementById('modalMetric');
    const titleEl = document.getElementById('modalTitle');
    const leadEl = document.getElementById('modalLead');
    const challEl = document.getElementById('modalChallenge');
    const solEl = document.getElementById('modalSolution');

    if (catEl) catEl.textContent = data.category;
    if (metricEl) metricEl.textContent = data.metric;
    if (titleEl) titleEl.textContent = data.title;
    if (leadEl) leadEl.textContent = data.lead;
    if (challEl) challEl.textContent = data.challenge;
    if (solEl) solEl.textContent = data.solution;

    // Stats
    const statsRow = document.getElementById('modalStatsRow');
    if (statsRow) {
      statsRow.innerHTML = data.stats.map(s => `
        <div class="m-stat-pill">
          <div class="m-stat-num">${s.num}</div>
          <div class="m-stat-lbl">${s.lbl}</div>
        </div>
      `).join('');
    }

    // Tech tags
    const techBox = document.getElementById('modalTechTags');
    if (techBox) {
      techBox.innerHTML = data.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    }

    // Stage visual preview
    const stage = document.getElementById('modalPreviewStage');
    if (stage) {
      stage.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-family: var(--font-mono); color: #0077B6; font-size: 0.82rem; margin-bottom: 8px; font-weight: 700;">
            // VERIFIED PRODUCTION DEPLOYMENT
          </div>
          <h4 style="font-size: 1.3rem; margin-bottom: 6px; color: #0F172A;">${data.title}</h4>
          <span style="display: inline-block; padding: 4px 12px; background: rgba(0, 180, 216, 0.12); border: 1px solid rgba(0, 180, 216, 0.3); border-radius: 9999px; font-size: 0.75rem; font-family: var(--font-mono); color: #0077B6; font-weight: 700;">
            Live Client Environment Verified
          </span>
        </div>
      `;
    }

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
      document.body.style.overflow = 'hidden';
    }
  });

  function closeModal() {
    if (modal && modal.open) {
      modal.close();
      document.body.style.overflow = '';
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);
  if (modalHireBtn) {
    modalHireBtn.addEventListener('click', () => {
      closeModal();
    });
  }

  // Light dismiss on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });
  }

  // =========================================================================
  // 8. DEFAULT CURRENCY (INDIAN RUPEES ₹)
  // =========================================================================
  document.querySelectorAll('.price-val').forEach((priceBox) => {
    const currSpan = priceBox.querySelector('.price-curr');
    const amountSpan = priceBox.querySelector('.price-amount');
    const inrAmount = priceBox.getAttribute('data-inr');
    if (currSpan) currSpan.textContent = '₹';
    if (amountSpan && inrAmount) amountSpan.textContent = inrAmount;
  });

  // =========================================================================
  // 9. INTERACTIVE PRE-SELECTION FROM SERVICES & PRICING
  // =========================================================================
  function preselectServiceInForm(serviceType) {
    // 1. Scroll smoothly to contact
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Map serviceType to one of the 3 pills:
    // "Landing Page", "Full Stack Website", "Shopify & E-Commerce"
    let mappedOption = 'Landing Page';
    if (serviceType) {
      const lower = serviceType.toLowerCase();
      if (lower.includes('full') || lower.includes('stack') || lower.includes('app') || lower.includes('saas')) {
        mappedOption = 'Full Stack Website';
      } else if (lower.includes('shopify') || lower.includes('commerce') || lower.includes('store')) {
        mappedOption = 'Shopify & E-Commerce';
      } else {
        mappedOption = 'Landing Page';
      }
    }

    // 2. Select matching Project Type pill
    const typePills = document.querySelectorAll('#projectTypePills .pill-btn');
    typePills.forEach((pill) => {
      if (pill.getAttribute('data-type') === mappedOption) {
        pill.classList.add('active');
        const hiddenInput = document.getElementById('selectedProjectType');
        if (hiddenInput) hiddenInput.value = mappedOption;
      } else {
        pill.classList.remove('active');
      }
    });

    // 3. Focus on Name input
    setTimeout(() => {
      const clientNameInput = document.getElementById('clientName');
      if (clientNameInput) clientNameInput.focus();
    }, 450);
  }

  // Hook up Bento service buttons
  document.querySelectorAll('.bento-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preselect = btn.getAttribute('data-preselect') || 'Landing Page';
      preselectServiceInForm(preselect);
    });
  });

  // Hook up Pricing CTA "Contact Us" buttons
  document.querySelectorAll('.btn-pricing-cta').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier') || 'Landing Page';
      preselectServiceInForm(tier);
    });
  });

  // Hook up Nav & Hero CTA preselects
  document.querySelectorAll('[data-preselect]').forEach((cta) => {
    if (!cta.classList.contains('bento-action-btn') && !cta.classList.contains('btn-pricing-cta')) {
      cta.addEventListener('click', () => {
        const preselect = cta.getAttribute('data-preselect');
        preselectServiceInForm(preselect);
      });
    }
  });

  // =========================================================================
  // 10. CONTACT FORM PILLS, SECURITY CHECKS & WHATSAPP ROUTING
  // =========================================================================
  const ADMIN_WHATSAPP = "919942351777";
  const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

  function getRemainingCooldown(key) {
    try {
      const last = parseInt(localStorage.getItem(key), 10);
      if (!last || isNaN(last)) return 0;
      const elapsed = Date.now() - last;
      if (elapsed < RATE_LIMIT_COOLDOWN_MS) {
        return Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
      }
    } catch (e) {}
    return 0;
  }

  function setCooldownTimestamp(key) {
    try {
      localStorage.setItem(key, Date.now().toString());
    } catch (e) {}
  }

  const projectTypePills = document.querySelectorAll('#projectTypePills .pill-btn');
  const hiddenProjectType = document.getElementById('selectedProjectType');

  projectTypePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      projectTypePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-type');
      if (hiddenProjectType) hiddenProjectType.value = val;
    });
  });

  let isRoutingToWhatsApp = false;

  function routeLeadToWhatsApp(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (isRoutingToWhatsApp) return;

    // 1. Anti-Bot Honeypot Trap Check
    const hpInput = document.getElementById('contact_hp_website');
    if (hpInput && hpInput.value.trim() !== '') {
      console.warn('Bot submission blocked via honeypot.');
      return;
    }

    const nameInput = document.getElementById('clientName');
    const contactInput = document.getElementById('clientContactNumber');
    const whatsappInput = document.getElementById('clientWhatsappNumber');
    const addressInput = document.getElementById('clientAddress');
    const errorBox = document.getElementById('contactFormError');

    // 2. Client-Side Rate Limiting (60-second cooldown)
    const remainingSec = getRemainingCooldown('skynet_contact_cooldown');
    if (remainingSec > 0) {
      if (errorBox) {
        errorBox.textContent = `Security notice: Please wait ${remainingSec}s before sending another inquiry.`;
        errorBox.style.display = 'block';
      }
      return;
    }

    const activeType = document.querySelector('#projectTypePills .pill-btn.active');
    const selectedOption = activeType ? activeType.getAttribute('data-type') : (hiddenProjectType?.value || 'Landing Page');

    const rawName = nameInput ? nameInput.value.trim() : '';
    const rawContactNumber = contactInput ? contactInput.value.trim() : '';
    const rawWhatsappNumber = whatsappInput ? whatsappInput.value.trim() : '';
    const rawAddress = addressInput ? addressInput.value.trim() : '';

    // Clear previous field error states
    [nameInput, contactInput, whatsappInput, addressInput].forEach((input) => {
      if (input) {
        input.classList.remove('field-error');
        input.addEventListener('input', () => {
          input.classList.remove('field-error');
          if (errorBox) errorBox.style.display = 'none';
        }, { once: true });
      }
    });

    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }

    // Validate that all fields are filled
    const invalidFields = [];
    if (!rawName && nameInput) invalidFields.push(nameInput);
    if (!rawContactNumber && contactInput) invalidFields.push(contactInput);
    if (!rawWhatsappNumber && whatsappInput) invalidFields.push(whatsappInput);
    if (!rawAddress && addressInput) invalidFields.push(addressInput);

    if (invalidFields.length > 0) {
      invalidFields.forEach((field) => field.classList.add('field-error'));
      if (errorBox) {
        errorBox.textContent = 'Please fill in all required fields before proceeding.';
        errorBox.style.display = 'block';
      }
      invalidFields[0].focus();
      return;
    }

    // Validate Indian phone numbers (10 digits starting with 6-9)
    if (!isValidIndianPhone(rawContactNumber)) {
      if (contactInput) contactInput.classList.add('field-error');
      if (errorBox) {
        errorBox.textContent = 'Please enter a valid 10-digit Indian Contact Number (starting with 6-9).';
        errorBox.style.display = 'block';
      }
      if (contactInput) contactInput.focus();
      return;
    }

    if (!isValidIndianPhone(rawWhatsappNumber)) {
      if (whatsappInput) whatsappInput.classList.add('field-error');
      if (errorBox) {
        errorBox.textContent = 'Please enter a valid 10-digit Indian WhatsApp Number (starting with 6-9).';
        errorBox.style.display = 'block';
      }
      if (whatsappInput) whatsappInput.focus();
      return;
    }

    // Sanitize user inputs against XSS and injection
    const cleanName = sanitizeName(rawName);
    const cleanAddress = sanitizeAddress(rawAddress);
    const normalizedContact = normalizeIndianPhone(rawContactNumber);
    const normalizedWhatsapp = normalizeIndianPhone(rawWhatsappNumber);

    if (!cleanName) {
      if (nameInput) nameInput.classList.add('field-error');
      if (errorBox) {
        errorBox.textContent = 'Please enter a valid name using letters and standard characters.';
        errorBox.style.display = 'block';
      }
      if (nameInput) nameInput.focus();
      return;
    }

    // Set rate limit cooldown upon passing validation
    setCooldownTimestamp('skynet_contact_cooldown');

    isRoutingToWhatsApp = true;
    setTimeout(() => {
      isRoutingToWhatsApp = false;
    }, 1500);

    // Dynamically construct the exact message string
    const message = `Hello Skynet Studios! New Project Inquiry:
• Service Needed: ${selectedOption}
• Name: ${cleanName}
• Contact Number: ${normalizedContact}
• WhatsApp Number: ${normalizedWhatsapp}
• Address: ${cleanAddress}`;

    // URL-encode and open WhatsApp chat with rel="noopener noreferrer"
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;

    const newTab = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      window.location.href = whatsappUrl;
    }
  }

  const contactForm = document.getElementById('projectContactForm');
  const submitProjectBtn = document.getElementById('submitProjectBtn');
  const contactWhatsAppBtn = document.getElementById('contactWhatsAppBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', routeLeadToWhatsApp);
  }

  if (submitProjectBtn) {
    submitProjectBtn.addEventListener('click', routeLeadToWhatsApp);
  }

  if (contactWhatsAppBtn) {
    contactWhatsAppBtn.addEventListener('click', routeLeadToWhatsApp);
  }

  // =========================================================================
  // 12. WORKFLOW TIMELINE ACCORDION INTERACTION
  // =========================================================================
  const timelineSteps = document.querySelectorAll('.timeline-step');
  timelineSteps.forEach((step) => {
    step.addEventListener('mouseenter', () => {
      timelineSteps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // =========================================================================
  // 13. INTERSECTION OBSERVER SCROLL REVEALS & ACTIVE NAV
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach((el) => observer.observe(el));

  // Active Nav Link Spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links-desktop .nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').substring(1);
      if (href === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  // =========================================================================
  // 14. FOOTER FEEDBACK & STAR RATING INTERACTION
  // =========================================================================
  const starButtons = document.querySelectorAll('.star-buttons .star-btn');
  const starRatingLabel = document.getElementById('starRatingLabel');
  const hiddenStarRating = document.getElementById('selectedStarRating');
  const feedbackForm = document.getElementById('footerFeedbackForm');
  const feedbackSuccessAlert = document.getElementById('feedbackSuccessAlert');

  const ratingDescriptions = {
    1: '1.0 / 5.0 (Poor)',
    2: '2.0 / 5.0 (Needs Improvement)',
    3: '3.0 / 5.0 (Good)',
    4: '4.0 / 5.0 (Great)',
    5: '5.0 / 5.0 (Exceptional)'
  };

  function setStarRating(rating) {
    if (hiddenStarRating) hiddenStarRating.value = rating;
    starButtons.forEach((btn) => {
      const btnRating = parseInt(btn.getAttribute('data-rating'), 10);
      btn.classList.toggle('active', btnRating <= rating);
    });
    if (starRatingLabel) {
      starRatingLabel.textContent = ratingDescriptions[rating] || `${rating}.0 / 5.0`;
    }
  }

  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.getAttribute('data-rating'), 10);
      setStarRating(rating);
    });

    btn.addEventListener('mouseenter', () => {
      const rating = parseInt(btn.getAttribute('data-rating'), 10);
      starButtons.forEach((b) => {
        const bRating = parseInt(b.getAttribute('data-rating'), 10);
        b.classList.toggle('hovered', bRating <= rating);
      });
    });
  });

  const starRatingWrap = document.getElementById('starRatingWrap');
  if (starRatingWrap) {
    starRatingWrap.addEventListener('mouseleave', () => {
      starButtons.forEach((b) => b.classList.remove('hovered'));
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Anti-Bot Honeypot Trap Check
      const hpFeedback = document.getElementById('feedback_hp_website');
      if (hpFeedback && hpFeedback.value.trim() !== '') {
        console.warn('Bot feedback submission blocked via honeypot.');
        return;
      }

      // 2. Client-Side Rate Limiting (60-second cooldown)
      const remainingFeedbackSec = getRemainingCooldown('skynet_feedback_cooldown');
      if (remainingFeedbackSec > 0) {
        alert(`Security notice: Please wait ${remainingFeedbackSec}s before submitting more feedback.`);
        return;
      }

      const nameInput = document.getElementById('feedbackName');
      const msgInput = document.getElementById('feedbackMessage');
      const rawName = nameInput ? nameInput.value.trim() : '';
      const rawMessage = msgInput ? msgInput.value.trim() : '';
      const rating = hiddenStarRating ? hiddenStarRating.value : '5';

      let hasError = false;
      if (!rawName) {
        if (nameInput) nameInput.classList.add('field-error');
        hasError = true;
      }
      if (!rawMessage) {
        if (msgInput) msgInput.classList.add('field-error');
        hasError = true;
      }

      if (hasError) return;

      // 3. Strict Sanitization
      const name = sanitizeName(rawName) || sanitizeInput(rawName);
      const message = sanitizeInput(rawMessage);

      // Record rate limit timestamp
      setCooldownTimestamp('skynet_feedback_cooldown');

      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('skynet_client_feedback') || '[]');
        stored.push({ name, rating, message, timestamp: new Date().toISOString() });
        localStorage.setItem('skynet_client_feedback', JSON.stringify(stored));
      } catch (err) {
        console.warn('Could not store feedback in localStorage', err);
      }

      // Format WhatsApp pre-fill text
      const waMsg = `Hello Skynet Studios! New Client Feedback:
• Client Name: ${name}
• Star Rating: ${rating}/5 Stars (${ratingDescriptions[rating] || ''})
• Message: ${message}`;
      const waUrl = `https://wa.me/919942351777?text=${encodeURIComponent(waMsg)}`;

      // Show confirmation
      if (feedbackSuccessAlert) {
        feedbackSuccessAlert.innerHTML = `
          <span class="success-icon">✓</span>
          <span>Thank you, <strong>${escapeHTML(name)}</strong>! Your ${escapeHTML(rating)}-star feedback has been recorded.</span>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="feedback-wa-link">Share on WhatsApp →</a>
        `;
        feedbackSuccessAlert.style.display = 'flex';
      }

      // Reset fields
      if (nameInput) nameInput.value = '';
      if (msgInput) msgInput.value = '';
      setStarRating(5);
    });

    const nameInput = document.getElementById('feedbackName');
    const msgInput = document.getElementById('feedbackMessage');
    if (nameInput) {
      nameInput.addEventListener('input', () => nameInput.classList.remove('field-error'));
    }
    if (msgInput) {
      msgInput.addEventListener('input', () => msgInput.classList.remove('field-error'));
    }
  }

  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

    // =========================================================================
  // 15. MULTICOLORED AURORA CANVAS (Base Layer)
  // Soft, organic, slowly morphing gradient orbs in vibrant professional tones:
  // cyan (#00D2FF), royal violet (#7B2CBF), warm coral-pink (#FF4D8D),
  // fresh emerald (#10B981), soft amber (#F59E0B) over off-white pearl (#F8FAFC)
  // =========================================================================
  const auroraCanvas = document.getElementById('auroraCanvas');
  const gridCanvas = document.getElementById('gridCanvas');

  // Aurora Canvas Engine
  if (auroraCanvas && auroraCanvas.getContext) {
    const ctx = auroraCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeAurora() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      auroraCanvas.width = width * dpr;
      auroraCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeAurora();
    window.addEventListener('resize', resizeAurora, { passive: true });

    // Organic morphing orbs in vibrant tones
    const orbs = [
      {
        baseX: 0.16, baseY: 0.18, rad: 520,
        r: 0, g: 210, b: 255, alpha: 0.40, // Cyan (#00D2FF)
        speedX: 0.42, speedY: 0.32, phaseX: 0.2, phaseY: 1.2,
        ampX: 130, ampY: 90
      },
      {
        baseX: 0.84, baseY: 0.16, rad: 560,
        r: 123, g: 44, b: 191, alpha: 0.36, // Royal Violet (#7B2CBF)
        speedX: 0.36, speedY: 0.44, phaseX: 2.5, phaseY: 0.8,
        ampX: 150, ampY: 110
      },
      {
        baseX: 0.48, baseY: 0.76, rad: 520,
        r: 255, g: 77, b: 141, alpha: 0.32, // Warm Coral-Pink (#FF4D8D)
        speedX: 0.48, speedY: 0.34, phaseX: 4.1, phaseY: 2.8,
        ampX: 140, ampY: 130
      },
      {
        baseX: 0.10, baseY: 0.82, rad: 480,
        r: 16, g: 185, b: 129, alpha: 0.28, // Fresh Emerald (#10B981)
        speedX: 0.32, speedY: 0.40, phaseX: 1.4, phaseY: 3.4,
        ampX: 110, ampY: 100
      },
      {
        baseX: 0.90, baseY: 0.84, rad: 500,
        r: 245, g: 158, b: 11, alpha: 0.30, // Soft Amber (#F59E0B)
        speedX: 0.44, speedY: 0.38, phaseX: 3.7, phaseY: 4.2,
        ampX: 140, ampY: 120
      }
    ];

    let t = 0;
    function renderAurora() {
      t += 0.007;

      // Fill off-white pearl base (#F8FAFC)
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Render morphing orbs
      orbs.forEach((orb) => {
        const driftX = Math.sin(t * orb.speedX + orb.phaseX) * orb.ampX;
        const driftY = Math.cos(t * orb.speedY + orb.phaseY) * orb.ampY;

        const x = width * orb.baseX + driftX;
        const y = height * orb.baseY + driftY;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.rad);
        grad.addColorStop(0, 'rgba(' + orb.r + ',' + orb.g + ',' + orb.b + ',' + orb.alpha + ')');
        grad.addColorStop(0.45, 'rgba(' + orb.r + ',' + orb.g + ',' + orb.b + ',' + (orb.alpha * 0.48) + ')');
        grad.addColorStop(0.75, 'rgba(' + orb.r + ',' + orb.g + ',' + orb.b + ',' + (orb.alpha * 0.12) + ')');
        grad.addColorStop(1, 'rgba(' + orb.r + ',' + orb.g + ',' + orb.b + ',0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, orb.rad, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    window._renderAurora = renderAurora;
  }

  // =========================================================================
  // 16. ARCHITECTURAL GRID BACKGROUND (Middle Layer, Static)
  // Clean, subtle base grid lines and intersection dots with native cursor.
  // =========================================================================
  if (gridCanvas && gridCanvas.getContext) {
    const ctx = gridCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    const spacing = 52;

    function renderGrid() {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      // 1. Base architectural grid lines
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = c * spacing;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * spacing;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.038)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Base intersection dots
      ctx.fillStyle = 'rgba(15, 23, 42, 0.065)';
      for (let c = 0; c <= cols; c++) {
        const x = c * spacing;
        for (let r = 0; r <= rows; r++) {
          const y = r * spacing;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function resizeGrid() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      gridCanvas.width = width * dpr;
      gridCanvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      renderGrid();
    }
    resizeGrid();
    window.addEventListener('resize', resizeGrid, { passive: true });
  }

  // Central 60fps Animation Loop
  function masterBackgroundLoop() {
    if (window._renderAurora) {
      window._renderAurora();
    }

    requestAnimationFrame(masterBackgroundLoop);
  }

  requestAnimationFrame(masterBackgroundLoop);
});
