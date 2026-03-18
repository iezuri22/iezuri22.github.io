// ============================================================
// GROCERY PAGE - Render functions and grocery-specific actions
// Depends on js/shared.js being loaded first
// ============================================================

// _cachedSuggestions is declared with 'let' in shared.js.
// Do NOT re-declare it here (var inside a separate <script> tag
// conflicts with a prior let and causes a SyntaxError, which
// prevents this entire file from executing => black screen).

// ============================================================
// GROCERY RENDER FUNCTIONS
// ============================================================

function renderGroceryIngredients() {
      const r = getRecipeById(state.selectedGroceryRecipeId);
      if (!r) return `<div class="p-6">Recipe not found</div>`;

      const list = recipeIngList(r);
      const selId = `mealSel_${state.selectedGroceryDate}_${state.selectedGroceryMeal}_${state.selectedGroceryRecipeId}`;
      const sel = state.mealSelections.find(s => s.id === selId);

      let keys = [];
      try {
        keys = sel ? JSON.parse(sel.includedIngredientKeys || '[]') : list.map(x => normalizeIngredient(x.name));
      } catch (e) {
        keys = list.map(x => normalizeIngredient(x.name));
      }

      const allChecked = list.length > 0 && list.every(ing => keys.includes(normalizeIngredient(ing.name)));
      const noneChecked = list.length > 0 && list.every(ing => !keys.includes(normalizeIngredient(ing.name)));

      return `
        <div class="p-3 max-w-4xl mx-auto">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <div>
              <h2 style="color:${CONFIG.text_color}; font-size:14px; font-weight:700;">Choose Ingredients</h2>
              <p style="color:${CONFIG.text_muted}; font-size:11px;">
                ${esc(r.title)} · ${formatDateDisplay(state.selectedGroceryDate)} ${esc(state.selectedGroceryMeal)}
              </p>
            </div>
            <button onclick="state.currentView='grocery-list'; render();"
              style="padding:6px 12px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:6px; font-size:11px; cursor:pointer;">
              Done
            </button>
          </div>

          <!-- Select All / None buttons -->
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <button onclick="selectAllIngredients()"
              style="padding:6px 12px; background:${allChecked ? CONFIG.primary_action_color : CONFIG.surface_color}; color:${allChecked ? 'white' : CONFIG.text_color}; border:none; border-radius:6px; font-size:11px; cursor:pointer;">
              Select All
            </button>
            <button onclick="selectNoIngredients()"
              style="padding:6px 12px; background:${noneChecked ? CONFIG.primary_action_color : CONFIG.surface_color}; color:${noneChecked ? 'white' : CONFIG.text_color}; border:none; border-radius:6px; font-size:11px; cursor:pointer;">
              Select None
            </button>
            <div style="flex:1;"></div>
            <span style="color:${CONFIG.text_muted}; font-size:11px; align-self:center;">
              ${keys.length} of ${list.length} selected
            </span>
          </div>

          ${(() => {
            if (!list.length) return `<div style="background:${CONFIG.surface_color}; border-radius:8px; padding:12px; text-align:center; color:${CONFIG.text_muted};">No ingredients on this recipe yet.</div>`;
            const uniqueIngs = list.filter(ing => !isStaple(ing.name));
            const stapleIngs = list.filter(ing => isStaple(ing.name));
            function _ingRow(ing) {
              const k = normalizeIngredient(ing.name);
              const chk = keys.includes(k);
              return '<div data-ingredient-key="' + k + '" onclick="handleIngredientClick(\'' + k + '\', this)" style="display:flex; align-items:center; gap:10px; padding:10px; margin-bottom:4px; background:' + (chk ? 'rgba(232,93,93,0.1)' : CONFIG.background_color) + '; border-radius:6px; cursor:pointer; border:1px solid ' + (chk ? CONFIG.primary_action_color : 'transparent') + ';"><div style="width:20px; height:20px; border-radius:4px; border:2px solid ' + (chk ? CONFIG.primary_action_color : CONFIG.text_muted) + '; background:' + (chk ? CONFIG.primary_action_color : 'transparent') + '; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; flex-shrink:0;">' + (chk ? '✓' : '') + '</div><span style="color:' + CONFIG.text_color + '; font-size:13px;">' + esc(ing.qty) + (ing.unit ? ' ' + esc(ing.unit) : '') + ' ' + esc(ing.name) + '</span></div>';
            }
            let html = '';
            if (uniqueIngs.length > 0) {
              html += '<div style="font-size:12px; font-weight:600; color:' + CONFIG.text_color + '; margin-bottom:6px;">What you\'ll need</div>';
              html += '<div style="background:' + CONFIG.surface_color + '; border-radius:8px; padding:8px; margin-bottom:8px;">';
              html += uniqueIngs.map(ing => _ingRow(ing)).join('');
              html += '</div>';
            }
            if (stapleIngs.length > 0) {
              html += '<div onclick="var c=this.nextElementSibling; var ch=this.querySelector(\'.staple-chev\'); if(c.style.display===\'none\'){c.style.display=\'block\';ch.style.transform=\'rotate(90deg)\';}else{c.style.display=\'none\';ch.style.transform=\'\';}" style="display:flex; align-items:center; gap:8px; padding:8px; cursor:pointer; margin-bottom:4px;">';
              html += '<span class="staple-chev" style="color:' + CONFIG.text_muted + '; font-size:12px; transition:transform 150ms; display:inline-block;">&#9656;</span>';
              html += '<span style="font-size:12px; font-weight:600; color:' + CONFIG.text_muted + ';">Staples (you might have these) · ' + stapleIngs.length + ' item' + (stapleIngs.length !== 1 ? 's' : '') + '</span>';
              html += '</div>';
              html += '<div style="display:none; background:' + CONFIG.surface_color + '; border-radius:8px; padding:8px;">';
              html += stapleIngs.map(ing => _ingRow(ing)).join('');
              html += '</div>';
            }
            return html;
          })()}
        </div>`;
    }

function renderGrocerySelectMeals() {
  // Get yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get all planned meals and filter to yesterday + next 7 days
  const allMeals = getPlannedMealsForWeek(yesterdayStr);
  const plannedMeals = allMeals.slice(0, 8); // Yesterday + 7 days = 8 days

  return `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; letter-spacing: ${CONFIG.type_title_tracking}; font-family: ${CONFIG.font_family}, sans-serif;" class="font-bold">
          Select Meals for Grocery List
        </h2>
        <button type="button" onclick="state.currentView='grocery-list'; render();"
                style="background: ${CONFIG.primary_action_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px;"
                class="px-4 py-2 rounded button-hover">
          Done
        </button>
      </div>

      ${plannedMeals.length === 0 ? `
        <div style="background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px;"
             class="p-8 rounded text-center">
          No meals planned for this week
        </div>
      ` : `
        <div class="grid gap-3">
          ${plannedMeals.map(meal => `
            <div style="background: ${CONFIG.surface_color};" class="p-4 rounded card-hover flex items-center justify-between">
              <div>
                <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size * 1.125}px;" class="font-semibold">
                  ${meal.recipeTitle}
                </div>
                <div style="color: ${CONFIG.text_color}; opacity: 0.7; font-size: ${CONFIG.font_size * 0.875}px; font-family: ${CONFIG.font_family}, sans-serif;">
                  ${formatDateDisplay(meal.date)} - ${meal.meal}
                </div>
              </div>
           <button type="button" onclick="openGroceryIngredientPicker('${meal.date}', '${meal.meal}', '${meal.recipeId}')"
                      style="background: ${CONFIG.primary_action_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px;"
                      class="px-4 py-2 rounded button-hover">
                Choose Ingredients
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderGroceryByMeal(unchecked, checked) {
  // Group ingredients by their source meal
  const byMeal = {};
  const byCategory = {};

  state.mealSelections.forEach(sel => {
    const parts = sel.id.split('_');
    const recipeIdFromSel = parts.slice(3).join('_');

    // Handle manual items separately
    if (recipeIdFromSel === 'manual' && sel.manualItem) {
      const group = sel.manualItem.group || 'Other';
      if (!byCategory[group]) byCategory[group] = [];

      const item = unchecked.find(i => normalizeIngredient(i.name) === normalizeIngredient(sel.manualItem.name)) ||
                   checked.find(i => normalizeIngredient(i.name) === normalizeIngredient(sel.manualItem.name));
      if (item) byCategory[group].push(item);
      return;
    }

    const recipe = getRecipeById(recipeIdFromSel);
    if (!recipe) return;

    const mealKey = `${recipe.title}`;
    if (!byMeal[mealKey]) {
      byMeal[mealKey] = { recipe, ingredients: [] };
    }

    let keys = [];
    try {
      keys = JSON.parse(sel.includedIngredientKeys || '[]');
    } catch (e) {
      keys = [];
    }

    recipeIngList(recipe).forEach(ing => {
      const k = normalizeIngredient(ing.name);
      if (!keys.includes(k)) return;

      const item = unchecked.find(i => normalizeIngredient(i.name) === k) ||
                   checked.find(i => normalizeIngredient(i.name) === k);
      if (item && !byMeal[mealKey].ingredients.some(i => normalizeIngredient(i.name) === k)) {
        byMeal[mealKey].ingredients.push(item);
      }
    });
  });

  const sortedGroups = ING_GROUPS.filter(g => byCategory[g]);
  Object.keys(byCategory).forEach(g => {
    if (!ING_GROUPS.includes(g)) sortedGroups.push(g);
  });

  return `
    <!-- From Meals Section -->
    ${Object.keys(byMeal).length > 0 ? `
      <div class="mb-6">
        <h3 style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size * 1.125}px;" class="font-semibold mb-4">
          🍽️ From Meals
        </h3>
        ${Object.entries(byMeal).map(([mealName, data]) => `
          <div class="mb-4">
            <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size * 1.05}px; opacity: 0.9; font-weight: 600; padding: 8px 0; border-bottom: 2px solid rgba(232, 93, 93, 0.3); margin-bottom: 8px;">
              ${esc(mealName)}
            </div>
            ${data.ingredients.map(item => {
              const capitalizedName = capitalize(item.name);

              return `
                <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px; ${item.checked ? 'opacity: 0.5; text-decoration: line-through;' : ''}"
                     class="flex items-center justify-between gap-3 p-3 rounded">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleGroceryItem('${normalizeIngredient(item.name)}')">
                    <span>${capitalizedName}</span>
                  </label>
                  <button type="button" onclick="removeFromGroceryList('${normalizeIngredient(item.name)}')"
                    class="px-2 py-1 rounded button-hover"
                    style="background:${CONFIG.danger_color}; color:white; font-size:${CONFIG.font_size * 0.85}px;">
                    Delete
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- By Category Section -->
    ${sortedGroups.length > 0 ? `
      <div>
        <h3 style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size * 1.125}px;" class="font-semibold mb-4">
          📦 By Category
        </h3>
        ${sortedGroups.map(group => `
          <div class="mb-4">
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.font_size * 1.05}px; font-weight: 600; padding: 8px 0; border-bottom: 2px solid rgba(255,255,255,0.1); margin-bottom: 8px;">
                    ${esc(group)}
                  </div>
            ${byCategory[group].map(item => {
              const capitalizedName = capitalize(item.name);

              return `
                <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px; ${item.checked ? 'opacity: 0.5; text-decoration: line-through;' : ''}"
                     class="flex items-center justify-between gap-3 p-3 rounded">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleGroceryItem('${normalizeIngredient(item.name)}')">
                    <span>${capitalizedName}</span>
                  </label>
                  <button type="button" onclick="removeFromGroceryList('${normalizeIngredient(item.name)}')"
                    class="px-2 py-1 rounded button-hover"
                    style="background:${CONFIG.danger_color}; color:white; font-size:${CONFIG.font_size * 0.85}px;">
                    Delete
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    ` : ''}
`;
}

function renderGroceryList() {
      const groceryList = getSmartGroceryList();
      const unchecked = groceryList.filter(item => !item.checked);
      const checked = groceryList.filter(item => item.checked);

      // Categorized suggestions (planned > saved > frequent), staples filtered out
      const catSugg = getCategorizedSuggestions();
      const allSuggestions = [...catSugg.planned, ...catSugg.saved, ...catSugg.frequent];
      _cachedSuggestions = allSuggestions;

      // Split items into unique vs staples
      const uniqueUnchecked = unchecked.filter(item => !isStaple(item.name));
      const stapleUnchecked = unchecked.filter(item => isStaple(item.name));
      const uniqueChecked = checked.filter(item => !isStaple(item.name));
      const stapleChecked = checked.filter(item => isStaple(item.name));
      const totalStaples = stapleUnchecked.length + stapleChecked.length;

      // Group unique unchecked items by category
      const groupedUnchecked = {};
      uniqueUnchecked.forEach(item => {
        const cat = item.category || 'Other';
        if (!groupedUnchecked[cat]) groupedUnchecked[cat] = [];
        groupedUnchecked[cat].push(item);
      });
      const sortedCats = GROCERY_CATEGORIES.filter(c => groupedUnchecked[c]);
      Object.keys(groupedUnchecked).forEach(c => {
        if (!GROCERY_CATEGORIES.includes(c)) sortedCats.push(c);
      });

      // Group unique checked items by category
      const groupedChecked = {};
      uniqueChecked.forEach(item => {
        const cat = item.category || 'Other';
        if (!groupedChecked[cat]) groupedChecked[cat] = [];
        groupedChecked[cat].push(item);
      });

      // Empty message (but don't return early — always show controls)
      const emptyMessage = (groceryList.length === 0 && allSuggestions.length === 0)
        ? `<div style="text-align: center; padding: 24px 0; color: ${CONFIG.text_muted}; font-size: 13px;">Your grocery list is empty. Add items manually or from a meal.</div>`
        : '';

      // Build suggestion pills HTML with categorized sections
      function _buildSuggestionPills(items, startIdx, label, sublabelFn) {
        if (items.length === 0) return '';
        return `
          <div style="margin-bottom: 10px;">
            <div style="font-size: 11px; font-weight: 600; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">${label}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${items.slice(0, 8).map((s, i) => `
                <button data-sug-idx="${startIdx + i}" onclick="handleSuggestClick(${startIdx + i})"
                  style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; min-height: 36px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; color: ${CONFIG.text_color}; font-size: 12px; cursor: pointer; white-space: nowrap; -webkit-tap-highlight-color: transparent;"
                  class="card-press">
                  <svg width="14" height="14" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  ${esc(capitalize(s.name))}
                  <span style="color: ${CONFIG.text_muted}; font-size: 10px;">${sublabelFn(s)}</span>
                </button>
              `).join('')}
            </div>
          </div>`;
      }

      const suggestionsHtml = allSuggestions.length > 0 ? `
        <div style="margin-bottom: 12px;">
          ${_buildSuggestionPills(catSugg.planned, 0, 'For your upcoming meals', s => s.recipeName || '')}
          ${_buildSuggestionPills(catSugg.saved, catSugg.planned.length, 'From your saved recipes', s => s.recipeName || '')}
          ${_buildSuggestionPills(catSugg.frequent, catSugg.planned.length + catSugg.saved.length, 'Things you make often', s => (s.mealCount || 0) + 'x')}
        </div>
      ` : '';

      const addFromMealHtml = `
        <button onclick="showAddFromMealModal()"
          style="width: 100%; padding: 12px; min-height: 44px; margin-bottom: 12px; background: ${CONFIG.surface_color}; border: 1px dashed rgba(255,255,255,0.12); border-radius: 10px; color: ${CONFIG.text_color}; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;"
          class="card-press">
          <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
          Add from a meal
        </button>`;

      // Staples collapsible section
      const staplesHtml = totalStaples > 0 ? `
        <div style="margin-top: 8px;">
          <div onclick="var c=this.nextElementSibling; var ch=this.querySelector('.staple-chev'); if(c.style.display==='none'){c.style.display='block';ch.style.transform='rotate(90deg)';}else{c.style.display='none';ch.style.transform='';}"
               style="display: flex; align-items: center; gap: 8px; padding: 10px; background: ${CONFIG.surface_color}; border-radius: 8px; cursor: pointer; margin-bottom: 4px;">
            <span class="staple-chev" style="color: ${CONFIG.text_muted}; font-size: 12px; transition: transform 150ms; display: inline-block;">&#9656;</span>
            <span style="color: ${CONFIG.text_muted}; font-size: 13px; font-weight: 600;">Staples (you might have these)</span>
            <span style="color: ${CONFIG.text_tertiary}; font-size: 11px;">${totalStaples} item${totalStaples !== 1 ? 's' : ''}</span>
          </div>
          <div style="display: none;">
            ${stapleUnchecked.map(item => _renderGroceryRow(item, false)).join('')}
            ${stapleChecked.map(item => _renderGroceryRow(item, true)).join('')}
          </div>
        </div>
      ` : '';

      return `
        <div style="padding: 0 12px; padding-bottom: 72px;">

          <!-- Manual Add Input -->
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <input type="text" id="groceryManualInput" placeholder="Add an item..."
              onkeydown="if(event.key==='Enter') addManualGroceryItemSmart();"
              onfocus="document.getElementById('groceryCategoryRow').style.display='flex';"
              style="flex: 1; padding: 8px 12px; height: 44px; box-sizing: border-box; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: ${CONFIG.text_color}; font-size: 14px; outline: none;"
            />
            <button onclick="addManualGroceryItemSmart()"
              style="padding: 8px 14px; height: 44px; box-sizing: border-box; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; min-width: 52px;">
              Add
            </button>
          </div>
          <!-- Category selector row -->
          <div id="groceryCategoryRow" style="display: none; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; padding: 2px 0;">
            ${GROCERY_CATEGORIES.map(cat => `
              <button onclick="selectGroceryCategory(this, '${esc(cat)}')"
                data-cat="${esc(cat)}"
                style="padding: 4px 10px; font-size: 11px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; white-space: nowrap; color: ${cat === 'Other' ? CONFIG.primary_action_color : CONFIG.text_muted}; background: ${cat === 'Other' ? CONFIG.primary_subtle : CONFIG.surface_color};"
                class="card-press">${esc(cat)}</button>
            `).join('')}
          </div>
          <input type="hidden" id="groceryManualCategory" value="Other" />

          <div class="desktop-grocery-layout">
            <div class="desktop-grocery-main">

          <!-- Suggestions Section (mobile) -->
          <div class="mobile-only-sections">
            ${suggestionsHtml}
            ${addFromMealHtml}
          </div>

          <!-- Clear buttons -->
          ${groceryList.length > 0 ? `
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
              ${checked.length > 0 ? `
                <button onclick="clearCheckedGrocery()"
                  style="flex: 1; padding: 8px; min-height: 36px; background: ${CONFIG.surface_color}; border: none; border-radius: 16px; color: ${CONFIG.text_muted}; font-size: 12px; cursor: pointer; -webkit-tap-highlight-color: transparent;">
                  Clear checked (${checked.length})
                </button>
              ` : ''}
              <button onclick="clearAllGrocerySmart()"
                style="flex: 1; padding: 8px; min-height: 36px; background: ${CONFIG.surface_color}; border: none; border-radius: 16px; color: ${CONFIG.danger_color}; font-size: 12px; cursor: pointer; -webkit-tap-highlight-color: transparent;">
                Clear all
              </button>
            </div>
          ` : ''}

          ${emptyMessage}

          <!-- What you'll need (unique ingredients by category) -->
          ${(uniqueUnchecked.length > 0 || uniqueChecked.length > 0) ? `
            <div style="color: ${CONFIG.text_color}; font-size: 13px; font-weight: 600; margin-bottom: 8px;">What you'll need</div>
          ` : ''}

          ${sortedCats.map(cat => `
            <div style="margin-bottom: 12px;">
              <div style="color: ${CONFIG.text_muted}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                ${esc(cat)} (${groupedUnchecked[cat].length})
              </div>
              ${groupedUnchecked[cat].map(item => _renderGroceryRow(item, false)).join('')}
              ${(groupedChecked[cat] || []).map(item => _renderGroceryRow(item, true)).join('')}
            </div>
          `).join('')}

          <!-- Remaining checked items in categories with no unchecked -->
          ${(() => {
            const catsWithUnchecked = new Set(sortedCats);
            const remainingCheckedCats = Object.keys(groupedChecked).filter(c => !catsWithUnchecked.has(c));
            if (remainingCheckedCats.length === 0) return '';
            return remainingCheckedCats.map(cat => `
              <div style="margin-bottom: 12px;">
                <div style="color: ${CONFIG.text_muted}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                  ${esc(cat)} (${groupedChecked[cat].length})
                </div>
                ${groupedChecked[cat].map(item => _renderGroceryRow(item, true)).join('')}
              </div>
            `).join('');
          })()}

          <!-- Staples section (collapsed) -->
          ${staplesHtml}

            </div><!-- end desktop-grocery-main -->
            <div class="desktop-grocery-side">
              ${suggestionsHtml}
              ${addFromMealHtml}
            </div>
          </div><!-- end desktop-grocery-layout -->

        </div>
      `;
    }

function _renderGroceryRow(item, isChecked) {
      const name = capitalize(item.name);
      const qtyLabel = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : '';
      const sourceLabel = item.sourceMeals && item.sourceMeals.length > 0
        ? item.sourceMeals.join(', ') : '';

      return `
        <div data-gro-id="${esc(item.id)}"
             onclick="toggleSmartGroceryItem('${esc(item.id)}')"
             style="display: flex; align-items: center; gap: 8px; padding: 10px; min-height: 44px; margin-bottom: 2px; background: ${CONFIG.surface_color}; border-radius: 8px; cursor: pointer; -webkit-tap-highlight-color: transparent;">
          <div class="gro-checkbox"
               style="width: 20px; height: 20px; border: 1.5px solid ${isChecked ? CONFIG.primary_action_color : CONFIG.text_muted}; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: ${isChecked ? CONFIG.primary_action_color : 'transparent'}; transition: all 150ms ease;">
            ${isChecked ? '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </div>
          <div class="gro-label" style="flex: 1; min-width: 0; ${isChecked ? 'text-decoration: line-through; opacity: 0.4;' : ''}">
            <div style="display: flex; align-items: baseline; gap: 6px;">
              <span style="color: ${CONFIG.text_color}; font-size: 13px;">${esc(name)}</span>
              ${qtyLabel ? `<span style="color: ${CONFIG.text_muted}; font-size: 11px;">${esc(qtyLabel)}</span>` : ''}
            </div>
            ${sourceLabel ? `<div style="color: ${CONFIG.text_tertiary}; font-size: 10px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">from ${esc(sourceLabel)}</div>` : ''}
          </div>
          ${!isChecked ? `
            <button onclick="event.stopPropagation(); removeSmartGroceryItem('${esc(item.id)}')"
              style="padding: 8px; background: none; border: none; color: ${CONFIG.text_muted}; font-size: 18px; cursor: pointer; flex-shrink: 0; line-height: 1; min-width: 36px; min-height: 36px; display: flex; align-items: center; justify-content: center;">
              ×
            </button>
          ` : ''}
        </div>
      `;
    }

// ============================================================
// GROCERY-SPECIFIC ACTION FUNCTIONS
// (These are called from onclick handlers in the grocery render functions
//  and are NOT in shared.js)
// ============================================================

function getPlannedMealsForWeek(weekStart) {
      const meals = [];

      state.mealOptions.forEach(option => {
        const recipe = getRecipeById(option.recipeId);
        if (recipe && recipe.type !== 'external') {
          meals.push({
            date: 'meal-option',
            meal: option.category,
            recipeId: option.recipeId,
            recipeTitle: recipe.title
          });
        }
      });

      return meals;
    }

function getGroceryList() {
      const aggregated = {};
      if (!state.mealSelections || !Array.isArray(state.mealSelections)) return [];
      state.mealSelections.forEach(sel => {
        const parts = sel.id.split('_');
        const date = parts[1];
        const meal = parts[2];
        const recipeIdFromSel = parts.slice(3).join('_');

      // Handle manual items
        if (recipeIdFromSel === 'manual' && sel.manualItem) {
          const k = normalizeIngredient(sel.manualItem.name);
          aggregated[k] = {
            name: sel.manualItem.name,
            quantity: '',
            unit: '',
            group: sel.manualItem.group || 'Other',
            checked: false
          };
          return;
        }

        const r = getRecipeById(recipeIdFromSel);
        if (!r) return;

        let keys = [];
        try {
          keys = JSON.parse(sel.includedIngredientKeys || '[]');
        } catch (e) {
          keys = [];
        }

        recipeIngList(r).forEach(ing => {
          const k = normalizeIngredient(ing.name);
          if (!keys.includes(k)) return;

          if (!aggregated[k]) {
            aggregated[k] = {
              name: ing.name,
              quantity: ing.qty || '',
              unit: ing.unit || '',
              group: ing.group || 'Other',
              checked: false
            };
          }
        });
      });

   Object.keys(aggregated).forEach(k => {
        const gi = state.groceryItems.find(x => x.ingredientKey === k);
        aggregated[k].checked = gi ? !!gi.checked : false;
      });

      // Get all manual items from mealSelections
      state.mealSelections.forEach(sel => {
        if (sel.meal === 'manual' && sel.manualItem) {
          const k = normalizeIngredient(sel.manualItem.name);
          if (!aggregated[k]) {
            aggregated[k] = {
              name: sel.manualItem.name,
              quantity: '',
              unit: '',
              group: sel.manualItem.group || 'Other',
              checked: false
            };
            const gi = state.groceryItems.find(x => x.ingredientKey === k);
            aggregated[k].checked = gi ? !!gi.checked : false;
          }
        }
      });

      return Object.values(aggregated);
    }

function openGroceryIngredientPicker(date, meal, recipeId) {
      state.selectedGroceryDate = date;
      state.selectedGroceryMeal = meal;
      state.selectedGroceryRecipeId = recipeId;

      (async () => {
        const selId = `mealSel_${date}_${meal}_${recipeId}`;
        let sel = state.mealSelections.find(s => s.id === selId);
        if (!sel) {
          const r = getRecipeById(recipeId);
          sel = {
            id: selId,
            mealDate: date,
            meal: meal,
            recipeId: recipeId,
            includedIngredientKeys: JSON.stringify([])
          };
          await storage.create(sel);
          state.mealSelections.push(sel);
        }
        state.currentView = 'grocery-ingredients';
        render();
      })();
    }

async function toggleMealIngredient(ingredientKey) {
      const selId = `mealSel_${state.selectedGroceryDate}_${state.selectedGroceryMeal}_${state.selectedGroceryRecipeId}`;
      let sel = state.mealSelections.find(s => s.id === selId);

      let includedKeys = [];
      if (sel) {
        try {
          includedKeys = JSON.parse(sel.includedIngredientKeys || '[]');
        } catch (e) {
          includedKeys = [];
        }
      }

      const index = includedKeys.indexOf(ingredientKey);
      if (index > -1) {
        includedKeys.splice(index, 1);
      } else {
        includedKeys.push(ingredientKey);
      }

      // Update state immediately
      if (sel) {
        sel.includedIngredientKeys = JSON.stringify(includedKeys);
      } else {
        const newSel = {
          id: selId,
          mealDate: state.selectedGroceryDate,
          meal: state.selectedGroceryMeal,
          recipeId: state.selectedGroceryRecipeId,
          includedIngredientKeys: JSON.stringify(includedKeys)
        };
        state.mealSelections.push(newSel);
        sel = newSel;
      }

      // Block real-time updates
      state.ignoreRealtimeUntil = Date.now() + 5000;

      // Debounced save - batch multiple changes
      clearTimeout(state._ingredientSaveTimeout);
      state._ingredientSaveTimeout = setTimeout(async () => {
        try {
          const currentSel = state.mealSelections.find(s => s.id === selId);
          if (currentSel) {
            await storage.update(currentSel);
          }
        } catch (e) {
          console.error('Failed to save ingredient selection:', e);
        }
      }, 500);
    }

function handleIngredientClick(ingredientKey, element) {
      // Toggle the visual immediately
      const isCurrentlyChecked = element.style.background.includes('rgba(232,93,93');
      const newChecked = !isCurrentlyChecked;

      // Update visual
      element.style.background = newChecked ? 'rgba(232,93,93,0.1)' : CONFIG.background_color;
      element.style.border = `1px solid ${newChecked ? CONFIG.primary_action_color : 'transparent'}`;

      const checkbox = element.querySelector('div');
      if (checkbox) {
        checkbox.style.background = newChecked ? CONFIG.primary_action_color : 'transparent';
        checkbox.style.borderColor = newChecked ? CONFIG.primary_action_color : CONFIG.text_muted;
        checkbox.innerHTML = newChecked ? '✓' : '';
      }

      // Update count
      const r = getRecipeById(state.selectedGroceryRecipeId);
      const list = recipeIngList(r);
      const allItems = document.querySelectorAll('[data-ingredient-key]');
      let checkedCount = 0;
      allItems.forEach(item => {
        if (item.style.background.includes('rgba(232,93,93')) checkedCount++;
      });

      // Update state in background
      toggleMealIngredient(ingredientKey);
    }

async function selectAllIngredients() {
      const r = getRecipeById(state.selectedGroceryRecipeId);
      if (!r) return;

      const list = recipeIngList(r);
      const allKeys = list.map(x => normalizeIngredient(x.name));

      const selId = `mealSel_${state.selectedGroceryDate}_${state.selectedGroceryMeal}_${state.selectedGroceryRecipeId}`;
      let sel = state.mealSelections.find(s => s.id === selId);

      if (sel) {
        sel.includedIngredientKeys = JSON.stringify(allKeys);
      } else {
        sel = {
          id: selId,
          mealDate: state.selectedGroceryDate,
          meal: state.selectedGroceryMeal,
          recipeId: state.selectedGroceryRecipeId,
          includedIngredientKeys: JSON.stringify(allKeys)
        };
        state.mealSelections.push(sel);
      }

      state.ignoreRealtimeUntil = Date.now() + 3000;
      render();

      try {
        await storage.update(sel);
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }

async function selectNoIngredients() {
      const selId = `mealSel_${state.selectedGroceryDate}_${state.selectedGroceryMeal}_${state.selectedGroceryRecipeId}`;
      let sel = state.mealSelections.find(s => s.id === selId);

      if (sel) {
        sel.includedIngredientKeys = JSON.stringify([]);
      } else {
        sel = {
          id: selId,
          mealDate: state.selectedGroceryDate,
          meal: state.selectedGroceryMeal,
          recipeId: state.selectedGroceryRecipeId,
          includedIngredientKeys: JSON.stringify([])
        };
        state.mealSelections.push(sel);
      }

      state.ignoreRealtimeUntil = Date.now() + 3000;
      render();

      try {
        await storage.update(sel);
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }

async function toggleAllIngredients(deselectAll) {
      const r = getRecipeById(state.selectedGroceryRecipeId);
      if (!r) return;

      const selId = `mealSel_${state.selectedGroceryDate}_${state.selectedGroceryMeal}_${state.selectedGroceryRecipeId}`;
      let sel = state.mealSelections.find(s => s.id === selId);

      const allIngredients = recipeIngList(r);
      const newKeys = deselectAll ? [] : allIngredients.map(x => normalizeIngredient(x.name));

      state.isLoading = true;
      render();

      try {
        if (sel) {
          const updatedSel = { ...sel, includedIngredientKeys: JSON.stringify(newKeys) };
          await storage.update(updatedSel);
        } else {
          if (state.mealSelections.length >= 999) {
            showError('Maximum limit reached');
            return;
          }
          const newSel = {
            id: selId,
            mealDate: state.selectedGroceryDate,
            meal: state.selectedGroceryMeal,
            recipeId: state.selectedGroceryRecipeId,
            includedIngredientKeys: JSON.stringify(newKeys)
          };
          await storage.create(newSel);
        }
      } finally {
        state.isLoading = false;
        render();
      }
    }

function toggleGroceryItem(ingredientKey) {
      let item = state.groceryItems.find(gi => gi.ingredientKey === ingredientKey);
      let isNew = false;

      if (item) {
        item.checked = !item.checked;
      } else {
        item = {
          id: `grocery_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          ingredientKey: ingredientKey,
          checked: true
        };
        state.groceryItems.push(item);
        isNew = true;
      }

      const isChecked = item.checked;

      // === INSTANT VISUAL TOGGLE (<1ms, optimistic UI) ===
      const row = document.querySelector(`[data-key="${CSS.escape(ingredientKey)}"]`);
      if (row) {
        const checkbox = row.querySelector('div[onclick]');
        const label = row.querySelector('span');
        if (checkbox) {
          if (isChecked) {
            checkbox.setAttribute('style',
              `width:18px; height:18px; background:${CONFIG.primary_action_color}; border-radius:4px; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:bold;`);
            checkbox.textContent = '\u2713';
          } else {
            checkbox.setAttribute('style',
              `width:20px; height:20px; border:2px solid ${CONFIG.text_muted}; border-radius:4px; cursor:pointer; flex-shrink:0;`);
            checkbox.textContent = '';
          }
        }
        if (label) {
          if (isChecked) {
            label.setAttribute('style', `flex:1; color:${CONFIG.text_muted}; font-size:12px; text-decoration:line-through;`);
          } else {
            label.setAttribute('style', `flex:1; color:${CONFIG.text_color}; font-size:13px;`);
          }
        }
        const removeBtn = row.querySelector('button');
        if (removeBtn) {
          removeBtn.style.display = isChecked ? 'none' : '';
        }
      }

      // Update stats counters instantly
      _updateGroceryStats();

      // Block real-time updates during local changes
      state.ignoreRealtimeUntil = Date.now() + 3000;

      // Debounced full render (to move items between checked/unchecked sections)
      clearTimeout(state._groceryRenderTimeout);
      state._groceryRenderTimeout = setTimeout(() => {
        if (state.currentView === 'grocery-list') render();
      }, 1500);

      // === BATCHED STORAGE SAVE (deduped by ingredientKey) ===
      if (!state._grocerySaveBatch) state._grocerySaveBatch = new Map();
      const existing = state._grocerySaveBatch.get(ingredientKey);
      state._grocerySaveBatch.set(ingredientKey, { item, isNew: isNew || (existing && existing.isNew) });

      clearTimeout(state._grocerySaveTimeout);
      state._grocerySaveTimeout = setTimeout(async () => {
        const batch = state._grocerySaveBatch;
        state._grocerySaveBatch = new Map();
        for (const [, { item: batchItem, isNew: batchIsNew }] of batch) {
          try {
            if (batchIsNew) {
              await storage.create(batchItem);
            } else {
              await storage.update(batchItem);
            }
          } catch (e) {
            console.error('Failed to save grocery toggle:', e);
          }
        }
      }, 500);
    }

function _updateGroceryStats() {
      const groceryList = getGroceryList();
      const unchecked = groceryList.filter(i => !i.checked);
      const checked = groceryList.filter(i => i.checked);
      const statDivs = document.querySelectorAll('[data-grocery-stat]');
      statDivs.forEach(div => {
        const type = div.getAttribute('data-grocery-stat');
        if (type === 'unchecked') div.textContent = ' ' + unchecked.length;
        if (type === 'checked') div.textContent = ' ' + checked.length;
      });
    }

async function removeFromGroceryList(ingredientKey) {
      // Instant DOM removal (optimistic UI)
      const row = document.querySelector(`[data-key="${CSS.escape(ingredientKey)}"]`);
      if (row) {
        row.style.transition = 'opacity 150ms, transform 150ms';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => row.remove(), 150);
      }

      const selectionsWithIngredient = state.mealSelections.filter(sel => {
        try {
          const keys = JSON.parse(sel.includedIngredientKeys || '[]');
          return keys.includes(ingredientKey);
        } catch (e) {
          return false;
        }
      });

      for (const sel of selectionsWithIngredient) {
        let keys = JSON.parse(sel.includedIngredientKeys || '[]');
        keys = keys.filter(k => k !== ingredientKey);
        sel.includedIngredientKeys = JSON.stringify(keys);
      }

      state.groceryItems = state.groceryItems.filter(gi => gi.ingredientKey !== ingredientKey);

      _updateGroceryStats();
      showToast('Ingredient removed from grocery list', 'success');

      // Debounced full render to fix layout
      clearTimeout(state._groceryRenderTimeout);
      state._groceryRenderTimeout = setTimeout(() => {
        if (state.currentView === 'grocery-list') render();
      }, 800);

      // Save to database in background
      try {
        for (const sel of selectionsWithIngredient) {
          await storage.update(sel);
        }

        const item = state.groceryItems.find(gi => gi.ingredientKey === ingredientKey);
        if (item) {
          await storage.delete(item);
        }
      } catch (e) {
        console.error('Failed to remove from grocery list:', e);
      }
    }

async function clearAllGroceryItems() {
      state.isLoading = true;
      render();

      try {
        for (const sel of state.mealSelections) {
          await storage.delete(sel);
        }

        for (const item of state.groceryItems) {
          await storage.delete(item);
        }

        showToast('Grocery list cleared', 'success');
      } finally {
        state.isLoading = false;
        navigateTo('grocery-list');
      }
    }

function showAddManualItemModal() {
      openModal(`
        <div style="color: ${CONFIG.text_color};">
          <h2 class="text-2xl font-bold mb-4">Add Manual Item</h2>

          <div class="mb-4">
            <label class="block mb-2 font-semibold">Item Name:</label>
            <input type="text" id="manualItemName"
                   class="w-full px-3 py-2 border rounded"
                   placeholder="e.g., Paper Towels, Dish Soap" />
          </div>

          <div class="mb-4">
            <label class="block mb-2 font-semibold">Category:</label>
            <select id="manualItemGroup" class="w-full px-3 py-2 border rounded">
              ${ING_GROUPS.map(group => `<option value="${group}">${group}</option>`).join('')}
            </select>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
              Cancel
            </button>
            <button onclick="addManualGroceryItem()"
                    class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
              Add Item
            </button>
          </div>
        </div>
      `);
    }

async function addManualGroceryItem() {
      const nameInput = document.getElementById('manualItemName');
      const groupSelect = document.getElementById('manualItemGroup');

      const itemName = nameInput.value.trim();
      const itemGroup = groupSelect.value;

      if (!itemName) {
        showError('Please enter an item name');
        return;
      }

      const ingredientKey = normalizeIngredient(itemName);

      const manualSelId = `mealSel_manual_${Date.now()}`;
      const manualSel = {
        id: manualSelId,
        mealDate: 'manual',
        meal: 'manual',
        recipeId: 'manual',
        manualItem: {
          name: itemName,
          group: itemGroup
        },
        includedIngredientKeys: JSON.stringify([ingredientKey])
      };

      state.isLoading = true;
      closeModal();
      render();

      try {
        await storage.create(manualSel);
        showToast('Item added to grocery list!', 'success');
      } catch (e) {
        showError('Failed to add item');
        console.error(e);
      } finally {
        state.isLoading = false;
        render();
      }
    }

function selectGroceryCategory(btn, cat) {
  document.getElementById('groceryManualCategory').value = cat;
  const row = document.getElementById('groceryCategoryRow');
  if (row) {
    row.querySelectorAll('button').forEach(b => {
      const isSel = b.getAttribute('data-cat') === cat;
      b.style.color = isSel ? CONFIG.primary_action_color : CONFIG.text_muted;
      b.style.background = isSel ? CONFIG.primary_subtle : CONFIG.surface_color;
    });
  }
}

// ============================================================
// VIEW ROUTING AND INITIALIZATION
// ============================================================

const VIEW_RENDERERS = {
  'grocery-list': renderGroceryList,
  'grocery-select-meals': renderGrocerySelectMeals,
  'grocery-ingredients': renderGroceryIngredients
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  if (renderer) {
    content = renderer();
  } else {
    content = renderGroceryList();
    state.currentView = 'grocery-list';
  }

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 72px;">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${typeof renderChefChatButton === 'function' ? renderChefChatButton() : ''}
      ${renderBottomNav()}
    </div>
  `;

  if (typeof renderChefChat === 'function') renderChefChat();
}

// ============================================================
// MISSING FUNCTIONS (extracted from index.original.html)
// ============================================================

// addQuickGroceryItem is defined in home.js (shared across pages)
// If not already available, this stub ensures it doesn't break:
if (typeof addQuickGroceryItem === 'undefined') {
  async function addQuickGroceryItem() {
    const input = document.getElementById('quickGroceryItem');
    const itemName = input?.value.trim();

    if (!itemName) {
      showError('Please enter an item name');
      return;
    }

    const newItem = {
      id: `grocery_${Date.now()}`,
      type: 'grocery',
      name: itemName,
      checked: false,
      addedAt: new Date().toISOString()
    };

    await storage.create(newItem);
    state.groceryItems.push(newItem);

    closeModal();
    showToast(`"${itemName}" added to grocery list!`, 'success');
  }
}

function init() {
  loadAllState();
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView && VIEW_RENDERERS[targetView]) {
    sessionStorage.removeItem('yummy_target_view');
    state.currentView = targetView;
  } else {
    state.currentView = 'grocery-list';
  }
  setupKeyboardShortcuts();
  render();
}

init();
