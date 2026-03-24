// ============================================================
// SAVED PAGE - js/saved.js
// Combined view: Saved Recipes + Plates (Build a Plate) + Cooking Journal (photo gallery)
// Depends on js/shared.js for: CONFIG, state, storage, esc,
// capitalize, navigateTo, renderDesktopSidebar, renderBottomNav,
// getAppShellClass, getSavedRecipes, isRecipeSaved, toggleSaveRecipe,
// recipeThumb, getRecipeById, renderEffortPill, getRecipeEffort,
// openRecipeView, loadAllState, recipeIngList, EFFORT_LEVELS,
// getFoodLog, getFoodLogDateLabel, getToday, openModal, closeModal,
// showToast, getBatchCoverPhoto, getBatchEffortLevel
// ============================================================

// Page-local state
let savedActiveTab = 'recipes'; // 'recipes', 'plates', or 'journal'
let savedSearchTerm = '';
let savedPrimaryFilter = 'all';

// Plates tab local state
let platesSearchTerm = '';
let platesPrimaryFilter = 'all';

function setSavedTab(tab) {
  savedActiveTab = tab;
  render();
}

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

function handlePlatesSearch(value) {
  platesSearchTerm = value;
  render();
  setTimeout(() => {
    const input = document.getElementById('platesSearchInput');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }, 0);
}

function setPlatesFilter(filter) {
  platesPrimaryFilter = filter;
  render();
}

// ============================================================
// TAB TOGGLE
// ============================================================
function renderSavedTabs() {
  const tabs = [
    { id: 'recipes', label: 'Saved Recipes' },
    { id: 'plates', label: 'Plates' },
    { id: 'journal', label: 'Cooking Journal' }
  ];
  return `
    <div style="display: flex; gap: 4px; padding: 8px 12px; background: ${CONFIG.background_color};">
      ${tabs.map(t => `
        <button onclick="setSavedTab('${t.id}')"
          style="flex: 1; padding: 8px 0; border-radius: 20px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: ${CONFIG.font_family};
          background: ${savedActiveTab === t.id ? CONFIG.primary_action_color : CONFIG.surface_color};
          color: ${savedActiveTab === t.id ? 'white' : CONFIG.text_muted};">
          ${t.label}
        </button>
      `).join('')}
    </div>
  `;
}

// ============================================================
// SAVED RECIPES TAB
// ============================================================
function renderSavedRecipes() {
  const savedIds = getSavedRecipes();
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

// ============================================================
// PLATES TAB - Build a Plate compilations
// ============================================================
function openBatchRecipeView(batchId) {
  state.batchViewId = batchId;
  state.batchComponentIndex = 0;
  state.batchVideoIndex = 0;
  sessionStorage.setItem('yummy_target_view', 'batch-view');
  window.location.href = '/recipes.html';
}

function openNewBatchRecipe() {
  sessionStorage.setItem('yummy_target_view', 'batch-edit');
  window.location.href = '/recipes.html';
}

function renderPlatesTab() {
  let list = state.batchRecipes || [];

  // Apply primary filter
  if (['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(platesPrimaryFilter)) {
    list = list.filter(b => capitalize(b.mealType || '') === platesPrimaryFilter);
  }

  // Apply search
  if (platesSearchTerm) {
    const sl = platesSearchTerm.toLowerCase();
    list = list.filter(b => (b.name || '').toLowerCase().includes(sl));
  }

  // Filter pills
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Breakfast', label: 'Breakfast' },
    { id: 'Lunch', label: 'Lunch' },
    { id: 'Dinner', label: 'Dinner' },
    { id: 'Snack', label: 'Snack' }
  ];

  const filterRow = filters.map(f => {
    const active = platesPrimaryFilter === f.id;
    return `<button onclick="setPlatesFilter('${f.id}')"
      style="flex-shrink:0; padding:8px 16px; border-radius:20px; border:none;
      background:${active ? CONFIG.primary_action_color : 'transparent'};
      color:${active ? 'white' : CONFIG.text_muted};
      font-size:13px; font-weight:${active ? '600' : '500'}; cursor:pointer; white-space:nowrap;">
      ${f.label}</button>`;
  }).join('');

  return `
    <div style="padding: 0; max-width: 100%; overflow-x: hidden;">
      <!-- Search bar -->
      <div style="padding: 8px 12px 0;">
        <div style="position:relative;">
          <input id="platesSearchInput" type="text" placeholder="Search plates..."
            value="${esc(platesSearchTerm)}"
            oninput="handlePlatesSearch(this.value)"
            style="width:100%; height:40px; padding:0 36px 0 12px; box-sizing:border-box;
            background:${CONFIG.surface_color}; color:${CONFIG.text_color};
            border:1px solid rgba(255,255,255,0.08); border-radius:10px;
            font-size:14px; font-family:${CONFIG.font_family};" />
          ${platesSearchTerm ? `
            <button onclick="platesSearchTerm=''; render(); setTimeout(() => { const i = document.getElementById('platesSearchInput'); if(i) i.focus(); }, 0);"
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

      <!-- + Build a Plate button -->
      <div style="padding: 4px 12px 8px;">
        <button onclick="openNewBatchRecipe()"
          style="width: 100%; padding: 10px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.primary_action_color}; border: 1px solid rgba(232,93,93,0.2); border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
          + Build a Plate
        </button>
      </div>

      <!-- Results -->
      ${list.length === 0 ? `
        <div style="padding: 48px 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>
          </div>
          <div style="font-size: 14px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 4px;">
            ${platesSearchTerm ? 'No matches found' : 'No plates yet'}
          </div>
          <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-bottom: 12px;">
            ${platesSearchTerm ? 'Try a different search' : 'Combine recipes into one meal.'}
          </div>
          ${!platesSearchTerm ? `
            <button onclick="openNewBatchRecipe()" style="padding: 8px 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
              + Build a Plate
            </button>
          ` : ''}
        </div>
      ` : `
        <div class="build-plates-grid">
          ${list.map(b => {
            const bImg = getBatchCoverPhoto(b);
            const compCount = (b.components || []).length;
            const effort = getBatchEffortLevel(b);
            return `
            <div style="position:relative; cursor:pointer; overflow:hidden; border-radius: 12px; background: ${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};" onclick="openBatchRecipeView('${b.id}')">
              ${bImg ? `
                <div style="aspect-ratio:1; width:100%; overflow:hidden;">
                  <img loading="lazy" src="${esc(bImg)}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
              ` : `
                <div style="aspect-ratio:1; width:100%; background:${CONFIG.surface_elevated}; display:flex; align-items:center; justify-content:center; padding:12px;">
                  <span style="color:${CONFIG.text_color}; font-size:14px; font-weight:600; text-align:center; -webkit-line-clamp:3; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden;">${esc(b.name)}</span>
                </div>
              `}
              <!-- Stacked cards badge -->
              <div style="position:absolute; top:6px; left:6px; z-index:2; display:flex; gap:4px; align-items:center;">
                <div style="width:22px; height:22px; border-radius:5px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
                  <svg width="14" height="14" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>
                </div>
              </div>
              <div style="padding:10px;">
                <div style="color:${CONFIG.text_color}; font-size:13px; font-weight:600; -webkit-line-clamp:2; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3; margin-bottom:6px;">
                  ${esc(b.name)}
                </div>
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                  <span style="font-size:11px; color:${CONFIG.text_muted};">${compCount} recipe${compCount !== 1 ? 's' : ''}</span>
                  ${b.mealType ? `<span style="font-size:10px; padding:2px 8px; border-radius:10px; background:rgba(255,255,255,0.06); color:${CONFIG.text_muted}; font-weight:500;">${capitalize(b.mealType)}</span>` : ''}
                  ${effort ? renderEffortPill(effort, 'sm') : ''}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

// ============================================================
// COOKING JOURNAL TAB - Photo Gallery
// ============================================================
function renderCookingJournal() {
  const log = getFoodLog();
  const photosEntries = log.filter(e => {
    if (e.myPhoto) return true;
    if (e.photo && e.photo.startsWith('data:')) return true;
    return false;
  });

  if (photosEntries.length === 0) {
    return `
      <div style="padding: ${CONFIG.space_md}; padding-bottom: 80px; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="padding: ${CONFIG.space_2xl} ${CONFIG.space_md};">
          <div style="font-size: 48px; opacity: 0.3; margin-bottom: ${CONFIG.space_md};">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          </div>
          <div style="color: ${CONFIG.text_color}; font-size: 18px; font-weight: 600; margin-bottom: ${CONFIG.space_sm};">No photos yet</div>
          <div style="color: ${CONFIG.text_muted}; font-size: 14px;">Your cooking photos will appear here.<br>Add photos when logging meals!</div>
        </div>
      </div>
    `;
  }

  // Group by meal type in order
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const grouped = {};
  photosEntries.forEach(e => {
    const mt = (e.mealType || 'dinner').toLowerCase();
    if (!grouped[mt]) grouped[mt] = [];
    grouped[mt].push({
      id: e.id,
      photo: e.myPhoto || e.photo,
      recipeName: e.recipeName || 'Unknown',
      mealType: mt,
      date: e.dateCooked?.split('T')[0] || '',
      dateLabel: getFoodLogDateLabel(e.dateCooked?.split('T')[0] || getToday())
    });
  });

  // Collapsed state from localStorage
  const collapsedState = JSON.parse(localStorage.getItem('myPlatesCollapsed') || '{}');

  const sections = mealOrder
    .filter(mt => grouped[mt] && grouped[mt].length > 0)
    .map(mt => {
      const photos = grouped[mt];
      const count = photos.length;
      const label = capitalize(mt);
      const isCollapsed = collapsedState[mt] === true;

      return `
        <div style="margin-bottom: ${CONFIG.space_md};">
          <div onclick="toggleJournalSection('${mt}')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px ${CONFIG.space_md}; cursor: pointer; -webkit-tap-highlight-color: transparent;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px; font-weight: 700; color: ${CONFIG.text_color};">${label}</span>
              <span style="font-size: 13px; color: ${CONFIG.text_muted};">&middot; ${count} photo${count !== 1 ? 's' : ''}</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="2" viewBox="0 0 24 24" style="transition: transform 0.2s; transform: rotate(${isCollapsed ? '-90deg' : '0deg'});">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          ${isCollapsed ? '' : `
            <div class="journal-grid">
              ${photos.map(p => `
                <div onclick="showJournalFullscreen('${p.id}')" style="cursor: pointer;">
                  <div style="aspect-ratio: 1; overflow: hidden; position: relative;">
                    <img src="${esc(p.photo)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                  </div>
                  <div style="padding: 4px 4px 8px; font-size: 12px; font-weight: 600; color: ${CONFIG.text_color}; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${esc(p.recipeName)}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }).join('');

  return `
    <div style="padding: 0; padding-bottom: 80px; max-width: 600px; margin: 0 auto;">
      ${sections}
    </div>
  `;
}

function toggleJournalSection(mealType) {
  const collapsedState = JSON.parse(localStorage.getItem('myPlatesCollapsed') || '{}');
  collapsedState[mealType] = !collapsedState[mealType];
  localStorage.setItem('myPlatesCollapsed', JSON.stringify(collapsedState));
  render();
}

// Keep old name as alias for backward compat (my-meals.js uses it)
function togglePlatesSection(mealType) { toggleJournalSection(mealType); }

function showJournalFullscreen(logId) {
  const log = getFoodLog();
  const entry = log.find(e => e.id === logId);
  if (!entry) return;
  const photo = entry.myPhoto || entry.photo;
  const dateLabel = getFoodLogDateLabel(entry.dateCooked?.split('T')[0] || getToday());

  // Find all photos for same recipe
  const sameName = log.filter(e =>
    (e.recipeName || '').toLowerCase().trim() === (entry.recipeName || '').toLowerCase().trim() &&
    (e.myPhoto || (e.photo && e.photo.startsWith('data:')))
  );
  const hasMultiple = sameName.length > 1;
  const coverPrefs = JSON.parse(localStorage.getItem('myPlatesCovers') || '{}');
  const coverKey = (entry.recipeName || '').toLowerCase().trim();
  const isCover = coverPrefs[coverKey] === logId;

  // Per-photo notes
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  const existingNote = photoNotes[logId] || '';

  // Recipe link button
  const hasRecipeLink = !!entry.recipeId;

  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <div style="width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: ${CONFIG.space_md}; background: ${CONFIG.surface_elevated};">
        <img src="${esc(photo)}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${esc(entry.recipeName)}</div>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: 4px;">${dateLabel}</div>
      <div style="font-size: 12px; color: ${CONFIG.text_tertiary}; margin-bottom: ${CONFIG.space_md};">${capitalize(entry.mealType || 'meal')}</div>

      <!-- Notes section -->
      <div id="journalNoteSection" style="text-align: left; margin-bottom: ${CONFIG.space_md}; padding: ${CONFIG.space_sm} 0;">
        ${existingNote ? `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
            <div id="journalNoteDisplay" style="font-size: 14px; color: ${CONFIG.text_muted}; line-height: 1.4; flex: 1;">${esc(existingNote)}</div>
            <button onclick="editJournalNote('${logId}')" style="background: none; border: none; cursor: pointer; padding: 4px; flex-shrink: 0;">
              <svg width="14" height="14" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
            </button>
          </div>
        ` : `
          <div onclick="editJournalNote('${logId}')" style="font-size: 14px; color: ${CONFIG.text_muted}; cursor: pointer; padding: 8px 0;">+ Add a note</div>
        `}
      </div>

      ${hasRecipeLink ? `
        <button onclick="closeModal(); openRecipeView('${entry.recipeId}')"
          style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; font-size: 14px; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          View recipe <span style="font-size: 16px;">&rarr;</span>
        </button>
      ` : ''}
      ${hasMultiple ? `
        <button onclick="setAsCoverPhoto('${logId}', '${esc(coverKey)}')"
          style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid ${isCover ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; background: ${isCover ? 'rgba(232,93,93,0.15)' : CONFIG.surface_elevated}; color: ${isCover ? CONFIG.primary_action_color : CONFIG.text_color}; font-size: 14px; cursor: pointer; margin-bottom: 8px;">
          ${isCover ? 'Cover photo' : 'Set as cover'}
        </button>
      ` : ''}
      <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    </div>
  `);
}

// Keep old name as alias for backward compat (my-meals.js uses it)
function showPlateFullscreen(logId) { showJournalFullscreen(logId); }

function editJournalNote(logId) {
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  const existingNote = photoNotes[logId] || '';
  const section = document.getElementById('journalNoteSection');
  if (!section) return;

  section.innerHTML = `
    <textarea id="journalNoteInput" rows="3" placeholder="Add a note about this meal..."
      style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family}; line-height: 1.4;">${esc(existingNote)}</textarea>
    <div style="display: flex; gap: 8px; margin-top: 8px;">
      <button onclick="saveJournalNote('${logId}')"
        style="flex: 1; padding: 10px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Save</button>
      <button onclick="showJournalFullscreen('${logId}')"
        style="padding: 10px 16px; background: transparent; color: ${CONFIG.text_muted}; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; cursor: pointer;">Cancel</button>
    </div>
  `;
  const input = document.getElementById('journalNoteInput');
  if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
}

// Keep old name as alias for backward compat (my-meals.js uses it)
function editPlateNote(logId) { editJournalNote(logId); }

function saveJournalNote(logId) {
  const input = document.getElementById('journalNoteInput');
  if (!input) return;
  const note = input.value.trim();
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  if (note) {
    photoNotes[logId] = note;
  } else {
    delete photoNotes[logId];
  }
  localStorage.setItem('myPlatesNotes', JSON.stringify(photoNotes));
  showToast('Note saved!', 'success');
  showJournalFullscreen(logId);
}

// Keep old name as alias for backward compat (my-meals.js uses it)
function savePlateNote(logId) { saveJournalNote(logId); }

function setAsCoverPhoto(logId, coverKey) {
  const coverPrefs = JSON.parse(localStorage.getItem('myPlatesCovers') || '{}');
  coverPrefs[coverKey] = logId;
  localStorage.setItem('myPlatesCovers', JSON.stringify(coverPrefs));
  showToast('Set as cover photo!', 'success');
  closeModal();
}

// ============================================================
// INIT & RENDER
// ============================================================
loadAllState();
setupKeyboardShortcuts();

// Check if navigated here with tab hint
(function() {
  const hint = sessionStorage.getItem('savedPageTab');
  if (hint === 'journal') {
    savedActiveTab = 'journal';
    sessionStorage.removeItem('savedPageTab');
  } else if (hint === 'plates') {
    savedActiveTab = 'plates';
    sessionStorage.removeItem('savedPageTab');
  }
})();

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const pageTitles = { 'recipes': 'Saved', 'plates': 'Saved', 'journal': 'Saved' };
  const pageTitle = pageTitles[savedActiveTab] || 'Saved';

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      <div class="desktop-content-area">
        <div class="desktop-page-title-bar" style="display: none; padding-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">${pageTitle}</h1>
        </div>
        <!-- Mobile title -->
        <div class="mobile-only-sections" style="padding: 12px 12px 0;">
          <h1 style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">${pageTitle}</h1>
        </div>
        ${renderSavedTabs()}
        ${savedActiveTab === 'journal' ? renderCookingJournal() : savedActiveTab === 'plates' ? renderPlatesTab() : renderSavedRecipes()}
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

render();
