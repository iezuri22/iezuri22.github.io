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
// Saved Recipes & Plates have moved to the Recipes feed — this page is now the Cooking Journal
let savedActiveTab = 'journal'; // Now always 'journal'
let savedSearchTerm = '';
let savedPrimaryFilter = 'all';

// Plates tab local state
let platesSearchTerm = '';
let platesPrimaryFilter = 'all';

// Journal tab local state
let journalSearchTerm = '';
let journalFilterMealType = 'all';

function handleJournalSearch(value) {
  journalSearchTerm = value;
  render();
  setTimeout(() => {
    const input = document.getElementById('journalSearchInput');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }, 0);
}

function setJournalFilter(filter) {
  journalFilterMealType = filter;
  render();
}

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
        <div class="recipes-photo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px;">
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
// Plate detail state
let plateDetailId = null;
let plateDetailCompIdx = 0;

function openBatchRecipeView(batchId) {
  plateDetailId = batchId;
  plateDetailCompIdx = 0;
  render();
}

function closePlateDetail() {
  plateDetailId = null;
  plateDetailCompIdx = 0;
  render();
}

function setPlateDetailComp(idx) {
  plateDetailCompIdx = idx;
  render();
}

function renderPlateDetail() {
  const batch = getBatchRecipeById(plateDetailId);
  if (!batch) { closePlateDetail(); return ''; }

  const comps = batch.components || [];
  const idx = plateDetailCompIdx;
  const comp = comps[idx];
  const allIngs = getBatchRecipeIngredients(batch);
  const totalTime = getBatchTotalTime(batch);

  // Get component details
  let compName = '', compImg = '', compIngs = [], compInstructions = '', compNotes = '';
  if (comp) {
    if (comp.type === 'recipe' && comp.recipeId) {
      const r = getRecipeById(comp.recipeId);
      if (r) {
        compName = r.title;
        compImg = recipeThumb(r) || '';
        compIngs = recipeIngList(r);
        compInstructions = r.instructions || '';
      }
    } else {
      compName = comp.name || 'Freeform';
      compImg = comp.photo || '';
      compIngs = (comp.ingredients || []).map(n => ({ qty: '', unit: '', name: n, group: 'Other' }));
      compInstructions = comp.instructions || '';
    }
    compNotes = comp.notes || '';
  }
  const steps = compInstructions ? compInstructions.split('\n').filter(s => s.trim()) : [];
  const hasVideos = typeof getBatchVideoSequence === 'function' && getBatchVideoSequence(batch).length > 0;

  return `
    <div style="padding: 0; padding-bottom: 80px; max-width: 100%; overflow-x: hidden;">
      <!-- Back button + title -->
      <div style="display:flex; align-items:center; gap:10px; padding:12px;">
        <button onclick="closePlateDetail()"
          style="width:36px; height:36px; border-radius:10px; border:none; background:${CONFIG.surface_color}; color:${CONFIG.text_color}; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <div style="flex:1; min-width:0;">
          <h2 style="color:${CONFIG.text_color}; font-size:20px; font-weight:700; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(batch.name)}</h2>
          <div style="display:flex; align-items:center; gap:8px; margin-top:2px; flex-wrap:wrap;">
            <span style="padding:3px 10px; border-radius:12px; background:rgba(232,93,93,0.12); color:${CONFIG.primary_action_color}; font-size:11px; font-weight:600;">${capitalize(batch.mealType)}</span>
            <span style="color:${CONFIG.text_muted}; font-size:12px;">${comps.length} component${comps.length !== 1 ? 's' : ''}</span>
            ${totalTime ? `<span style="color:${CONFIG.text_muted}; font-size:12px;">${totalTime} min</span>` : ''}
          </div>
        </div>
      </div>

      ${hasVideos ? `
        <div style="padding:0 12px 12px;">
          <button type="button" onclick="openVideoOverlay('batch', '${batch.id}')"
            style="width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:8px;
            background:${CONFIG.surface_color}; border:1px solid rgba(255,255,255,0.12); border-radius:10px;
            color:${CONFIG.text_color}; font-size:14px; font-weight:600; cursor:pointer;">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Watch Cooking Video
          </button>
        </div>
      ` : ''}

      ${comps.length === 0 ? `
        <div style="text-align:center; padding:32px; color:${CONFIG.text_muted};">No components yet</div>
      ` : `
        <!-- Component card with swipe -->
        <div style="padding:0 12px;">
          <div id="plateDetailCardContainer" style="position:relative; border-radius:16px; overflow:hidden; background:${CONFIG.surface_color}; box-shadow:${CONFIG.shadow}; margin-bottom:12px; touch-action:pan-y;">
            ${compImg ? `
              <div style="height:220px; overflow:hidden; position:relative;">
                <img src="${esc(compImg)}" style="width:100%; height:100%; object-fit:cover;" />
                <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); padding:4px 10px; border-radius:12px; color:white; font-size:12px; font-weight:600;">
                  ${idx + 1} of ${comps.length}
                </div>
                ${comp.timing ? `
                  <div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); padding:4px 10px; border-radius:12px; color:white; font-size:11px; font-weight:500;">
                    ${esc(comp.timing)}
                  </div>
                ` : ''}
              </div>
            ` : `
              <div style="height:140px; background:linear-gradient(135deg, ${CONFIG.surface_color}, ${CONFIG.surface_elevated}); display:flex; align-items:center; justify-content:center; position:relative;">
                <span style="color:${CONFIG.text_color}; font-size:18px; font-weight:700; text-align:center; padding:16px;">${esc(compName)}</span>
                <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.4); padding:4px 10px; border-radius:12px; color:white; font-size:12px; font-weight:600;">
                  ${idx + 1} of ${comps.length}
                </div>
              </div>
            `}
            <div style="padding:12px 14px;">
              <div style="color:${CONFIG.text_color}; font-size:16px; font-weight:700;">${esc(compName)}</div>
            </div>
          </div>

          <!-- Dot indicators -->
          ${comps.length > 1 ? `
            <div style="display:flex; justify-content:center; gap:6px; margin-bottom:12px;">
              ${comps.map((_, i) => `
                <button onclick="setPlateDetailComp(${i})"
                  style="width:${i === idx ? '20px' : '8px'}; height:8px; border-radius:4px; border:none;
                  background:${i === idx ? CONFIG.primary_action_color : 'rgba(255,255,255,0.2)'}; cursor:pointer; transition:all 0.2s; padding:0;">
                </button>
              `).join('')}
            </div>

            <!-- Prev / Next -->
            <div style="display:flex; gap:8px; margin-bottom:16px;">
              <button onclick="if(plateDetailCompIdx > 0) { plateDetailCompIdx--; render(); }"
                style="flex:1; padding:10px; background:${CONFIG.surface_elevated}; color:${idx > 0 ? CONFIG.text_color : CONFIG.text_tertiary}; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;"
                ${idx === 0 ? 'disabled' : ''}>
                &larr; Previous
              </button>
              <button onclick="if(plateDetailCompIdx < ${comps.length - 1}) { plateDetailCompIdx++; render(); }"
                style="flex:1; padding:10px; background:${CONFIG.surface_elevated}; color:${idx < comps.length - 1 ? CONFIG.text_color : CONFIG.text_tertiary}; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;"
                ${idx === comps.length - 1 ? 'disabled' : ''}>
                Next &rarr;
              </button>
            </div>
          ` : ''}

          ${compNotes ? `
            <div style="background:rgba(255,214,10,0.08); border:1px solid rgba(255,214,10,0.2); border-radius:10px; padding:10px 12px; margin-bottom:12px;">
              <div style="font-size:11px; font-weight:600; color:#ffd60a; margin-bottom:2px;">Notes</div>
              <div style="color:${CONFIG.text_color}; font-size:13px; line-height:1.4;">${esc(compNotes)}</div>
            </div>
          ` : ''}

          <!-- Ingredients -->
          ${compIngs.length > 0 ? `
            <div style="background:${CONFIG.surface_color}; border-radius:12px; padding:12px; margin-bottom:12px;">
              <div style="font-size:15px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:8px;">Ingredients</div>
              ${compIngs.map(ing => `
                <div style="color:${CONFIG.text_color}; font-size:14px; padding:4px 0; opacity:0.9;">
                  ${ing.qty ? esc(ing.qty) : ''} ${ing.unit ? esc(ing.unit) : ''} ${esc(capitalize(ing.name))}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Instructions -->
          ${steps.length > 0 ? `
            <div style="background:${CONFIG.surface_color}; border-radius:12px; padding:12px; margin-bottom:12px;">
              <div style="font-size:15px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:8px;">Instructions</div>
              <ol style="color:${CONFIG.text_color}; font-size:14px; padding-left:18px; margin:0;">
                ${steps.map(s => `<li style="padding:4px 0; opacity:0.9;">${esc(s.replace(/^\d+\.\s*/, ''))}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          <!-- View all ingredients button -->
          <button onclick="showBatchAllIngredients('${batch.id}')" style="width:100%; padding:12px; background:${CONFIG.surface_elevated}; color:${CONFIG.primary_action_color}; border:1px solid rgba(232,93,93,0.2); border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; margin-bottom:8px;">
            View all ingredients (${allIngs.length})
          </button>
          <button onclick="showBatchIngredientPicker('${batch.id}')" style="width:100%; padding:12px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer;">
            Add to grocery list
          </button>
        </div>
      `}
    </div>
  `;
}

function initPlateDetailSwipe() {
  const container = document.getElementById('plateDetailCardContainer');
  if (!container) return;
  const batch = getBatchRecipeById(plateDetailId);
  if (!batch || batch.components.length <= 1) return;

  let startX = 0, currentX = 0, swiping = false;
  container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; currentX = startX; swiping = true; }, { passive: true });
  container.addEventListener('touchmove', e => { if (!swiping) return; currentX = e.touches[0].clientX; container.style.transform = `translateX(${(currentX - startX) * 0.3}px)`; container.style.transition = 'none'; }, { passive: true });
  container.addEventListener('touchend', () => {
    if (!swiping) return; swiping = false;
    const diff = currentX - startX;
    container.style.transform = ''; container.style.transition = 'transform 0.2s';
    if (Math.abs(diff) > 60) {
      if (diff < 0 && plateDetailCompIdx < batch.components.length - 1) { plateDetailCompIdx++; render(); }
      else if (diff > 0 && plateDetailCompIdx > 0) { plateDetailCompIdx--; render(); }
    }
  });
}

// showBatchAllIngredients lives in recipes.js — define here if not already loaded
if (typeof showBatchAllIngredients === 'undefined') {
  window.showBatchAllIngredients = function(batchId) {
    const batch = getBatchRecipeById(batchId);
    if (!batch) return;
    const combined = getBatchCombinedIngredients(batch);
    openModal(`<div style="color:${CONFIG.text_color}; max-height:80vh; display:flex; flex-direction:column;">
      <h3 style="font-size:17px; font-weight:600; margin-bottom:12px;">All Ingredients</h3>
      <div style="font-size:12px; color:${CONFIG.text_muted}; margin-bottom:12px;">${combined.length} unique ingredients from ${batch.components.length} components</div>
      <div style="overflow-y:auto; flex:1; max-height:55vh;">
        ${combined.map(ing => `
          <div style="display:flex; align-items:baseline; gap:8px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="flex:1;">
              <span style="color:${CONFIG.text_color}; font-size:13px;">${ing.qty ? esc(ing.qty) + ' ' : ''}${ing.unit ? esc(ing.unit) + ' ' : ''}${esc(capitalize(ing.name))}</span>
              <div style="font-size:10px; color:${CONFIG.text_muted}; margin-top:1px;">From: ${ing.components.map(c => esc(c)).join(', ')}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <button onclick="closeModal()" style="margin-top:12px; padding:10px; background:${CONFIG.surface_elevated}; color:${CONFIG.text_color}; border:none; border-radius:10px; cursor:pointer; font-size:14px;">Close</button>
    </div>`);
  };
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
        <div class="recipes-photo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px;">
          ${list.map(b => {
            const bImg = getBatchCoverPhoto(b);
            const compCount = (b.components || []).length;
            return `
            <div style="position:relative; cursor:pointer; overflow:hidden; border-radius:8px;" onclick="openBatchRecipeView('${b.id}')">
              ${bImg ? `
                <div style="aspect-ratio:1; width:100%; overflow:hidden;">
                  <img loading="lazy" src="${esc(bImg)}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
              ` : `
                <div style="aspect-ratio:1; width:100%; background:${CONFIG.surface_color}; display:flex; align-items:center; justify-content:center; padding:12px;">
                  <span style="color:${CONFIG.text_color}; font-size:12px; font-weight:600; text-align:center; -webkit-line-clamp:3; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden;">${esc(b.name)}</span>
                </div>
              `}
              <!-- Stacked cards badge -->
              <div style="position:absolute; top:4px; left:4px; z-index:2;">
                <div style="width:22px; height:22px; border-radius:5px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
                  <svg width="14" height="14" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>
                </div>
              </div>
              <div style="padding:6px; background:${CONFIG.background_color};">
                <div style="color:${CONFIG.text_color}; font-size:11px; font-weight:600; -webkit-line-clamp:2; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3;">${esc(b.name)}</div>
                <div style="color:${CONFIG.text_muted}; font-size:10px; margin-top:2px;">${compCount} recipe${compCount !== 1 ? 's' : ''}</div>
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
  let photosEntries = log.filter(e => {
    if (e.myPhoto) return true;
    if (e.photo && e.photo.startsWith('data:')) return true;
    return false;
  });

  // Filter pills
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' }
  ];

  const filterRow = filters.map(f => {
    const active = journalFilterMealType === f.id;
    return `<button onclick="setJournalFilter('${f.id}')"
      style="flex-shrink:0; padding:8px 16px; border-radius:20px; border:none;
      background:${active ? CONFIG.primary_action_color : 'transparent'};
      color:${active ? 'white' : CONFIG.text_muted};
      font-size:13px; font-weight:${active ? '600' : '500'}; cursor:pointer; white-space:nowrap;">
      ${f.label}</button>`;
  }).join('');

  // Apply meal type filter
  if (journalFilterMealType !== 'all') {
    photosEntries = photosEntries.filter(e => (e.mealType || '').toLowerCase() === journalFilterMealType);
  }

  // Apply search filter
  if (journalSearchTerm) {
    const sl = journalSearchTerm.toLowerCase();
    photosEntries = photosEntries.filter(e => (e.recipeName || '').toLowerCase().includes(sl));
  }

  const searchAndFilters = `
    <!-- Search bar -->
    <div style="padding: 8px 12px 0;">
      <div style="position:relative;">
        <input id="journalSearchInput" type="text" placeholder="Search photos..."
          value="${esc(journalSearchTerm)}"
          oninput="handleJournalSearch(this.value)"
          style="width:100%; height:40px; padding:0 36px 0 12px; box-sizing:border-box;
          background:${CONFIG.surface_color}; color:${CONFIG.text_color};
          border:1px solid rgba(255,255,255,0.08); border-radius:10px;
          font-size:14px; font-family:${CONFIG.font_family};" />
        ${journalSearchTerm ? `
          <button onclick="journalSearchTerm=''; render(); setTimeout(() => { const i = document.getElementById('journalSearchInput'); if(i) i.focus(); }, 0);"
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
  `;

  if (photosEntries.length === 0) {
    return `
      <div style="padding: 0; padding-bottom: 80px; max-width: 100%; overflow-x: hidden;">
        ${searchAndFilters}
        <div style="padding: ${CONFIG.space_2xl} ${CONFIG.space_md}; text-align: center;">
          <div style="font-size: 48px; opacity: 0.3; margin-bottom: ${CONFIG.space_md};">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          </div>
          <div style="color: ${CONFIG.text_muted}; font-size: 14px; line-height: 1.5;">No cooking photos yet.<br>Mark meals as cooked and add photos to see them here.</div>
        </div>
      </div>
    `;
  }

  // Group by date, sorted newest first
  const allPhotos = photosEntries.map(e => ({
    id: e.id,
    photo: e.myPhoto || e.photo,
    recipeName: e.recipeName || 'Unknown',
    mealType: e.mealType || 'meal',
    date: e.dateCooked?.split('T')[0] || getToday(),
    dateLabel: getFoodLogDateLabel(e.dateCooked?.split('T')[0] || getToday())
  })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Group into date buckets
  const dateGroups = {};
  const dateOrder = [];
  allPhotos.forEach(p => {
    if (!dateGroups[p.date]) {
      dateGroups[p.date] = [];
      dateOrder.push(p.date);
    }
    dateGroups[p.date].push(p);
  });

  return `
    <div style="padding: 0; padding-bottom: 80px; max-width: 100%; overflow-x: hidden;">
      ${searchAndFilters}
      ${dateOrder.map(date => {
        const photos = dateGroups[date];
        const label = getFoodLogDateLabel(date);
        return `
          <div style="padding: 16px 12px 0;">
            <div style="font-size: 14px; font-weight: 700; color: ${CONFIG.text_color}; margin-bottom: 8px;">${label}</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 0 4px;">
            ${photos.map(p => `
              <div data-journal-id="${p.id}" style="position: relative; cursor: pointer; overflow: hidden; border-radius: 8px;" onclick="showJournalFullscreen('${p.id}')">
                <div style="aspect-ratio:1; width:100%; overflow:hidden;">
                  <img loading="lazy" src="${esc(p.photo)}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
                <div style="padding:6px; background:${CONFIG.background_color};">
                  <div style="color:${CONFIG.text_color}; font-size:13px; font-weight:700; -webkit-line-clamp:1; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3;">
                    ${esc(p.recipeName)}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
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
      <!-- Close and delete buttons -->
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <button onclick="closeModal()" style="width:32px; height:32px; border-radius:8px; border:none; background:${CONFIG.surface_elevated}; color:${CONFIG.text_muted}; cursor:pointer; display:flex; align-items:center; justify-content:center;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button onclick="confirmDeleteJournalEntry('${logId}')" style="width:32px; height:32px; border-radius:8px; border:none; background:rgba(232,93,93,0.12); color:${CONFIG.primary_action_color}; cursor:pointer; display:flex; align-items:center; justify-content:center;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
        </button>
      </div>
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
    </div>
  `);
}

// Keep old name as alias for backward compat (my-meals.js uses it)
function showPlateFullscreen(logId) { showJournalFullscreen(logId); }

function confirmDeleteJournalEntry(logId) {
  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Delete this entry?</div>
      <div style="font-size: 14px; color: ${CONFIG.text_muted}; margin-bottom: 24px;">This will remove the photo and meal log.</div>
      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()"
          style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; font-size: 14px; font-weight: 600; cursor: pointer;">
          Cancel
        </button>
        <button onclick="deleteJournalEntry('${logId}')"
          style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: ${CONFIG.primary_action_color}; color: white; font-size: 14px; font-weight: 600; cursor: pointer;">
          Delete
        </button>
      </div>
    </div>
  `);
}

function deleteJournalEntry(logId) {
  // Remove from food log
  deleteFoodLogEntry(logId);
  // Clean up associated notes
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  if (photoNotes[logId]) {
    delete photoNotes[logId];
    localStorage.setItem('myPlatesNotes', JSON.stringify(photoNotes));
  }
  // Clean up cover photo references
  const coverPrefs = JSON.parse(localStorage.getItem('myPlatesCovers') || '{}');
  const keysToRemove = Object.keys(coverPrefs).filter(k => coverPrefs[k] === logId);
  keysToRemove.forEach(k => delete coverPrefs[k]);
  if (keysToRemove.length) localStorage.setItem('myPlatesCovers', JSON.stringify(coverPrefs));

  closeModal();
  showToast('Entry deleted', 'success');
  render();
}

// Context menu for long-press (mobile) / right-click (desktop) delete
let _journalLongPressTimer = null;
let _journalContextMenu = null;

function dismissJournalContextMenu() {
  if (_journalContextMenu) {
    _journalContextMenu.remove();
    _journalContextMenu = null;
  }
}

function showJournalContextMenu(logId, x, y) {
  dismissJournalContextMenu();
  const menu = document.createElement('div');
  menu.style.cssText = `position:fixed; left:${x}px; top:${y}px; z-index:9999; background:${CONFIG.surface_elevated}; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:4px; box-shadow:0 8px 24px rgba(0,0,0,0.5); min-width:120px;`;
  menu.innerHTML = `
    <button onclick="dismissJournalContextMenu(); confirmDeleteJournalEntry('${logId}')"
      style="width:100%; padding:10px 14px; background:transparent; border:none; color:${CONFIG.primary_action_color}; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; border-radius:8px; font-family:${CONFIG.font_family};"
      onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
      Delete
    </button>
  `;
  document.body.appendChild(menu);
  _journalContextMenu = menu;

  // Clamp to viewport
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
  if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';

  // Dismiss on click outside
  setTimeout(() => {
    document.addEventListener('click', dismissJournalContextMenu, { once: true });
    document.addEventListener('touchstart', dismissJournalContextMenu, { once: true });
  }, 10);
}

function initJournalContextMenus() {
  if (savedActiveTab !== 'journal') return;
  const cards = document.querySelectorAll('[data-journal-id]');
  cards.forEach(card => {
    const logId = card.getAttribute('data-journal-id');

    // Right-click (desktop)
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      showJournalContextMenu(logId, e.clientX, e.clientY);
    });

    // Long-press (mobile)
    let timer = null;
    card.addEventListener('touchstart', e => {
      timer = setTimeout(() => {
        const touch = e.touches[0];
        showJournalContextMenu(logId, touch.clientX, touch.clientY);
        card._longPressed = true;
      }, 500);
    }, { passive: true });
    card.addEventListener('touchmove', () => { clearTimeout(timer); }, { passive: true });
    card.addEventListener('touchend', e => {
      clearTimeout(timer);
      if (card._longPressed) {
        e.preventDefault();
        card._longPressed = false;
      }
    });
  });
}

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

// Clear any stale tab hints from old navigation
sessionStorage.removeItem('savedPageTab');

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  // If plate detail is open, render that instead (still supported via deep links)
  if (plateDetailId) {
    app.innerHTML = `
      <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
        ${renderDesktopSidebar()}
        <div class="desktop-content-area">
          ${renderPlateDetail()}
        </div>
        ${renderBottomNav()}
      </div>
    `;
    setTimeout(initPlateDetailSwipe, 0);
    return;
  }

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      <div class="desktop-content-area">
        <div class="desktop-page-title-bar" style="display: none; padding-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">Cooking Journal</h1>
        </div>
        <!-- Mobile title -->
        <div class="mobile-only-sections" style="padding: 12px 12px 0;">
          <h1 style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">Cooking Journal</h1>
        </div>
        ${renderCookingJournal()}
      </div>
      ${renderBottomNav()}
    </div>
  `;
  initJournalContextMenus();
}

render();
