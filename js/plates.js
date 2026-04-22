// ============================================================
// PLATES PAGE - js/plates.js
// Shows all Build a Plate batch recipes with filtering and search.
// Depends on js/shared.js for: CONFIG, state, storage, esc,
// capitalize, navigateTo, renderDesktopSidebar, renderBottomNav,
// getAppShellClass, getBatchRecipeById, getBatchCoverPhoto,
// getBatchEffortLevel, renderEffortPill, loadAllState
// ============================================================

// Page-local filter state
let platesSearchTerm = '';
let platesPrimaryFilter = 'all';

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

function openBatchRecipeView(batchId) {
  state.batchViewId = batchId;
  state.batchComponentIndex = 0;
  state.batchVideoIndex = 0;
  // Navigate to recipes page which has the batch-view renderer
  sessionStorage.setItem('yummy_target_view', 'batch-view');
  window.location.href = '/recipes.html';
}

function openNewBatchRecipe() {
  sessionStorage.setItem('yummy_target_view', 'batch-edit');
  window.location.href = '/recipes.html';
}

function renderPlates() {
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
      <!-- Page title + new plate button (mobile) -->
      <div class="mobile-only-sections" style="padding: 12px 12px 0; display: flex; align-items: center; justify-content: space-between;">
        <h1 style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">My Plates</h1>
        <button onclick="openNewBatchRecipe()"
          style="padding: 8px 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;">
          + Build a Plate
        </button>
      </div>

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

      <!-- + Build a Plate button (desktop, below filters) -->
      <div style="padding: 4px 12px 8px;">
        <button onclick="openNewBatchRecipe()"
          style="display: none; width: 100%; padding: 10px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.primary_action_color}; border: 1px solid rgba(232,93,93,0.2); border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;"
          class="desktop-only-btn">
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
        <div class="plates-grid">
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

// Load state and set up
loadAllState();
setupKeyboardShortcuts();

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="${getAppShellClass()}">
      ${renderDesktopSidebar()}
      <div class="desktop-content-area">
        <div class="desktop-page-title-bar" style="display: none; padding-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h1 style="font-size: 28px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">My Plates</h1>
            <button onclick="openNewBatchRecipe()"
              style="padding: 8px 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
              + Build a Plate
            </button>
          </div>
        </div>
        ${renderPlates()}
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

render();
