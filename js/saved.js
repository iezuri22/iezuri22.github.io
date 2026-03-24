// ============================================================
// SAVED RECIPES PAGE - js/saved.js
// Shows bookmarked/saved recipes with filtering and search.
// Depends on js/shared.js for: CONFIG, state, storage, esc,
// capitalize, navigateTo, renderDesktopSidebar, renderBottomNav,
// getAppShellClass, getSavedRecipes, isRecipeSaved, toggleSaveRecipe,
// recipeThumb, getRecipeById, renderEffortPill, getRecipeEffort,
// openRecipeView, loadAllState, recipeIngList, EFFORT_LEVELS
// ============================================================

// Page-local filter state
let savedSearchTerm = '';
let savedPrimaryFilter = 'all';

function handleSavedSearch(value) {
  savedSearchTerm = value;
  render();
  setTimeout(() => {
    const input = document.getElementById('savedSearchInput');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }, 0);
}

function setSavedFilter(filter) {
  savedPrimaryFilter = filter;
  render();
}

function renderSavedRecipes() {
  const savedIds = getSavedRecipes();

  // Get all saved recipe objects
  let list = savedIds.map(id => getRecipeById(id)).filter(r => r && !r.isDraft && !r.isTip);

  // Apply primary filter
  if (['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(savedPrimaryFilter)) {
    list = list.filter(r => (r.category || '') === savedPrimaryFilter);
  }

  // Apply effort filters
  const effortFilters = ['lazy', 'moderate', 'timely'];
  if (effortFilters.includes(savedPrimaryFilter)) {
    list = list.filter(r => {
      const effort = getRecipeEffort(r.__backendId || r.id);
      return effort === savedPrimaryFilter;
    });
  }

  // Apply search
  if (savedSearchTerm) {
    const sl = savedSearchTerm.toLowerCase();
    list = list.filter(r => {
      if ((r.title || '').toLowerCase().includes(sl)) return true;
      const ingredients = recipeIngList(r);
      return ingredients.some(ing => (ing.name || '').toLowerCase().includes(sl));
    });
  }

  // Filter pills
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Breakfast', label: 'Breakfast' },
    { id: 'Lunch', label: 'Lunch' },
    { id: 'Dinner', label: 'Dinner' },
    { id: 'Snack', label: 'Snack' },
    { id: 'lazy', label: 'Lazy' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'timely', label: 'Timely' }
  ];

  const filterRow = filters.map(f => {
    const active = savedPrimaryFilter === f.id;
    return `<button onclick="setSavedFilter('${f.id}')"
      style="flex-shrink:0; padding:8px 16px; border-radius:20px; border:none;
      background:${active ? CONFIG.primary_action_color : 'transparent'};
      color:${active ? 'white' : CONFIG.text_muted};
      font-size:13px; font-weight:${active ? '600' : '500'}; cursor:pointer; white-space:nowrap;">
      ${f.label}</button>`;
  }).join('');

  return `
    <div style="padding: 0; max-width: 100%; overflow-x: hidden;">
      <!-- Page title (mobile) -->
      <div class="mobile-only-sections" style="padding: 12px 12px 0;">
        <h1 style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">Saved Recipes</h1>
      </div>

      <!-- Search bar -->
      <div style="padding: 8px 12px 0;">
        <div style="position:relative;">
          <input id="savedSearchInput" type="text" placeholder="Search saved recipes..."
            value="${esc(savedSearchTerm)}"
            oninput="handleSavedSearch(this.value)"
            style="width:100%; height:40px; padding:0 36px 0 12px; box-sizing:border-box;
            background:${CONFIG.surface_color}; color:${CONFIG.text_color};
            border:1px solid rgba(255,255,255,0.08); border-radius:10px;
            font-size:14px; font-family:${CONFIG.font_family};" />
          ${savedSearchTerm ? `
            <button onclick="savedSearchTerm=''; render(); setTimeout(() => { const i = document.getElementById('savedSearchInput'); if(i) i.focus(); }, 0);"
              style="position:absolute; right:8px; top:50%; transform:translateY(-50%);
              background:rgba(255,255,255,0.1); border:none; border-radius:50%;
              width:20px; height:20px; display:flex; align-items:center; justify-content:center;
              color:${CONFIG.text_muted}; cursor:pointer; padding:0;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          ` : `
            <div style="position:absolute; right:10px; top:50%; transform:translateY(-50%); color:${CONFIG.text_tertiary};">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            </div>
          `}
        </div>
      </div>

      <!-- Filter pills -->
      <div style="display:flex; gap:6px; overflow-x:auto; padding:8px 12px 6px; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${filterRow}
      </div>

      <!-- Results -->
      ${list.length === 0 ? `
        <div style="padding: 48px 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
          </div>
          <div style="font-size: 14px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 4px;">
            ${savedSearchTerm ? 'No matches found' : 'No saved recipes yet'}
          </div>
          <div style="font-size: 12px; color: ${CONFIG.text_muted};">
            ${savedSearchTerm ? 'Try a different search' : 'Bookmark recipes to see them here.'}
          </div>
        </div>
      ` : `
        <div class="saved-grid">
          ${list.map(r => {
            const id = r.__backendId || r.id;
            const img = recipeThumb(r);
            const effort = getRecipeEffort(id);
            return `
            <div style="position: relative; cursor: pointer; overflow: hidden; border-radius: 8px;">
              <div onclick="openRecipeView('${id}')">
                ${img ? `
                  <div style="aspect-ratio:1; width:100%; overflow:hidden;">
                    <img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
                ` : `
                  <div style="aspect-ratio:1; width:100%; background:${CONFIG.surface_color}; display:flex; align-items:center; justify-content:center; padding:12px;">
                    <span style="color:${CONFIG.text_color}; font-size:12px; font-weight:600; text-align:center; -webkit-line-clamp:3; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden;">${esc(r.title)}</span>
                  </div>
                `}
              </div>
              ${effort ? `<div style="position:absolute; top:4px; left:4px; z-index:2;">${renderEffortPill(effort, 'sm')}</div>` : ''}
              <button onclick="event.stopPropagation(); toggleSaveRecipe('${id}'); render();"
                style="position: absolute; top: 4px; right: 4px; z-index: 2; width: 24px; height: 24px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); color: ${CONFIG.primary_action_color}; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                <svg width="12" height="12" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
              </button>
              <div style="padding:6px; background:${CONFIG.background_color};" onclick="openRecipeView('${id}')">
                <div style="color:${CONFIG.text_color}; font-size:11px; font-weight:600; -webkit-line-clamp:2; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3;">
                  ${esc(r.title)}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

// Load state and set up
loadAllState();
setupKeyboardShortcuts();

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      <div class="desktop-content-area">
        <div class="desktop-page-title-bar" style="display: none; padding-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">Saved Recipes</h1>
        </div>
        ${renderSavedRecipes()}
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

render();
