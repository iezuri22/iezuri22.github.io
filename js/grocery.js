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
              return '<div data-ingredient-key="' + k + '" onclick="handleIngredientClick(\'' + k + '\', this)" style="display:flex; align-items:center; gap:10px; padding:10px; margin-bottom:4px; background:' + (chk ? 'rgba(232,93,93,0.1)' : CONFIG.background_color) + '; border-radius:6px; cursor:pointer; border:1px solid ' + (chk ? CONFIG.primary_action_color : 'transparent') + ';"><div style="width:20px; height:20px; border-radius:4px; border:2px solid ' + (chk ? CONFIG.primary_action_color : CONFIG.text_muted) + '; background:' + (chk ? CONFIG.primary_action_color : 'transparent') + '; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; flex-shrink:0;">' + (chk ? '✓' : '') + '</div><span style="color:' + CONFIG.text_color + '; font-size:13px;">' + esc(ing.qty) + (ing.unit ? ' ' + esc(ing.unit) : '') + ' ' + esc(toTitleCase(ing.name)) + '</span></div>';
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
  const yesterdayStr = getYesterday();

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
              const titleName = toTitleCase(item.name);

              return `
                <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px; ${item.checked ? 'opacity: 0.5; text-decoration: line-through;' : ''}"
                     class="flex items-center justify-between gap-3 p-3 rounded">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleGroceryItem('${normalizeIngredient(item.name)}')">
                    <span>${titleName}</span>
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
              const titleName = toTitleCase(item.name);

              return `
                <div style="color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px; ${item.checked ? 'opacity: 0.5; text-decoration: line-through;' : ''}"
                     class="flex items-center justify-between gap-3 p-3 rounded">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleGroceryItem('${normalizeIngredient(item.name)}')">
                    <span>${titleName}</span>
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

// ============================================================
// "BY RECIPE" VIEW - Group grocery items by source recipe (ChefIQ basket style)
// ============================================================

function findRecipeByTitle(title) {
  if (!title || !state.recipes) return null;
  const lower = title.toLowerCase().trim();
  return state.recipes.find(r => (r.title || '').toLowerCase().trim() === lower);
}

function toggleGroceryRecipeCard(recipeName) {
  if (!state.groceryExpandedRecipes) state.groceryExpandedRecipes = new Set();
  if (state.groceryExpandedRecipes.has(recipeName)) {
    state.groceryExpandedRecipes.delete(recipeName);
  } else {
    state.groceryExpandedRecipes.add(recipeName);
  }
  render();
}

function removeRecipeFromGrocery(recipeName) {
  if (!confirm('Remove all items from "' + recipeName + '"?')) return;
  let list = getSmartGroceryList();
  const toRemove = list.filter(item => item.sourceMeals && item.sourceMeals.length > 0 && item.sourceMeals[0] === recipeName);
  list = list.filter(item => !(item.sourceMeals && item.sourceMeals.length > 0 && item.sourceMeals[0] === recipeName));
  saveSmartGroceryList(list);
  showToast('Removed ' + toRemove.length + ' items from ' + recipeName, 'success');
  render();
}

function renderGroceryByRecipe() {
  const groceryList = getSmartGroceryList();
  if (!state.groceryExpandedRecipes) state.groceryExpandedRecipes = new Set();

  // Group by sourceMeals[0]
  const byRecipe = {};
  const otherItems = [];

  groceryList.forEach(item => {
    if (!item.sourceMeals || item.sourceMeals.length === 0 || item.manual) {
      otherItems.push(item);
    } else {
      const key = item.sourceMeals[0];
      if (!byRecipe[key]) byRecipe[key] = [];
      byRecipe[key].push(item);
    }
  });

  let html = '';

  // Render each recipe card
  Object.entries(byRecipe).forEach(([recipeName, items]) => {
    const recipe = findRecipeByTitle(recipeName);
    const thumb = recipe ? recipeThumb(recipe) : '';
    const servings = recipe && recipe.servings ? recipe.servings + ' servings' : '';
    const uncheckedCount = items.filter(i => !i.checked).length;
    const isExpanded = state.groceryExpandedRecipes.has(recipeName);
    const escapedName = escJs(recipeName);

    html += `
      <div class="grocery-recipe-card ${isExpanded ? 'expanded' : ''}">
        <div class="grocery-recipe-header" onclick="toggleGroceryRecipeCard('${escapedName}')">
          ${thumb ? `<img src="${esc(thumb)}" class="grocery-recipe-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <div class="grocery-recipe-thumb-placeholder" style="display:none;">🍽️</div>` :
            `<div class="grocery-recipe-thumb-placeholder">🍽️</div>`}
          <div class="grocery-recipe-info">
            <div class="grocery-recipe-title">${esc(recipeName)}</div>
            <div class="grocery-recipe-meta">${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''}${servings ? ' · ' + servings : ''}</div>
          </div>
          <button class="grocery-recipe-remove" onclick="event.stopPropagation();removeRecipeFromGrocery('${escapedName}')" title="Remove all items">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
          </button>
          <span class="grocery-recipe-chevron">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </span>
        </div>
        ${isExpanded ? `
          <div class="grocery-recipe-items">
            ${items.map(item => _renderGroceryRow(item, item.checked)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  // Render "Other Items" section
  if (otherItems.length > 0) {
    const isExpanded = state.groceryExpandedRecipes.has('__other__');
    const uncheckedCount = otherItems.filter(i => !i.checked).length;

    html += `
      <div class="grocery-recipe-card ${isExpanded ? 'expanded' : ''}">
        <div class="grocery-recipe-header" onclick="toggleGroceryRecipeCard('__other__')">
          <div class="grocery-recipe-thumb-placeholder">🛒</div>
          <div class="grocery-recipe-info">
            <div class="grocery-recipe-title">Other Items</div>
            <div class="grocery-recipe-meta">${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''}</div>
          </div>
          <span class="grocery-recipe-chevron">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </span>
        </div>
        ${isExpanded ? `
          <div class="grocery-recipe-items">
            ${otherItems.map(item => _renderGroceryRow(item, item.checked)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  if (groceryList.length === 0) {
    html = `<div style="text-align:center;padding:24px 0;color:var(--text-secondary);font-size:13px;">Your grocery list is empty. Add items from a meal or manually.</div>`;
  }

  return html;
}

function renderGroceryList() {
      const groceryList = getSmartGroceryList();
      const unchecked = groceryList.filter(item => !item.checked);
      const checked = groceryList.filter(item => item.checked);
      const stores = getGroceryStores();
      const activeStore = state.groceryStoreFilter || '';

      // Filter by store if active
      const filteredUnchecked = activeStore ? unchecked.filter(i => (i.store || '') === activeStore) : unchecked;
      const filteredChecked = activeStore ? checked.filter(i => (i.store || '') === activeStore) : checked;

      // Frequency / recurring items
      const dueItems = getDueFrequencyItems();
      const allFreqItems = getFrequencyItems();

      // Categorized suggestions
      const catSugg = getCategorizedSuggestions();
      const allSuggestions = [...catSugg.planned];
      _cachedSuggestions = allSuggestions;

      // Store filter pills — only show when grocery items actually have stores assigned
      const storesWithItems = [...new Set(groceryList.map(i => i.store).filter(Boolean))];
      if (activeStore && !storesWithItems.includes(activeStore)) { state.groceryStoreFilter = ''; }
      const storeFilterHtml = storesWithItems.length > 0 ? `
        <div class="gro-store-filters">
          <button class="gro-store-pill ${!state.groceryStoreFilter ? 'active' : ''}" onclick="state.groceryStoreFilter='';render();">All</button>
          ${storesWithItems.map(s => `
            <button class="gro-store-pill ${state.groceryStoreFilter === s ? 'active' : ''}" onclick="state.groceryStoreFilter='${escJs(s)}';render();">${esc(s)}</button>
          `).join('')}
          <button class="gro-store-pill gro-store-pill-add" onclick="showManageStoresModal()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </button>
        </div>
      ` : '';

      // Due recurring items banner
      const dueBannerHtml = dueItems.length > 0 ? `
        <div class="gro-recurring-banner">
          <div class="gro-recurring-banner-left">
            <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992"/></svg>
            <span>${dueItems.length} recurring item${dueItems.length !== 1 ? 's' : ''} due</span>
          </div>
          <button class="gro-recurring-banner-btn" onclick="addAllDueFrequencyItems()">Add all</button>
        </div>
      ` : '';

      // Empty state
      const emptyHtml = (groceryList.length === 0 && allSuggestions.length === 0 && dueItems.length === 0)
        ? `<div class="gro-empty">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
            <div style="margin-top:12px;font-size:15px;font-weight:500;">Your list is empty</div>
            <div style="margin-top:4px;font-size:13px;color:${CONFIG.text_muted};">Add items manually, from a meal, or set up recurring buys</div>
          </div>`
        : '';

      // Suggestion pills
      const suggestionsHtml = allSuggestions.length > 0 ? `
        <div style="margin-bottom:16px;">
          <div class="section-label" style="margin-bottom:8px;">From upcoming meals</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${allSuggestions.slice(0, 8).map((s, i) => `
              <button data-sug-idx="${i}" onclick="handleSuggestClick(${i})"
                class="gro-suggest-pill card-press">
                <svg width="14" height="14" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                ${esc(toTitleCase(s.name))}
              </button>
            `).join('')}
          </div>
        </div>
      ` : '';

      // Has any planned recipes for this week?
      const hasThisWeekPlan = _hasThisWeekPlannedRecipes();

      // Quick actions row
      const quickActionsHtml = `
        <div class="gro-quick-actions">
          ${hasThisWeekPlan ? `
            <button onclick="showAddFromThisWeekModal()" class="gro-quick-btn card-press">
              <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
              <span>This Week</span>
            </button>
          ` : ''}
          <button onclick="showAddFromMealModal()" class="gro-quick-btn card-press">
            <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            <span>From Meal</span>
          </button>
          <button onclick="openIngredientLibraryPage()" class="gro-quick-btn card-press">
            <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <span>Library</span>
          </button>
          <button onclick="showRecurringItemsModal()" class="gro-quick-btn card-press">
            <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992"/></svg>
            <span>Recurring</span>
            ${allFreqItems.length > 0 ? `<span class="gro-quick-badge">${allFreqItems.length}</span>` : ''}
          </button>
          <button onclick="showManageStoresModal()" class="gro-quick-btn card-press">
            <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"/></svg>
            <span>Stores</span>
          </button>
        </div>`;

      // Clear actions
      const clearHtml = groceryList.length > 0 ? `
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          ${checked.length > 0 ? `<button onclick="clearCheckedGrocery()" class="gro-clear-btn">Clear checked (${checked.length})</button>` : ''}
          <button onclick="clearAllGrocerySmart()" class="gro-clear-btn gro-clear-all">Clear all</button>
        </div>
      ` : '';

      return `
        <div class="gro-container" style="display: flex; flex-direction: column; min-height: 100dvh; padding-bottom: calc(50px + env(safe-area-inset-bottom));">
          <!-- Add Item Input -->
          <div class="gro-add-bar">
            <div class="search-bar" style="flex:1;">
              <div class="search-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </div>
              <input type="text" id="groceryManualInput" placeholder="Add an item..." autocomplete="off"
                oninput="_renderGrocerySuggestions(this.value);"
                onkeydown="if(event.key==='Enter'){_groAddManualThenClear();}else if(event.key==='Escape'){this.value='';_renderGrocerySuggestions('');}"
                onfocus="document.getElementById('groceryCategoryRow').style.display='flex';_renderGrocerySuggestions(this.value);"
              />
            </div>
            <button onclick="_groAddManualThenClear()" class="gro-add-btn">Add</button>
          </div>
          <div id="grocerySuggestionsBox" class="gro-suggest-box" style="display:none;"></div>
          <div id="groceryCategoryRow" class="filter-pill-row" style="display:none;flex-wrap:wrap;padding:2px 0;margin-bottom:12px;">
            ${GROCERY_CATEGORIES.map(cat => `
              <button onclick="selectGroceryCategory(this, '${esc(cat)}')" data-cat="${esc(cat)}"
                class="filter-pill ${cat === 'Other' ? 'active' : ''}">${esc(cat)}</button>
            `).join('')}
          </div>
          <input type="hidden" id="groceryManualCategory" value="Other" />

          ${quickActionsHtml}
          ${storeFilterHtml}
          ${dueBannerHtml}
          ${suggestionsHtml}
          ${clearHtml}
          ${emptyHtml}

          <!-- Sort selector -->
          ${(filteredUnchecked.length + filteredChecked.length) > 0 ? `
            <div class="gro-view-toggle gro-sort-toggle">
              <button class="gro-view-btn ${_groSortMode() === 'category' ? 'active' : ''}" onclick="state.groceryViewMode='category';render();">By type</button>
              <button class="gro-view-btn ${_groSortMode() === 'meal' ? 'active' : ''}" onclick="state.groceryViewMode='meal';render();">By meal</button>
              <button class="gro-view-btn ${_groSortMode() === 'default' ? 'active' : ''}" onclick="state.groceryViewMode='default';render();">Default</button>
            </div>
          ` : ''}

          <!-- Main Grocery List -->
          ${_renderGroceryItems(filteredUnchecked, false)}

          <!-- Checked Items -->
          ${filteredChecked.length > 0 ? `
            <div class="gro-checked-section">
              <div class="gro-checked-header" onclick="var c=this.nextElementSibling;c.style.display=c.style.display==='none'?'block':'none';this.querySelector('.gro-chev').style.transform=c.style.display==='none'?'':'rotate(90deg)';">
                <span class="gro-chev" style="transform:rotate(90deg);">&#9656;</span>
                <span>Completed (${filteredChecked.length})</span>
              </div>
              <div style="opacity:0.5;">
                ${_renderGroceryItems(filteredChecked, true)}
              </div>
            </div>
          ` : ''}

          <!-- Bottom CTA fills remaining space so nav stays pinned -->
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 16px;">
            <button onclick="document.getElementById('groceryManualInput')?.focus()" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; background: rgba(255,255,255,0.06); color: ${CONFIG.text_muted}; font-size: 13px; font-weight: 500; border: none; cursor: pointer;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add items
            </button>
          </div>
        </div>

      `;
    }

function _groSortMode() {
  const m = state.groceryViewMode;
  if (m === 'category' || m === 'meal' || m === 'default') return m;
  if (m === 'grid') return 'category';
  return 'default';
}

function _renderGroceryItems(items, isChecked) {
  if (items.length === 0) return '';
  const mode = _groSortMode();
  if (mode === 'category') return _renderGridByCategory(items, isChecked);
  if (mode === 'meal') return _renderGridByMeal(items, isChecked);
  return `<div class="gro-list">${items.map(item => _renderGroceryRow(item, isChecked)).join('')}</div>`;
}

// Group items by the recipe/meal they came from. Items in the same source meal
// stay together; multi-source items appear under their first listed meal.
// Order of meal sections follows the recipe order in this week's plan, so the
// list matches the meal sequence the user will actually cook through.
function _renderGridByMeal(items, isChecked) {
  const MANUAL_KEY = '__manual__';
  const byMeal = {};
  items.forEach(item => {
    const meal = (Array.isArray(item.sourceMeals) && item.sourceMeals[0]) || MANUAL_KEY;
    if (!byMeal[meal]) byMeal[meal] = [];
    byMeal[meal].push(item);
  });

  const planOrder = (() => {
    try {
      const slots = (typeof _getThisWeekPlannedSlots === 'function') ? _getThisWeekPlannedSlots() : [];
      const seen = new Set();
      const order = [];
      slots.forEach(s => {
        const t = s && s.recipe && s.recipe.title;
        if (t && !seen.has(t)) { seen.add(t); order.push(t); }
      });
      return order;
    } catch { return []; }
  })();

  const orderedMeals = [];
  planOrder.forEach(t => { if (byMeal[t]) orderedMeals.push(t); });
  Object.keys(byMeal).forEach(t => {
    if (t !== MANUAL_KEY && !orderedMeals.includes(t)) orderedMeals.push(t);
  });
  if (byMeal[MANUAL_KEY]) orderedMeals.push(MANUAL_KEY);

  return orderedMeals.map(meal => {
    const label = meal === MANUAL_KEY ? 'Added manually' : meal;
    return `
      <div class="gro-grid-category">
        <div class="gro-grid-category-header">${esc(label)}</div>
        <div class="gro-list">
          ${byMeal[meal].map(item => _renderGroceryRow(item, isChecked)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function _renderGridByCategory(items, isChecked) {
  const byCategory = {};
  items.forEach(item => {
    const cat = item.category || guessGroceryCategory(item.name);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  // Sort categories: GROCERY_CATEGORIES order first, then any extras
  const orderedCats = GROCERY_CATEGORIES.filter(c => byCategory[c]);
  Object.keys(byCategory).forEach(c => {
    if (!orderedCats.includes(c)) orderedCats.push(c);
  });

  if (orderedCats.length === 0) return '';

  return orderedCats.map(cat => `
    <div class="gro-grid-category">
      <div class="gro-grid-category-header">${esc(cat)}</div>
      <div class="gro-grid">
        ${byCategory[cat].map(item => _renderGroceryGridCard(item, isChecked)).join('')}
      </div>
    </div>
  `).join('');
}

function _renderGroceryRow(item, isChecked) {
      const name = toTitleCase(item.name);
      const qtyLabel = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : '';
      const sourceLabel = item.sourceMeals && item.sourceMeals.length > 0
        ? item.sourceMeals.join(', ') : '';
      const photo = findIngredientPhoto(item.name);
      const escapedItemName = escJs(item.name);
      const escapedId = escJs(item.id);
      const store = item.store || '';

      // Wrapper hosts swipe action backgrounds and the swipe gesture handler.
      // Tapping the row body opens the actions sheet (set store, edit, etc.).
      // Swipe right toggles checked, swipe left removes the item — wired in
      // _initGrocerySwipeGestures().
      return `
        <div data-gro-id="${esc(item.id)}" class="gro-swipe-wrapper">
          <div class="gro-swipe-action gro-swipe-action-check" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${isChecked ? 'Uncheck' : 'Done'}</span>
          </div>
          <div class="gro-swipe-action gro-swipe-action-delete" aria-hidden="true">
            <span>Delete</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <div class="gro-item ${isChecked ? 'gro-item-checked' : ''}">
            <div class="gro-item-check">
              <div class="gro-checkbox ${isChecked ? 'checked' : ''}">
                ${isChecked ? '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
              </div>
            </div>
            <div class="gro-item-photo" onclick="event.stopPropagation();${photo ? `openPhotoExpandOverlay('${escJs(photo)}','${escapedItemName}')` : `openPhotoSearch('${escapedItemName}',function(url){setIngredientPhoto('${escapedItemName}',url);_scheduleGroceryRender(100);})`}">
              ${photo
                ? `<img src="${esc(photo)}" class="gro-item-img" />`
                : `<div class="gro-item-img-placeholder">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
                  </div>`
              }
            </div>
            <div class="gro-item-body">
              <div class="gro-item-name ${isChecked ? 'checked' : ''}">${esc(name)}</div>
              <div class="gro-item-meta">
                ${qtyLabel ? `<span class="gro-item-qty">${esc(qtyLabel)}</span>` : ''}
                ${sourceLabel ? `<span class="gro-item-source">from ${esc(sourceLabel)}</span>` : ''}
              </div>
              ${store ? `<span class="gro-item-store-tag">${esc(store)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }

// Wire up swipe gestures + tap-to-open-actions on rendered grocery rows.
// Swipe right → toggle checked. Swipe left → delete. Tap anywhere on the
// row body (other than the photo) → open the per-item action sheet.
// Idempotent per-element via _swipeInit flag.
function _initGrocerySwipeGestures() {
  const wrappers = document.querySelectorAll('.gro-swipe-wrapper');
  const COMMIT_PX = 90;
  const REVEAL_PX = 24;
  const DECIDE_PX = 6;

  wrappers.forEach(wrapper => {
    if (wrapper._swipeInit) return;
    wrapper._swipeInit = true;

    const row = wrapper.querySelector('.gro-item');
    const itemId = wrapper.getAttribute('data-gro-id');
    if (!row || !itemId) return;

    let startX = 0, startY = 0, dx = 0;
    let active = false;
    let decided = false;
    let isHorizontal = false;
    let touchActive = false;

    const isInteractive = (el) =>
      !!(el && (el.closest('.gro-item-photo')));

    const reset = () => {
      row.style.transition = 'transform 0.2s ease';
      row.style.transform = '';
      wrapper.classList.remove('swipe-right', 'swipe-left', 'swipe-commit-right', 'swipe-commit-left', 'swiping');
    };

    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      if (isInteractive(e.target)) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      dx = 0; active = true; decided = false; isHorizontal = false;
      touchActive = true;
      row.style.transition = 'none';
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!active) return;
      const t = e.touches[0];
      const dxRaw = t.clientX - startX;
      const dyRaw = t.clientY - startY;
      if (!decided) {
        if (Math.abs(dxRaw) < DECIDE_PX && Math.abs(dyRaw) < DECIDE_PX) return;
        if (Math.abs(dyRaw) > Math.abs(dxRaw)) {
          // Vertical scroll wins — bail out so the page can scroll.
          active = false;
          reset();
          return;
        }
        decided = true;
        isHorizontal = true;
        wrapper.classList.add('swiping');
      }
      e.preventDefault();
      dx = dxRaw;
      row.style.transform = `translateX(${dx}px)`;
      wrapper.classList.toggle('swipe-right', dx > REVEAL_PX);
      wrapper.classList.toggle('swipe-left', dx < -REVEAL_PX);
      wrapper.classList.toggle('swipe-commit-right', dx > COMMIT_PX);
      wrapper.classList.toggle('swipe-commit-left', dx < -COMMIT_PX);
    }, { passive: false });

    const onEnd = (e) => {
      if (!active) {
        // touchcancel during vertical scroll — clear touch flag so a real
        // tap later still works.
        if (e && e.type === 'touchcancel') touchActive = false;
        return;
      }
      active = false;
      const wasSwipe = isHorizontal;
      const movedDx = dx;
      wrapper.classList.remove('swiping');
      row.style.transition = 'transform 0.2s ease';

      if (movedDx > COMMIT_PX) {
        // Toggle data ourselves + render directly. Calling
        // toggleSmartGroceryItem would also schedule a render 1.2s out,
        // leaving the off-screen wrapper visible as a colored strip.
        row.style.transform = `translateX(110%)`;
        setTimeout(() => {
          const list = getSmartGroceryList();
          const it = list.find(i => i.id === itemId);
          if (it) { it.checked = !it.checked; saveSmartGroceryList(list); }
          if (typeof _updateGroceryBadge === 'function') _updateGroceryBadge();
          if (typeof render === 'function') render();
        }, 180);
        if (e && e.cancelable) e.preventDefault();
      } else if (movedDx < -COMMIT_PX) {
        // Mutate data ourselves and re-render — calling removeSmartGroceryItem
        // would re-set transform/opacity on this same wrapper and snap it
        // back from -110% to -20px before fading.
        row.style.transform = `translateX(-110%)`;
        setTimeout(() => {
          const list = getSmartGroceryList().filter(i => i.id !== itemId);
          saveSmartGroceryList(list);
          if (typeof _updateGroceryBadge === 'function') _updateGroceryBadge();
          if (typeof render === 'function') render();
        }, 180);
        if (e && e.cancelable) e.preventDefault();
      } else if (!wasSwipe && e && e.type === 'touchend' && !isInteractive(e.target)) {
        // Treat as tap → open the action sheet. preventDefault suppresses the
        // synthetic click that would otherwise follow on mobile.
        reset();
        if (e.cancelable) e.preventDefault();
        showGroceryItemActions(itemId);
      } else {
        reset();
      }
      // Clear the touch flag after the click that may follow.
      setTimeout(() => { touchActive = false; }, 350);
    };

    wrapper.addEventListener('touchend', onEnd);
    wrapper.addEventListener('touchcancel', (e) => {
      if (active) { active = false; reset(); }
      touchActive = false;
    });

    // Desktop / non-touch fallback: regular click opens the action sheet.
    wrapper.addEventListener('click', (e) => {
      if (touchActive) return;
      if (isInteractive(e.target)) return;
      showGroceryItemActions(itemId);
    });
  });
}

function _renderGroceryGridCard(item, isChecked) {
      const name = toTitleCase(item.name);
      const qtyLabel = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : '';
      const photo = findIngredientPhoto(item.name);
      const escapedItemName = escJs(item.name);
      const escapedId = escJs(item.id);
      const store = item.store || '';

      return `
        <div data-gro-id="${esc(item.id)}" class="gro-grid-card ${isChecked ? 'gro-grid-card-checked' : ''}">
          <div class="gro-grid-card-photo" onclick="event.stopPropagation();${photo ? `openPhotoExpandOverlay('${escJs(photo)}','${escapedItemName}')` : `openPhotoSearch('${escapedItemName}',function(url){setIngredientPhoto('${escapedItemName}',url);_scheduleGroceryRender(100);})`}">
            ${photo
              ? `<img src="${esc(photo)}" class="gro-grid-card-img" />`
              : `<div class="gro-grid-card-img-placeholder">
                  <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
                </div>`
            }
            <div class="gro-grid-card-check" onclick="event.stopPropagation();toggleSmartGroceryItem('${escapedId}')">
              <div class="gro-checkbox ${isChecked ? 'checked' : ''}">
                ${isChecked ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
              </div>
            </div>
            ${!isChecked ? `
              <button class="gro-grid-card-delete" onclick="event.stopPropagation();removeSmartGroceryItem('${escapedId}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ` : ''}
          </div>
          <div class="gro-grid-card-body" onclick="toggleSmartGroceryItem('${escapedId}')">
            <div class="gro-grid-card-name ${isChecked ? 'checked' : ''}">${esc(name)}</div>
            ${qtyLabel ? `<div class="gro-grid-card-qty">${esc(qtyLabel)}</div>` : ''}
            ${store ? `<span class="gro-grid-card-store">${esc(store)}</span>` : ''}
          </div>
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

      // Auto-add to inventory when checking off a grocery item
      if (isChecked) {
        const groceryList = getGroceryList();
        const groceryItem = groceryList.find(gi => normalizeIngredient(gi.name) === ingredientKey);
        if (groceryItem) {
          const alreadyInInventory = (state.inventory || []).some(inv =>
            inv.name.toLowerCase() === groceryItem.name.toLowerCase()
          );
          if (!alreadyInInventory) {
            addInventoryItem({
              name: groceryItem.name,
              quantity: 1,
              unit: groceryItem.unit || '',
              category: guessGroceryCategory(groceryItem.name)
            });
          }
        }
      }

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
        if (state.currentView === 'grocery-list') {
          const scrollEl = document.getElementById('app');
          const scrollPos = scrollEl ? scrollEl.scrollTop : window.scrollY;
          render();
          requestAnimationFrame(() => {
            if (scrollEl) scrollEl.scrollTop = scrollPos;
            else window.scrollTo(0, scrollPos);
          });
        }
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

// Autocomplete for the manual-add input. Splits library matches into two
// groups: exact/starts-with on the full name (or any merged alias), and a
// looser similarity bucket that catches token-level prefix hits, substring,
// and stem-canonical containment (so "tomato" surfaces "Cherry Tomatoes",
// "Sun-Dried Tomatoes", "Tomato Paste", etc.). Items already on the list are
// excluded — the user can see them in the main list above.
function _groSearchLibrary(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { byName: [], bySimilarity: [] };
  const all = (typeof buildIngredientLibrary === 'function') ? buildIngredientLibrary() : [];
  const onListCanonicals = new Set(getSmartGroceryList().map(i => canonicalIngredientName(i.name)));
  const qCanon = canonicalIngredientName(q);

  const byName = [];
  const bySimilarity = [];

  all.forEach(entry => {
    if (onListCanonicals.has(entry.canonical)) return;
    const lower = (entry.name || '').toLowerCase();
    const eCanon = entry.canonical || '';

    const isExact = lower === q;
    const isStarts = lower.startsWith(q);
    const aliasMatch = (entry.mergedFrom || []).some(m => {
      const ml = (m.name || '').toLowerCase();
      return ml === q || ml.startsWith(q);
    });

    if (isExact || isStarts || aliasMatch) {
      byName.push({ entry, score: isExact ? 0 : (isStarts ? 1 : 2) });
      return;
    }

    const tokens = lower.split(/[\s\-]+/).filter(Boolean);
    const tokenStarts = tokens.some(t => t.startsWith(q));
    const containsQ = lower.includes(q);
    const canonContains = qCanon && eCanon && (eCanon.includes(qCanon) || qCanon.includes(eCanon));

    if (tokenStarts || containsQ || canonContains) {
      bySimilarity.push({ entry, score: tokenStarts ? 1 : (containsQ ? 2 : 3) });
    }
  });

  byName.sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name));
  bySimilarity.sort((a, b) => a.score - b.score || a.entry.name.length - b.entry.name.length);

  return {
    byName: byName.slice(0, 5).map(x => x.entry),
    bySimilarity: bySimilarity.slice(0, 5).map(x => x.entry),
  };
}

function _renderGrocerySuggestions(query) {
  const box = document.getElementById('grocerySuggestionsBox');
  if (!box) return;
  const q = String(query || '').trim();
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return; }

  const { byName, bySimilarity } = _groSearchLibrary(q);
  const titled = toTitleCase(q);

  if (byName.length === 0 && bySimilarity.length === 0) {
    box.innerHTML = `<div class="gro-suggest-empty">No library matches. Press Enter to add &ldquo;${esc(titled)}&rdquo; as a new item.</div>`;
    box.style.display = 'block';
    return;
  }

  const renderRow = (entry) => {
    const photo = (typeof findIngredientPhoto === 'function') ? findIngredientPhoto(entry.name) : null;
    const recipeCount = (entry.recipeNames || []).length;
    let subtitle = '';
    if (recipeCount === 1) subtitle = `In ${entry.recipeNames[0]}`;
    else if (recipeCount > 1) subtitle = `In ${recipeCount} recipes`;
    else if (entry.isCustom) subtitle = 'Custom';
    else if (entry.category) subtitle = entry.category;
    const safe = escJs(entry.canonical);
    return `
      <button type="button" class="gro-suggest-row" onmousedown="event.preventDefault();" onclick="_groSelectSuggestion('${safe}')">
        <div class="gro-suggest-thumb">
          ${photo
            ? `<img src="${esc(photo)}" alt="" />`
            : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272"/></svg>`
          }
        </div>
        <div class="gro-suggest-body">
          <div class="gro-suggest-name">${esc(entry.name)}</div>
          ${subtitle ? `<div class="gro-suggest-sub">${esc(subtitle)}</div>` : ''}
        </div>
        <svg class="gro-suggest-add" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </button>
    `;
  };

  const sectionHtml = (label, list) => list.length === 0 ? '' : `
    <div class="gro-suggest-section">
      <div class="gro-suggest-section-label">${label}</div>
      ${list.map(renderRow).join('')}
    </div>
  `;

  box.innerHTML = `
    ${sectionHtml('Matches', byName)}
    ${sectionHtml('Similar items', bySimilarity)}
    <div class="gro-suggest-footer">Press Enter to add &ldquo;${esc(titled)}&rdquo; as a new item.</div>
  `;
  box.style.display = 'block';
}

function _groSelectSuggestion(canonical) {
  const all = (typeof buildIngredientLibrary === 'function') ? buildIngredientLibrary() : [];
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;

  const list = getSmartGroceryList();
  if (list.some(i => canonicalIngredientName(i.name) === canonical)) {
    showToast(`${entry.name} is already on your list`, 'info');
  } else {
    list.push({
      id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: entry.name,
      category: entry.category || 'Other',
      qty: '',
      unit: '',
      checked: false,
      manual: !!entry.isCustom,
      sourceMeals: (entry.recipeNames || []).slice(0, 5),
      store: state.groceryStoreFilter || (typeof getLastSelectedStore === 'function' ? getLastSelectedStore() || '' : ''),
      addedAt: Date.now()
    });
    saveSmartGroceryList(list);
    showToast(`${entry.name} added`, 'success');
  }

  const input = document.getElementById('groceryManualInput');
  if (input) input.value = '';
  _renderGrocerySuggestions('');
  _scheduleGroceryRender(150);
}

// Adds whatever is currently typed (existing manual flow) and dismisses the
// suggestion dropdown so it doesn't linger across the upcoming rerender.
function _groAddManualThenClear() {
  if (typeof addManualGroceryItemSmart === 'function') addManualGroceryItemSmart();
  _renderGrocerySuggestions('');
}

async function addManualGroceryItem() {
      const nameInput = document.getElementById('manualItemName');
      const groupSelect = document.getElementById('manualItemGroup');

      const rawName = nameInput.value.trim();
      const itemGroup = groupSelect.value;

      if (!rawName) {
        showError('Please enter an item name');
        return;
      }

      const itemName = displayIngredientName(rawName) || rawName;
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

// Action sheet that consolidates per-item grocery actions (store, edit,
// delete) into a single menu so the row stays compact and the item name has
// room to breathe.
function showGroceryItemActions(itemId) {
  const item = getSmartGroceryList().find(i => i.id === itemId);
  if (!item) return;
  const eid = escJs(itemId);
  const storeLabel = item.store ? `Store: ${esc(item.store)}` : 'Set store';
  openModal(`
    <div style="color:${CONFIG.text_color};">
      <div style="font-size:15px;font-weight:600;margin:0 0 4px;line-height:1.3;word-break:break-word;">${esc(item.name)}</div>
      <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:14px;">${esc(item.category || 'Other')}${item.qty ? ' · ' + esc(item.qty) + (item.unit ? ' ' + esc(item.unit) : '') : ''}</div>
      <button onclick="closeModal();showStorePickerForItem('${eid}')"
        style="display:flex;align-items:center;gap:12px;width:100%;padding:14px;background:${CONFIG.surface_color};border:none;border-radius:12px;color:${CONFIG.text_color};font-size:14px;cursor:pointer;margin-bottom:6px;text-align:left;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"/></svg>
        <span>${storeLabel}</span>
      </button>
      <button onclick="closeModal();showEditGroceryItemModal('${eid}')"
        style="display:flex;align-items:center;gap:12px;width:100%;padding:14px;background:${CONFIG.surface_color};border:none;border-radius:12px;color:${CONFIG.text_color};font-size:14px;cursor:pointer;margin-bottom:6px;text-align:left;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
        <span>Edit / allergic</span>
      </button>
      <button onclick="closeModal();removeSmartGroceryItem('${eid}')"
        style="display:flex;align-items:center;gap:12px;width:100%;padding:14px;background:${CONFIG.surface_color};border:none;border-radius:12px;color:${CONFIG.danger_color};font-size:14px;cursor:pointer;margin-bottom:10px;text-align:left;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
        <span>Remove from list</span>
      </button>
      <button onclick="closeModal()"
        style="width:100%;padding:12px;background:${CONFIG.surface_elevated};border:none;border-radius:12px;color:${CONFIG.text_muted};font-size:14px;cursor:pointer;">Cancel</button>
    </div>
  `);
}

// Edit a grocery item (rename) and optionally remove the ingredient from the
// source recipe(s) it was pulled from. Useful when the user develops an
// allergy or just wants to stop seeing this ingredient in a recipe.
function showEditGroceryItemModal(itemId) {
  const item = getSmartGroceryList().find(i => i.id === itemId);
  if (!item) return;
  const sourceMeals = Array.isArray(item.sourceMeals) ? item.sourceMeals : [];
  const sourceRecipes = sourceMeals
    .map(title => findRecipeByTitle(title))
    .filter(Boolean);

  const recipeChecksHtml = sourceRecipes.length === 0
    ? `<div style="font-size:12px;color:${CONFIG.text_muted};padding:8px 0;">This item isn't linked to a recipe.</div>`
    : sourceRecipes.map(r => `
        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:${CONFIG.surface_color};border-radius:10px;margin-bottom:6px;cursor:pointer;">
          <input type="checkbox" data-edit-recipe-id="${esc(r.id)}" style="width:18px;height:18px;accent-color:${CONFIG.primary_action_color};flex-shrink:0;" />
          <span style="font-size:13px;color:${CONFIG.text_color};line-height:1.3;">${esc(r.title)}</span>
        </label>
      `).join('');

  openModal(`
    <div style="color:${CONFIG.text_color};">
      <h2 style="font-size:17px;font-weight:600;margin:0 0 12px;">Edit Item</h2>

      <label style="display:block;font-size:12px;color:${CONFIG.text_muted};margin-bottom:6px;">Name</label>
      <input type="text" id="editGroItemName" value="${esc(item.name)}"
        style="width:100%;padding:10px 12px;background:${CONFIG.surface_color};border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:${CONFIG.text_color};font-size:16px;margin-bottom:16px;" />

      <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:6px;">Allergic? Remove from these recipes too:</div>
      ${recipeChecksHtml}

      <div style="display:flex;gap:8px;margin-top:16px;">
        <button onclick="closeModal()"
          style="padding:10px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;flex:1;font-size:14px;">Cancel</button>
        <button onclick="saveEditGroceryItem('${escJs(itemId)}')"
          style="padding:10px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:10px;cursor:pointer;flex:2;font-size:14px;font-weight:600;">Save</button>
      </div>
    </div>
  `);
}

async function saveEditGroceryItem(itemId) {
  const nameInput = document.getElementById('editGroItemName');
  const newName = (nameInput?.value || '').trim();
  if (!newName) { showError('Name cannot be empty'); return; }

  // 1. Update the grocery list entry.
  const list = getSmartGroceryList();
  const item = list.find(i => i.id === itemId);
  if (!item) { closeModal(); return; }
  const oldCanonical = canonicalIngredientName(item.name);
  item.name = toTitleCase(newName);
  saveSmartGroceryList(list);

  // 2. Remove the ingredient from any recipes the user ticked.
  const checks = document.querySelectorAll('[data-edit-recipe-id]');
  const recipeIdsToEdit = Array.from(checks)
    .filter(cb => cb.checked)
    .map(cb => cb.getAttribute('data-edit-recipe-id'));

  let editedCount = 0;
  for (const rid of recipeIdsToEdit) {
    const recipe = getRecipeById(rid);
    if (!recipe || !Array.isArray(recipe.ingredientsRows)) continue;
    const before = recipe.ingredientsRows.length;
    recipe.ingredientsRows = recipe.ingredientsRows.filter(row =>
      canonicalIngredientName(row.name) !== oldCanonical
    );
    if (recipe.ingredientsRows.length !== before) {
      try { await storage.update(recipe); editedCount++; }
      catch (e) { console.error('[edit grocery] update recipe failed:', e); }
    }
  }

  closeModal();
  showToast(
    editedCount > 0
      ? `Updated · removed from ${editedCount} recipe${editedCount !== 1 ? 's' : ''}`
      : 'Item updated',
    'success'
  );
  if (typeof render === 'function') render();
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
  'grocery-ingredients': renderGroceryIngredients,
  'grocery-library': renderGroceryLibrary
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  try {
    if (renderer) {
      content = renderer();
    } else {
      content = renderGroceryList();
      state.currentView = 'grocery-list';
    }
  } catch (e) {
    console.error('[render] Error rendering grocery view:', e);
    content = `<div style="padding:24px;text-align:center;color:${CONFIG.text_muted};">
      <div style="font-size:15px;margin-bottom:8px;">Something went wrong loading the grocery list.</div>
      <div style="font-size:12px;margin-bottom:16px;">${esc(String(e.message || 'Unknown error'))}</div>
      <button onclick="render()" style="padding:8px 16px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Try Again</button>
    </div>`;
  }

  const shellClass = state.currentView === 'grocery-list'
    ? `${getAppShellClass()} app-shell--grocery-list`
    : getAppShellClass();
  app.innerHTML = `
    <div class="${shellClass}">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${renderBottomNav()}
    </div>
  `;

  if (state.currentView === 'grocery-list') _initGrocerySwipeGestures();
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

// ============================================================
// STORE PICKER & RECURRING ITEMS MODALS
// ============================================================

function showStorePickerForItem(itemId) {
  const stores = getGroceryStores();
  const list = getSmartGroceryList();
  const item = list.find(i => i.id === itemId);
  const currentStore = item ? (item.store || '') : '';
  const safeId = escJs(itemId);

  const pickerStoresFromItems = [...new Set(list.map(i => i.store).filter(Boolean))];
  const pickerFreqStores = [...new Set(getFrequencyItems().map(i => i.store).filter(Boolean))];
  const pickerAllKnown = [...new Set([...DEFAULT_STORES, ...pickerStoresFromItems, ...pickerFreqStores])];
  const pickerQuickAdd = pickerAllKnown.filter(s => !stores.some(st => st.toLowerCase() === s.toLowerCase()));

  // Saved stores render as filled pills with an inline ✕ remove. Tapping the
  // name assigns; tapping ✕ removes the store from the saved list.
  const savedPillsHtml = stores.map(s => {
    const active = currentStore === s;
    return `
      <span style="display:inline-flex;align-items:stretch;background:${active ? 'rgba(232,93,93,0.18)' : CONFIG.surface_color};border:1px solid ${active ? CONFIG.primary_action_color : 'transparent'};border-radius:20px;overflow:hidden;">
        <button onclick="setGroceryItemStore('${safeId}','${escJs(s)}');setLastSelectedStore('${escJs(s)}');closeModal();showToast('Assigned to ${escJs(s)}','success');render();"
          style="padding:8px 6px 8px 14px;background:none;border:none;color:${CONFIG.text_color};font-size:13px;cursor:pointer;">${esc(s)}</button>
        <button onclick="event.stopPropagation();removeStoreFromPicker('${escJs(s)}','${safeId}');"
          aria-label="Remove ${esc(s)}"
          style="padding:8px 12px 8px 6px;background:none;border:none;color:${CONFIG.text_muted};font-size:14px;line-height:1;cursor:pointer;">✕</button>
      </span>
    `;
  }).join('');

  // Suggested (not yet saved) — dashed pills, tap to save+assign in one go.
  const suggestedPillsHtml = pickerQuickAdd.slice(0, 8).map(s => `
    <button onclick="addGroceryStore('${escJs(s)}');setGroceryItemStore('${safeId}','${escJs(s)}');setLastSelectedStore('${escJs(s)}');closeModal();showToast('Assigned to ${escJs(s)}','success');render();"
      style="padding:8px 14px;background:${CONFIG.surface_color};border:1px dashed rgba(255,255,255,0.18);border-radius:20px;color:${CONFIG.text_muted};font-size:13px;cursor:pointer;">+ ${esc(s)}</button>
  `).join('');

  const allPillsHtml = (savedPillsHtml + suggestedPillsHtml) ||
    `<span style="font-size:13px;color:${CONFIG.text_muted};">No stores yet — add one below.</span>`;

  openModal(`
    <div style="color:${CONFIG.text_color};">
      <div style="font-size:17px;font-weight:600;margin-bottom:14px;">Assign Store</div>
      <button onclick="setGroceryItemStore('${safeId}','');closeModal();render();"
        style="margin-bottom:14px;padding:8px 14px;background:${!currentStore ? 'rgba(232,93,93,0.18)' : CONFIG.surface_color};border:1px solid ${!currentStore ? CONFIG.primary_action_color : 'transparent'};border-radius:20px;color:${CONFIG.text_color};font-size:13px;cursor:pointer;">
        No store
      </button>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${allPillsHtml}
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;">
        <input type="text" id="newStoreInput" placeholder="Add a new store..."
          onkeydown="if(event.key==='Enter'){addNewStoreAndAssign(this.value,'${safeId}');}"
          style="flex:1;padding:12px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:${CONFIG.text_color};font-size:14px;outline:none;" />
        <button onclick="addNewStoreAndAssign(document.getElementById('newStoreInput').value,'${safeId}');"
          style="padding:12px 16px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Add</button>
      </div>
    </div>
  `);
}

function addNewStoreAndAssign(storeName, itemId) {
  const trimmed = (storeName || '').trim();
  if (!trimmed) return;
  addGroceryStore(trimmed);
  setGroceryItemStore(itemId, trimmed);
  setLastSelectedStore(trimmed);
  closeModal();
  showToast(`Assigned to ${trimmed}`, 'success');
  if (typeof render === 'function') render();
}

// Remove a saved store from inside the picker, then re-render the picker so
// the pill disappears in place (no jarring close + reopen).
function removeStoreFromPicker(storeName, itemId) {
  removeGroceryStore(storeName);
  showStorePickerForItem(itemId);
}

function showManageStoresModal() {
  const stores = getGroceryStores();
  const groceryListForStores = getSmartGroceryList();
  const storesFromItems = [...new Set(groceryListForStores.map(i => i.store).filter(Boolean))];
  const freqStores = [...new Set(getFrequencyItems().map(i => i.store).filter(Boolean))];
  const allKnownStores = [...new Set([...DEFAULT_STORES, ...storesFromItems, ...freqStores])];
  const quickAddStores = allKnownStores.filter(s => !stores.some(st => st.toLowerCase() === s.toLowerCase()));

  const defaultStoresHtml = quickAddStores.length > 0
    ? `<div style="margin-top:16px;">
        <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:8px;">Quick add</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${quickAddStores.map(s => `
            <button onclick="addGroceryStore('${escJs(s)}');showManageStoresModal();"
              style="padding:8px 14px;background:${CONFIG.surface_color};border:1px dashed rgba(255,255,255,0.1);border-radius:20px;color:${CONFIG.text_muted};font-size:13px;cursor:pointer;">+ ${esc(s)}</button>
          `).join('')}
        </div>
      </div>`
    : '';

  openModal(`
    <div style="color:${CONFIG.text_color};">
      <div style="font-size:17px;font-weight:600;margin-bottom:16px;">My Stores</div>
      ${stores.length === 0 ? `<div style="text-align:center;padding:16px;color:${CONFIG.text_muted};font-size:13px;">No stores yet. Add your go-to stores below.</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${stores.map(s => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:${CONFIG.surface_color};border-radius:12px;">
            <span style="font-size:15px;">${esc(s)}</span>
            <button onclick="removeGroceryStore('${escJs(s)}');showManageStoresModal();"
              style="background:none;border:none;color:${CONFIG.danger_color || '#ff6b6b'};cursor:pointer;padding:4px;font-size:13px;">Remove</button>
          </div>
        `).join('')}
      </div>
      ${defaultStoresHtml}
      <div style="margin-top:16px;display:flex;gap:8px;">
        <input type="text" id="newStoreInput" placeholder="Add a store..."
          onkeydown="if(event.key==='Enter'){addGroceryStore(this.value);showManageStoresModal();}"
          style="flex:1;padding:12px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:${CONFIG.text_color};font-size:14px;outline:none;" />
        <button onclick="addGroceryStore(document.getElementById('newStoreInput').value);showManageStoresModal();"
          style="padding:12px 16px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Add</button>
      </div>
    </div>
  `);
}

function showRecurringItemsModal() {
  const freqItems = getFrequencyItems();
  const stores = getGroceryStores();

  const storeOptions = stores.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  openModal(`
    <div style="color:${CONFIG.text_color};max-height:80vh;display:flex;flex-direction:column;">
      <div style="font-size:17px;font-weight:600;margin-bottom:16px;">Recurring Buys</div>
      <div style="font-size:13px;color:${CONFIG.text_muted};margin-bottom:16px;">Items you buy on a regular schedule. They'll be suggested when due.</div>

      <!-- Add new recurring item -->
      <div style="background:${CONFIG.surface_color};border-radius:12px;padding:14px;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">Add recurring item</div>
        <input type="text" id="freqItemName" placeholder="Item name (e.g., Paper Towels)"
          style="width:100%;padding:10px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:${CONFIG.text_color};font-size:14px;margin-bottom:8px;outline:none;box-sizing:border-box;" />
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <select id="freqItemFrequency" style="flex:1;padding:10px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:${CONFIG.text_color};font-size:13px;">
            ${FREQUENCY_OPTIONS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
          </select>
          <select id="freqItemStore" style="flex:1;padding:10px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:${CONFIG.text_color};font-size:13px;">
            <option value="">Any store</option>
            ${storeOptions}
          </select>
        </div>
        <select id="freqItemCategory" style="width:100%;padding:10px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:${CONFIG.text_color};font-size:13px;margin-bottom:10px;">
          ${GROCERY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <button onclick="addFreqItemFromModal()"
          style="width:100%;padding:10px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Add</button>
      </div>

      <!-- Existing recurring items -->
      <div style="overflow-y:auto;flex:1;">
        ${freqItems.length === 0
          ? `<div style="text-align:center;padding:24px;color:${CONFIG.text_muted};font-size:13px;">No recurring items yet</div>`
          : freqItems.map(item => {
            const freq = FREQUENCY_OPTIONS.find(f => f.value === item.frequency);
            const isDue = getDueFrequencyItems().some(d => d.id === item.id);
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:14px;background:${CONFIG.surface_color};border-radius:12px;margin-bottom:6px;${isDue ? `border-left:3px solid ${CONFIG.primary_action_color};` : ''}">
                <div style="flex:1;min-width:0;">
                  <div style="font-size:15px;font-weight:500;">${esc(toTitleCase(item.name))}</div>
                  <div style="font-size:12px;color:${CONFIG.text_muted};margin-top:2px;">
                    ${freq ? freq.label : item.frequency}${item.store ? ` · ${esc(item.store)}` : ''}${isDue ? ` · <span style="color:${CONFIG.primary_action_color};">Due now</span>` : ''}
                  </div>
                </div>
                ${isDue ? `<button onclick="addFrequencyItemToGrocery('${esc(item.id)}');showRecurringItemsModal();"
                  style="padding:8px 12px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">Add</button>` : ''}
                <button onclick="removeFrequencyItem('${esc(item.id)}');showRecurringItemsModal();"
                  style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `);
}

function addFreqItemFromModal() {
  const name = document.getElementById('freqItemName')?.value.trim();
  const frequency = document.getElementById('freqItemFrequency')?.value || 'monthly';
  const store = document.getElementById('freqItemStore')?.value || '';
  const category = document.getElementById('freqItemCategory')?.value || 'Other';
  if (!name) { showToast('Enter an item name', 'error'); return; }
  const added = addFrequencyItem(name, frequency, store, category);
  if (!added) { showToast('Already in recurring list', 'info'); return; }
  showToast(`${toTitleCase(name)} added as recurring`, 'success');
  showRecurringItemsModal();
}

// ============================================================
// ADD FROM THIS WEEK'S PLAN
// ============================================================

function _readThisWeekPlan() {
  const ws = state.currentWeekStartDate;
  const stored = localStorage.getItem('yummy_weekplan');
  if (!stored) return null;
  try {
    const plan = JSON.parse(stored);
    if (plan && plan.weekStart === ws && plan.days) return plan;
  } catch (e) {}
  return null;
}

function _comboToRecipeShape(combo) {
  if (!combo) return null;
  const slots = combo.slots || [];
  const ingredientsRows = [];
  for (const s of slots) {
    const comp = (state.components || []).find(c => c.id === s.componentId);
    if (!comp || !Array.isArray(comp.ingredients)) continue;
    for (const ing of comp.ingredients) {
      if (!ing || !ing.name) continue;
      ingredientsRows.push({
        qty: String(ing.amount ?? ing.qty ?? '').trim(),
        unit: String(ing.unit || '').trim(),
        name: String(ing.name).trim(),
        group: ing.group || comp.category || 'Other'
      });
    }
  }
  return {
    id: combo.id,
    title: combo.name || 'Combo',
    ingredientsRows
  };
}

function _getThisWeekPlannedSlots() {
  const plan = _readThisWeekPlan();
  if (!plan) return [];
  const ws = state.currentWeekStartDate;
  const dates = getWeekDates(ws);
  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const out = [];
  // Match Home page's "This Week's Plan": up to 2 unique recipes per meal type,
  // deduped across the week. Max 6 cards total (2 breakfast, 2 lunch, 2 dinner).
  for (const mealType of ['breakfast', 'lunch', 'dinner']) {
    const seenKeys = new Set();
    let count = 0;
    for (const dateStr of dates) {
      if (count >= 2) break;
      const slot = plan.days?.[dateStr]?.[mealType];
      const entry = slot?.options?.[0];
      if (!entry) continue;
      const source = entry.source || 'recipe';
      let recipe = null;
      let recipeId = null;
      let displayTitle = '';
      let displayImage = '';
      let dedupeKey = '';
      if (source === 'takeout') continue;
      if (source === 'manual') {
        if (entry.similarToRecipeId) {
          recipe = getRecipeById(entry.similarToRecipeId);
          recipeId = entry.similarToRecipeId;
        }
        displayTitle = entry.manualName || (recipe?.title) || 'Manual recipe';
        displayImage = entry.imageUrl || (recipe ? recipeThumb(recipe) : '');
        if (!recipe) continue;
        dedupeKey = 'manual:' + (entry.similarToRecipeId || displayTitle);
      } else if (entry.type === 'combo' || source === 'combo') {
        const combo = (state.combos || []).find(c => c.id === entry.comboId);
        if (!combo) continue;
        recipe = _comboToRecipeShape(combo);
        if (!recipe || !recipe.ingredientsRows.length) continue;
        recipeId = combo.id;
        displayTitle = combo.name || 'Combo';
        displayImage = '';
        dedupeKey = 'combo:' + combo.id;
      } else if (entry.recipeId) {
        recipe = getRecipeById(entry.recipeId);
        recipeId = entry.recipeId;
        if (!recipe) continue;
        displayTitle = recipe.title || 'Recipe';
        displayImage = recipeThumb(recipe);
        dedupeKey = 'recipe:' + entry.recipeId;
      } else {
        continue;
      }
      if (!recipeIngList(recipe).length) continue;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);
      out.push({ dateStr, mealType, recipe, recipeId, mealLabel: mealLabels[mealType], displayTitle, displayImage });
      count++;
    }
  }
  return out;
}

function _hasThisWeekPlannedRecipes() {
  return _getThisWeekPlannedSlots().length > 0;
}

// ---- Weekly added-pairs tracking (resets on week roll-over) ----
const GROCERY_WEEK_TRACKING_KEY = 'groceryAddedThisWeek_v1';

function _slotMealId(slot) {
  return `${slot.dateStr}_${slot.mealType}_${slot.recipeId}`;
}

function getWeekAddedTracking() {
  try {
    const raw = localStorage.getItem(GROCERY_WEEK_TRACKING_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || obj.weekStart !== state.currentWeekStartDate) return null;
    return obj;
  } catch (e) { return null; }
}

function _saveWeekAddedTracking(tracking) {
  try { localStorage.setItem(GROCERY_WEEK_TRACKING_KEY, JSON.stringify(tracking)); }
  catch (e) { console.error('[groceryWeekTracking] localStorage write failed:', e); }
  if (typeof syncGroceryWeekTrackingToSupabase !== 'function') return;
  state.ignoreRealtimeUntil = Date.now() + 10000;
  syncGroceryWeekTrackingToSupabase(tracking).then(() => {
    state.ignoreRealtimeUntil = Math.max(state.ignoreRealtimeUntil || 0, Date.now() + 3000);
  }).catch(e => {
    console.error('[groceryWeekTracking] sync failed:', e);
    state.ignoreRealtimeUntil = Math.max(state.ignoreRealtimeUntil || 0, Date.now() + 30000);
    setTimeout(() => syncGroceryWeekTrackingToSupabase(tracking).catch(err => console.error('[groceryWeekTracking] retry failed:', err)), 4000);
  });
}

function _getMealAddedCanonicals(mealId) {
  const t = getWeekAddedTracking();
  if (!t || !t.added || !t.added[mealId]) return new Set();
  return new Set(Object.keys(t.added[mealId]));
}

function _markIngredientsAdded(mealId, canonicals) {
  let t = getWeekAddedTracking();
  if (!t) t = { weekStart: state.currentWeekStartDate, added: {} };
  if (!t.added[mealId]) t.added[mealId] = {};
  canonicals.forEach(c => { if (c) t.added[mealId][c] = true; });
  _saveWeekAddedTracking(t);
}

// ---- Step 1: meal selection sheet ----
function showAddFromThisWeekModal() {
  const slots = _getThisWeekPlannedSlots();
  if (slots.length === 0) {
    showToast('No recipes planned for this week', 'info');
    return;
  }
  window._weekPlanPickerSlots = slots;
  // Default: nothing selected. (Previously-added meals stay unselected by default
  // but remain tappable so the user can re-add ingredients they skipped.)
  window._weekPlanPickerSelections = new Set();
  window._weekPlanIngredientReview = null;

  _renderMealSelectionStep();
}

function _renderMealSelectionStep() {
  const slots = window._weekPlanPickerSlots || [];
  const sel = window._weekPlanPickerSelections;

  const modalHtml = `<div style="color:${CONFIG.text_color};max-height:80vh;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-shrink:0;">
      <div style="min-width:0;">
        <h2 style="font-size:17px;font-weight:600;margin:0 0 4px;">Add from this week's plan</h2>
        <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:12px;">Tap meals to pick which ones you want ingredients from.</div>
      </div>
      <button onclick="closeModal()" aria-label="Close"
        style="background:${CONFIG.surface_color};border:none;color:${CONFIG.text_muted};cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="weekPlanPickerGrid" style="overflow-y:auto;flex:1;margin:0 -8px;padding:0 8px 12px;min-height:0;">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
        ${slots.map((s, i) => {
          const selected = sel.has(i);
          const mealId = _slotMealId(s);
          const previouslyAdded = _getMealAddedCanonicals(mealId).size > 0;
          const img = s.displayImage;
          const cardOpacity = previouslyAdded && !selected ? 'opacity:0.55;' : '';
          return `
            <div onclick="_toggleWeekPlanPick(${i})"
              style="position:relative;border-radius:14px;overflow:hidden;cursor:pointer;background:${CONFIG.surface_color};outline:2px solid ${selected ? CONFIG.primary_action_color : 'transparent'};-webkit-tap-highlight-color:transparent;${cardOpacity}">
              <div style="position:relative;aspect-ratio:4/3;background:#0d0d0d;">
                ${img
                  ? `<img src="${esc(img)}" style="width:100%;height:100%;object-fit:cover;${selected ? '' : 'opacity:0.6;'}" loading="lazy" onerror="this.style.display='none'"/>`
                  : `<div style="width:100%;height:100%;background:${getPlaceholderGradient(s.recipe)};${selected ? '' : 'opacity:0.6;'}"></div>`
                }
                <span style="position:absolute;top:8px;left:8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;color:white;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:3px 8px;border-radius:6px;">${s.mealLabel}</span>
                ${previouslyAdded ? `<span style="position:absolute;bottom:8px;left:8px;font-size:10px;font-weight:600;letter-spacing:0.3px;color:white;background:rgba(48,209,88,0.85);padding:3px 8px;border-radius:6px;">Added</span>` : ''}
                <div style="position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:${selected ? CONFIG.primary_action_color : 'rgba(0,0,0,0.55)'};display:flex;align-items:center;justify-content:center;color:white;border:1.5px solid ${selected ? CONFIG.primary_action_color : 'rgba(255,255,255,0.6)'};">
                  ${selected ? '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
                </div>
              </div>
              <div style="padding:8px 10px 10px;">
                <h3 style="font-size:13px;font-weight:600;color:${CONFIG.text_color};margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">${esc(s.displayTitle)}</h3>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
    <div style="flex-shrink:0;background:${CONFIG.surface_elevated};margin:0 -16px -16px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,0.06);">
      <button id="weekPlanPickerConfirm" onclick="_advanceToIngredientReview()"
        style="width:100%;padding:14px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:600;-webkit-tap-highlight-color:transparent;">Save</button>
    </div>
  </div>`;

  openModal(modalHtml);
  _updateMealSelectionConfirm();
}

function _updateMealSelectionConfirm() {
  const btn = document.getElementById('weekPlanPickerConfirm');
  if (!btn) return;
  const sel = window._weekPlanPickerSelections;
  const n = sel ? sel.size : 0;
  btn.disabled = n === 0;
  btn.style.opacity = n === 0 ? '0.5' : '1';
  btn.style.cursor = n === 0 ? 'not-allowed' : 'pointer';
  btn.textContent = n === 0 ? 'Save' : `Save (${n})`;
}

function _toggleWeekPlanPick(idx) {
  const sel = window._weekPlanPickerSelections;
  if (!sel) return;
  if (sel.has(idx)) sel.delete(idx);
  else sel.add(idx);
  _renderMealSelectionStep();
}

// ---- Step 2: ingredient review sheet ----
function _advanceToIngredientReview() {
  const slots = window._weekPlanPickerSlots || [];
  const sel = window._weekPlanPickerSelections || new Set();
  if (sel.size === 0) return;

  const groceryList = getSmartGroceryList();
  const groceryListCanonicals = new Set(groceryList.map(i => canonicalIngredientName(i.name)));

  const meals = Array.from(sel).sort((a, b) => a - b).map(idx => {
    const slot = slots[idx];
    const mealId = _slotMealId(slot);
    const previouslyAddedFromMeal = _getMealAddedCanonicals(mealId);
    const ings = recipeIngList(slot.recipe).map(ing => {
      const canonical = canonicalIngredientName(ing.name);
      const alreadyOnList = canonical && groceryListCanonicals.has(canonical);
      const staple = isStaple(ing.name);
      // Default checked = NOT already on the grocery list AND not a pantry staple.
      // Staples (salt, oil, etc.) are assumed to be at home; user can manually check
      // them if they actually need to restock.
      return {
        canonical,
        name: ing.name,
        qty: ing.qty || '',
        unit: ing.unit || '',
        category: mapToGroceryCategory(ing.group || 'Other'),
        alreadyOnList,
        staple,
        previouslyAddedFromMeal: previouslyAddedFromMeal.has(canonical),
        checked: !alreadyOnList && !staple
      };
    });
    return { slotIdx: idx, slot, mealId, ingredients: ings };
  });

  window._weekPlanIngredientReview = meals;
  _renderIngredientReviewStep();
}

function _renderIngredientReviewStep() {
  const meals = window._weekPlanIngredientReview || [];
  const totalChecked = meals.reduce((sum, m) => sum + m.ingredients.filter(i => i.checked).length, 0);

  const modalHtml = `<div style="color:${CONFIG.text_color};max-height:85vh;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;position:sticky;top:0;background:${CONFIG.surface_elevated};z-index:2;padding:4px 0 8px;">
      <button onclick="_renderMealSelectionStep()" aria-label="Back"
        style="background:none;border:none;color:${CONFIG.text_color};cursor:pointer;padding:4px 6px;display:flex;align-items:center;border-radius:8px;flex-shrink:0;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
      </button>
      <h2 style="font-size:16px;font-weight:600;margin:0;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Review ingredients</h2>
      <button id="ingredientReviewConfirm" onclick="confirmAddFromThisWeek()"
        style="padding:9px 14px;min-height:36px;background:${totalChecked === 0 ? CONFIG.surface_color : CONFIG.primary_action_color};color:${totalChecked === 0 ? CONFIG.text_muted : 'white'};border:none;border-radius:999px;cursor:${totalChecked === 0 ? 'default' : 'pointer'};font-size:13px;font-weight:600;flex-shrink:0;white-space:nowrap;">${totalChecked === 0 ? 'Add' : `Add (${totalChecked})`}</button>
    </div>
    <div style="font-size:12px;color:${CONFIG.text_muted};margin:0 0 12px 30px;">Uncheck items you don't need (already at home, etc.).</div>

    <div id="ingredientReviewBody" style="overflow-y:auto;flex:1;margin:0 -4px;padding:0 4px;min-height:0;">
      ${meals.map((m, mi) => `
        <div style="margin-bottom:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 4px 8px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:6px;">
            <div style="min-width:0;">
              <div style="font-size:14px;font-weight:600;color:${CONFIG.text_color};line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;">${esc(m.slot.displayTitle)}</div>
              <div style="font-size:11px;color:${CONFIG.text_muted};margin-top:1px;">${esc(m.slot.mealLabel)}${m.slot.dateStr ? ' · ' + esc(formatDateDisplay(m.slot.dateStr)) : ''}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;margin-left:8px;">
              <button onclick="_setMealReviewAll(${mi}, true)" style="padding:5px 10px;background:${CONFIG.surface_color};color:${CONFIG.text_muted};border:none;border-radius:100px;font-size:11px;cursor:pointer;">All</button>
              <button onclick="_setMealReviewAll(${mi}, false)" style="padding:5px 10px;background:${CONFIG.surface_color};color:${CONFIG.text_muted};border:none;border-radius:100px;font-size:11px;cursor:pointer;">None</button>
            </div>
          </div>
          ${m.ingredients.length === 0 ? `<div style="padding:10px;color:${CONFIG.text_muted};font-size:12px;">No ingredients on this recipe.</div>` : m.ingredients.map((ing, ii) => {
            const qtyLabel = ing.qty ? `${esc(ing.qty)}${ing.unit ? ' ' + esc(ing.unit) : ''} · ` : '';
            return `
              <div data-review-row data-mi="${mi}" data-ii="${ii}" onclick="_toggleReviewIngredient(${mi},${ii})"
                style="display:flex;align-items:flex-start;gap:10px;padding:10px;margin-bottom:4px;background:${ing.checked ? 'rgba(232,93,93,0.08)' : CONFIG.surface_color};border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;${ing.alreadyOnList && !ing.checked ? 'opacity:0.7;' : ''}">
                <div data-review-checkbox style="width:22px;height:22px;border-radius:6px;border:2px solid ${ing.checked ? CONFIG.primary_action_color : CONFIG.text_muted};background:${ing.checked ? CONFIG.primary_action_color : 'transparent'};display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;margin-top:2px;">
                  ${ing.checked ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;color:${CONFIG.text_color};line-height:1.35;word-break:break-word;">${esc(toTitleCase(ing.name))}</div>
                  <div style="font-size:11px;color:${CONFIG.text_muted};margin-top:2px;">
                    ${qtyLabel}${ing.alreadyOnList ? '<span style="color:#30d158;font-weight:500;">Already added</span>' : ing.staple ? '<span style="font-weight:500;">Pantry staple</span>' : esc(ing.category)}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      `).join('')}
    </div>

  </div>`;

  openModal(modalHtml);
  _updateIngredientReviewConfirm();
}

function _updateIngredientReviewConfirm() {
  const meals = window._weekPlanIngredientReview || [];
  const total = meals.reduce((sum, m) => sum + m.ingredients.filter(i => i.checked).length, 0);
  const btn = document.getElementById('ingredientReviewConfirm');
  if (!btn) return;
  btn.disabled = total === 0;
  btn.style.background = total === 0 ? CONFIG.surface_color : CONFIG.primary_action_color;
  btn.style.color = total === 0 ? CONFIG.text_muted : 'white';
  btn.style.cursor = total === 0 ? 'default' : 'pointer';
  btn.textContent = total === 0 ? 'Add' : `Add (${total})`;
}

// Mutate the row's DOM in place so we don't re-render the whole modal — that
// was resetting scroll to the top on every tap.
function _applyReviewRowState(row, ing) {
  if (!row) return;
  row.style.background = ing.checked ? 'rgba(232,93,93,0.08)' : CONFIG.surface_color;
  row.style.opacity = (ing.alreadyOnList && !ing.checked) ? '0.7' : '1';
  const cb = row.querySelector('[data-review-checkbox]');
  if (cb) {
    cb.style.borderColor = ing.checked ? CONFIG.primary_action_color : CONFIG.text_muted;
    cb.style.background = ing.checked ? CONFIG.primary_action_color : 'transparent';
    cb.innerHTML = ing.checked
      ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '';
  }
}

function _toggleReviewIngredient(mealIdx, ingIdx) {
  const meals = window._weekPlanIngredientReview;
  if (!meals || !meals[mealIdx] || !meals[mealIdx].ingredients[ingIdx]) return;
  const ing = meals[mealIdx].ingredients[ingIdx];
  ing.checked = !ing.checked;
  const row = document.querySelector(`[data-review-row][data-mi="${mealIdx}"][data-ii="${ingIdx}"]`);
  _applyReviewRowState(row, ing);
  _updateIngredientReviewConfirm();
}

function _setMealReviewAll(mealIdx, value) {
  const meals = window._weekPlanIngredientReview;
  if (!meals || !meals[mealIdx]) return;
  meals[mealIdx].ingredients.forEach((ing, ii) => {
    ing.checked = !!value;
    const row = document.querySelector(`[data-review-row][data-mi="${mealIdx}"][data-ii="${ii}"]`);
    _applyReviewRowState(row, ing);
  });
  _updateIngredientReviewConfirm();
}

function _parseQtyToNumber(qty) {
  if (qty == null) return null;
  const s = String(qty).trim();
  if (!s) return null;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const w = parseInt(mixed[1], 10);
    const n = parseInt(mixed[2], 10);
    const d = parseInt(mixed[3], 10);
    if (d) return w + n / d;
  }
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const n = parseInt(frac[1], 10);
    const d = parseInt(frac[2], 10);
    if (d) return n / d;
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

function _formatQty(n) {
  if (n == null || isNaN(n)) return '';
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
  return String(Math.round(n * 100) / 100);
}

function confirmAddFromThisWeek() {
  const meals = window._weekPlanIngredientReview || [];
  if (meals.length === 0) return;

  // Aggregate only the user-checked ingredients, deduped across meals.
  const aggregated = {};
  // Per-meal canonicals to write back into the weekly tracking ledger.
  const markByMeal = {};

  for (const m of meals) {
    const recipeTitle = m.slot.recipe && m.slot.recipe.title ? m.slot.recipe.title : (m.slot.displayTitle || '');
    for (const ing of m.ingredients) {
      if (!ing.checked || !ing.canonical) continue;
      if (!markByMeal[m.mealId]) markByMeal[m.mealId] = [];
      markByMeal[m.mealId].push(ing.canonical);

      const parsedQty = _parseQtyToNumber(ing.qty);
      const unit = (ing.unit || '').trim().toLowerCase();

      if (!aggregated[ing.canonical]) {
        aggregated[ing.canonical] = {
          name: displayIngredientName(ing.name) || ing.name,
          qty: parsedQty,
          unit,
          category: ing.category,
          mealNames: recipeTitle ? [recipeTitle] : [],
          unitsCompatible: true
        };
      } else {
        const a = aggregated[ing.canonical];
        if (a.unit === unit) {
          if (parsedQty != null && a.qty != null) a.qty += parsedQty;
          else if (parsedQty != null && a.qty == null) a.qty = parsedQty;
        } else {
          a.unitsCompatible = false;
        }
        if (recipeTitle && !a.mealNames.includes(recipeTitle)) a.mealNames.push(recipeTitle);
      }
    }
  }

  if (Object.keys(aggregated).length === 0) {
    showToast('Nothing selected', 'info');
    return;
  }

  const list = getSmartGroceryList();
  let added = 0;
  let updated = 0;

  for (const canonical of Object.keys(aggregated)) {
    const item = aggregated[canonical];
    const existing = list.find(i => canonicalIngredientName(i.name) === canonical);

    if (existing) {
      const existingUnit = (existing.unit || '').trim().toLowerCase();
      const existingQty = _parseQtyToNumber(existing.qty);
      if (item.unitsCompatible && existingUnit === item.unit && existingQty != null && item.qty != null) {
        existing.qty = _formatQty(existingQty + item.qty);
      } else if (item.qty != null && existingQty == null && (existingUnit === item.unit || !existingUnit)) {
        existing.qty = _formatQty(item.qty);
        if (!existingUnit && item.unit) existing.unit = item.unit;
      }
      const sm = existing.sourceMeals || [];
      item.mealNames.forEach(m => { if (m && !sm.includes(m)) sm.push(m); });
      existing.sourceMeals = sm;
      if (existing.checked) existing.checked = false;
      updated++;
    } else {
      list.push({
        id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + added,
        name: toTitleCase(item.name),
        category: item.category,
        qty: item.qty != null ? _formatQty(item.qty) : '',
        unit: item.unit || '',
        checked: false,
        manual: false,
        sourceMeals: item.mealNames.filter(Boolean),
        store: getLastSelectedStore() || '',
        addedAt: Date.now()
      });
      added++;
    }
  }

  saveSmartGroceryList(list);

  // Persist (meal_id, ingredient_canonical) pairs for this week so the next
  // visit can dim previously-added meals and pre-uncheck their ingredients.
  Object.entries(markByMeal).forEach(([mealId, canonicals]) => {
    _markIngredientsAdded(mealId, canonicals);
  });

  // Clear ephemeral picker state.
  window._weekPlanPickerSlots = null;
  window._weekPlanPickerSelections = null;
  window._weekPlanIngredientReview = null;

  closeModal();

  const msg = added > 0 && updated > 0
    ? `${added} added, ${updated} updated`
    : added > 0
      ? `${added} ingredient${added !== 1 ? 's' : ''} added`
      : updated > 0
        ? `${updated} ingredient${updated !== 1 ? 's' : ''} updated`
        : 'No new ingredients';
  showToast(msg, 'success');
  if (typeof render === 'function') render();
}

// ============================================================
// INGREDIENT LIBRARY (deduplicated master list across all recipes)
// ============================================================

const LIB_ALIASES_KEY = 'ingredientLibraryAliases_v1';
const LIB_CUSTOM_KEY = 'ingredientLibraryCustom_v1';
const LIB_MASTER_NAMES_KEY = 'ingredientLibraryMasterNames_v1';
const LIB_HIDDEN_KEY = 'ingredientLibraryHidden_v1';

// All four library overrides go through Supabase via persistIngredientLibraryOverrides
// so renames/merges/custom-adds/hidden-items survive a refresh and propagate
// across the user's devices. Without this, applySupabaseData rebuilds the
// library from recipe data on the next load and the override appears to "come
// back" — see "rename of -oz bag edamame reverts" report.
function _libGetAliases() {
  try { return JSON.parse(localStorage.getItem(LIB_ALIASES_KEY) || '{}') || {}; } catch { return {}; }
}
function _libSaveAliases(map) {
  localStorage.setItem(LIB_ALIASES_KEY, JSON.stringify(map || {}));
  if (typeof persistIngredientLibraryOverrides === 'function') persistIngredientLibraryOverrides();
}
function _libGetMasterNames() {
  try { return JSON.parse(localStorage.getItem(LIB_MASTER_NAMES_KEY) || '{}') || {}; } catch { return {}; }
}
function _libSaveMasterNames(map) {
  localStorage.setItem(LIB_MASTER_NAMES_KEY, JSON.stringify(map || {}));
  if (typeof persistIngredientLibraryOverrides === 'function') persistIngredientLibraryOverrides();
}
function _libGetCustom() {
  try { return JSON.parse(localStorage.getItem(LIB_CUSTOM_KEY) || '[]') || []; } catch { return []; }
}
function _libSaveCustom(list) {
  localStorage.setItem(LIB_CUSTOM_KEY, JSON.stringify(list || []));
  if (typeof persistIngredientLibraryOverrides === 'function') persistIngredientLibraryOverrides();
}
// Hidden canonicals — items the user has "deleted" from the library. Recipe-
// derived entries can't be truly removed (the recipe still references them),
// so we suppress them here. Stored as an array; treated as a Set in code.
function _libGetHidden() {
  try { return new Set(JSON.parse(localStorage.getItem(LIB_HIDDEN_KEY) || '[]') || []); } catch { return new Set(); }
}
function _libSaveHidden(set) {
  localStorage.setItem(LIB_HIDDEN_KEY, JSON.stringify(Array.from(set || [])));
  if (typeof persistIngredientLibraryOverrides === 'function') persistIngredientLibraryOverrides();
}

// Resolve a canonical name through the alias chain (a→b→c) so callers always
// see the final master, even after multiple merges.
function _libResolveCanonical(canonical, aliases) {
  let cur = canonical;
  const seen = new Set();
  while (aliases[cur] && !seen.has(cur)) {
    seen.add(cur);
    cur = aliases[cur];
  }
  return cur;
}

// Build the deduplicated ingredient library:
// {
//   masterCanonical: {
//     name, canonical, recipeIds:Set, recipeNames:Set,
//     isCustom, mergedFrom: [{ canonical, name }], category, group
//   }
// }
function buildIngredientLibrary() {
  const aliases = _libGetAliases();
  const masterNames = _libGetMasterNames();
  const map = new Map();

  function getOrCreate(masterCanon, displayName, group) {
    if (!map.has(masterCanon)) {
      map.set(masterCanon, {
        name: masterNames[masterCanon] || displayName,
        canonical: masterCanon,
        recipeIds: new Set(),
        recipeNames: new Set(),
        isCustom: false,
        mergedFrom: [],
        group: group || 'Other'
      });
    } else if (masterNames[masterCanon]) {
      // Always honor an explicit master name override
      map.get(masterCanon).name = masterNames[masterCanon];
    }
    return map.get(masterCanon);
  }

  (state.recipes || []).forEach(r => {
    if (!r || r.isDraft || r.isTip) return;
    const ings = recipeIngList(r);
    if (!ings.length) return;
    ings.forEach(ing => {
      const rawName = ing.name || '';
      if (!rawName) return;
      const canonical = canonicalIngredientName(rawName);
      if (!canonical) return;
      const masterCanon = _libResolveCanonical(canonical, aliases);
      const display = toTitleCase(displayIngredientName(rawName) || rawName);
      const entry = getOrCreate(masterCanon, display, ing.group);
      if (r.id) entry.recipeIds.add(r.id);
      if (r.title) entry.recipeNames.add(r.title);
      // Prefer a non-custom group from a real recipe
      if ((!entry.group || entry.group === 'Other') && ing.group) entry.group = ing.group;
    });
  });

  // Add custom library items (manual additions from user)
  _libGetCustom().forEach(c => {
    const rawName = c.name || '';
    if (!rawName) return;
    const canonical = canonicalIngredientName(rawName);
    if (!canonical) return;
    const masterCanon = _libResolveCanonical(canonical, aliases);
    const display = toTitleCase(displayIngredientName(rawName) || rawName);
    const entry = getOrCreate(masterCanon, display, c.group || 'Other');
    // Only flag as custom-only if no recipe contributed
    if (entry.recipeIds.size === 0) entry.isCustom = true;
  });

  // Annotate mergedFrom on each master so the UI can show what was merged
  Object.entries(aliases).forEach(([alias, master]) => {
    const finalMaster = _libResolveCanonical(master, aliases);
    if (!map.has(finalMaster)) return;
    map.get(finalMaster).mergedFrom.push({
      canonical: alias,
      name: toTitleCase(alias)
    });
  });

  // Annotate each entry with inPantry (true if the same canonical is in the
  // user's inventory) so the row can show a "Pantry" badge.
  const pantryCanonicals = new Set(
    (state.inventory || [])
      .map(it => canonicalIngredientName(it.name || ''))
      .filter(Boolean)
  );

  // Hidden canonicals get filtered out entirely. The user can recover them
  // via the "Show hidden" toggle (TODO) — for now they're suppressed.
  const hidden = _libGetHidden();

  return Array.from(map.values())
    .filter(e => !hidden.has(e.canonical))
    .map(e => ({
      ...e,
      recipeNames: Array.from(e.recipeNames),
      recipeIds: Array.from(e.recipeIds),
      inPantry: pantryCanonicals.has(e.canonical),
      category: mapToGroceryCategory(e.group || 'Other')
    })).sort((a, b) => a.name.localeCompare(b.name));
}

function _libIsOnGrocery(canonical) {
  return getSmartGroceryList().some(i => canonicalIngredientName(i.name) === canonical);
}

function showIngredientLibraryModal() {
  window._libView = 'list';
  window._librarySearch = '';
  window._libraryMergeSource = null;
  const modalHtml = `
    <div style="color:${CONFIG.text_color};max-height:85vh;display:flex;flex-direction:column;">
      <div id="libModalHeader" style="flex-shrink:0;"></div>
      <div id="libModalBody" style="overflow-y:auto;flex:1;margin:0 -12px;padding:0 12px;min-height:200px;"></div>
      <div id="libModalFooter" style="flex-shrink:0;padding-top:10px;"></div>
    </div>
  `;
  openModal(modalHtml);
  _libRender();
}

function _libRender() {
  const view = window._libView || 'list';
  if (view === 'mergePicker') return _libRenderMergePicker();
  if (view === 'manageMerges') return _libRenderManageMerges();
  return _libRenderMainList();
}

function _libRenderMainList() {
  const header = document.getElementById('libModalHeader');
  const body = document.getElementById('libModalBody');
  const footer = document.getElementById('libModalFooter');
  if (!header || !body || !footer) return;

  const aliases = _libGetAliases();
  const aliasCount = Object.keys(aliases).length;

  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
      <h2 style="font-size:17px;font-weight:600;margin:0;">Ingredient Library</h2>
      <button onclick="closeModal()" aria-label="Close"
        style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
      <input id="libSearchInput" type="text" placeholder="Search ingredients..." value="${esc(window._librarySearch || '')}"
        oninput="window._librarySearch=this.value;_libRenderListResults();"
        style="flex:1;padding:10px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;outline:none;" />
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;font-size:12px;color:${CONFIG.text_muted};">
      <span>Tap the + to add to grocery, or tap an item for more actions.</span>
      ${aliasCount > 0 ? `<button onclick="_libSetView('manageMerges')" style="background:none;border:none;color:${CONFIG.primary_action_color};cursor:pointer;padding:0;font-size:12px;text-decoration:underline;">Manage merges (${aliasCount})</button>` : ''}
    </div>
  `;

  footer.innerHTML = `
    <button onclick="closeModal()" style="width:100%;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;font-size:14px;">Done</button>
  `;

  _libRenderListResults();

  setTimeout(() => {
    const inp = document.getElementById('libSearchInput');
    if (inp && document.activeElement !== inp && !window._librarySearch) inp.focus();
  }, 50);
}

function _libRenderListResults() {
  const body = document.getElementById('libModalBody');
  if (!body) return;
  const all = buildIngredientLibrary();
  const q = (window._librarySearch || '').trim().toLowerCase();
  const filtered = q ? all.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.mergedFrom.some(m => m.name.toLowerCase().includes(q)) ||
    e.recipeNames.some(n => n.toLowerCase().includes(q))
  ) : all;

  // Manual add row appears when search has no exact match (case-insensitive)
  const exactExists = q && all.some(e =>
    e.name.toLowerCase() === q ||
    canonicalIngredientName(e.name) === canonicalIngredientName(q)
  );
  const manualAddHtml = (q && !exactExists) ? `
    <button onclick="_libAddCustomFromSearch()" class="lib-add-custom-row">
      <div class="lib-add-custom-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </div>
      <div style="flex:1;text-align:left;">
        <div style="font-size:14px;font-weight:600;color:${CONFIG.text_color};">Add "${esc(toTitleCase(q))}"</div>
        <div style="font-size:12px;color:${CONFIG.text_muted};">Save to library and grocery list</div>
      </div>
    </button>
  ` : '';

  const emptyHtml = filtered.length === 0 && !manualAddHtml ? `
    <div style="padding:32px 16px;text-align:center;color:${CONFIG.text_muted};">
      <div style="font-size:14px;margin-bottom:6px;">No ingredients yet</div>
      <div style="font-size:12px;">Add recipes with ingredients, or type a name above to add a custom item.</div>
    </div>
  ` : '';

  const rowsHtml = filtered.map(e => _libRenderRow(e)).join('');

  body.innerHTML = `
    ${manualAddHtml}
    ${emptyHtml}
    <div class="lib-list">${rowsHtml}</div>
    ${(!q && all.length > 0) ? `<div style="text-align:center;font-size:12px;color:${CONFIG.text_muted};padding:14px 0 4px;">${all.length} unique ingredient${all.length !== 1 ? 's' : ''}</div>` : ''}
  `;
}

// Per-category palette for the library row badge. Soft, low-chroma fills with
// a brighter foreground so the chip stays readable on the dark surface.
const _LIB_CATEGORY_BADGE_COLORS = {
  'Produce':              { bg: 'rgba(76,217,100,0.18)',  fg: '#7ee399' },
  'Meat & Seafood':       { bg: 'rgba(232,93,93,0.18)',   fg: '#f08a8a' },
  'Dairy & Eggs':         { bg: 'rgba(255,209,102,0.18)', fg: '#ffd166' },
  'Pantry & Dry Goods':   { bg: 'rgba(217,158,98,0.18)',  fg: '#e0b07a' },
  'Spices & Seasonings':  { bg: 'rgba(255,138,76,0.18)',  fg: '#ff9d6e' },
  'Frozen':               { bg: 'rgba(94,180,232,0.18)',  fg: '#7ec0ee' },
  'Bakery':               { bg: 'rgba(214,168,124,0.18)', fg: '#dcb491' },
  'Beverages':            { bg: 'rgba(140,180,255,0.18)', fg: '#a8c4ff' },
  'Snacks':               { bg: 'rgba(241,200,74,0.18)',  fg: '#f1c84a' },
  'Household':            { bg: 'rgba(160,160,180,0.18)', fg: '#b8b8c8' },
  'Other':                { bg: 'rgba(140,140,150,0.18)', fg: '#a8a8b0' },
};
function _libCategoryBadgeStyle(category) {
  return _LIB_CATEGORY_BADGE_COLORS[category] || _LIB_CATEGORY_BADGE_COLORS['Other'];
}

function _libRenderRow(entry) {
  const onList = _libIsOnGrocery(entry.canonical);
  const photo = findIngredientPhoto(entry.name);
  const safeCanon = escJs(entry.canonical);
  const escapedName = escJs(entry.name);
  const photoOnClick = photo
    ? `openPhotoExpandOverlay('${escJs(photo)}','${escapedName}')`
    : `openPhotoSearch('${escapedName}',function(url){setIngredientPhoto('${escapedName}',url);render();})`;
  const recipeCount = entry.recipeNames.length;
  let subtitle = '';
  if (recipeCount === 1) {
    subtitle = `In ${esc(entry.recipeNames[0])}`;
  } else if (recipeCount > 1) {
    subtitle = `In ${recipeCount} recipes`;
  }
  // Category badge — shows the food group (Produce, Meat, Dairy, etc.) so the
  // user can scan the library by type. Replaces the old "Recipe" source flag,
  // which was redundant with the "In N recipes" subtitle.
  const cat = entry.category || 'Other';
  const catStyle = _libCategoryBadgeStyle(cat);
  const badgeHtml = `<div class="lib-row-badges">
    <span class="lib-row-badge" style="background:${catStyle.bg};color:${catStyle.fg};">${esc(cat)}</span>
  </div>`;
  const mergedHtml = entry.mergedFrom.length > 0
    ? `<div class="lib-row-merged">Merged: ${entry.mergedFrom.slice(0, 3).map(m => esc(m.name)).join(', ')}${entry.mergedFrom.length > 3 ? ` +${entry.mergedFrom.length - 3}` : ''}</div>`
    : '';

  return `
    <div class="lib-row" data-lib-canonical="${esc(entry.canonical)}">
      <div class="lib-row-photo" style="cursor:pointer;" onclick="event.stopPropagation();${photoOnClick}" title="${photo ? 'View photo' : 'Add photo'}">
        ${photo
          ? `<img src="${esc(photo)}" class="lib-row-img" />`
          : `<div class="lib-row-img-placeholder"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg></div>`
        }
      </div>
      <div class="lib-row-body" onclick="_libRowAction('${safeCanon}')">
        <div class="lib-row-name">${esc(entry.name)}</div>
        ${badgeHtml}
        ${subtitle ? `<div class="lib-row-sub">${subtitle}</div>` : ''}
        ${mergedHtml}
      </div>
      <button class="lib-row-action ${onList ? 'lib-row-action-on' : ''}" onclick="event.stopPropagation();_libToggleAddToGrocery('${safeCanon}')" aria-label="${onList ? 'Remove from list' : 'Add to list'}">
        ${onList
          ? `<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`
        }
      </button>
    </div>
  `;
}

function _libToggleAddToGrocery(canonical) {
  const all = buildIngredientLibrary();
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;

  const list = getSmartGroceryList();
  const existing = list.find(i => canonicalIngredientName(i.name) === canonical);
  if (existing) {
    saveSmartGroceryList(list.filter(i => canonicalIngredientName(i.name) !== canonical));
    showToast(`${entry.name} removed from list`, 'info');
  } else {
    list.push({
      id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: entry.name,
      category: entry.category || 'Other',
      qty: '',
      unit: '',
      checked: false,
      manual: entry.isCustom,
      sourceMeals: entry.recipeNames.slice(0, 5),
      store: state.groceryStoreFilter || (typeof getLastSelectedStore === 'function' ? getLastSelectedStore() || '' : ''),
      addedAt: Date.now()
    });
    saveSmartGroceryList(list);
    showToast(`${entry.name} added`, 'success');
  }
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

// Refresh whichever surface is showing the library: the modal sub-views
// (when invoked via showIngredientLibraryModal) or the full grocery-library
// page (when invoked via openIngredientLibraryPage).
function _libRefreshSurface() {
  if (document.getElementById('libModalBody')) {
    _libRenderListResults();
  }
  if (state.currentView === 'grocery-library') {
    render();
  }
}

// Dispatch the row "more" action — keep the modal sub-view flow intact when
// the library modal is open, but use a transient action-sheet modal when the
// user is on the full page (no shared modal frame to overwrite).
function _libRowAction(canonical) {
  if (document.getElementById('libModalBody')) {
    _libRowMenu(canonical);
  } else {
    _libRowMenuModal(canonical);
  }
}

function _libRowMenuModal(canonical) {
  const all = buildIngredientLibrary();
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;
  const safe = escJs(canonical);
  const safeName = escJs(entry.name);
  const hasPhoto = !!findIngredientPhoto(entry.name);
  const isCustomOnly = entry.isCustom && entry.recipeNames.length === 0;
  const onList = _libIsOnGrocery(canonical);
  openModal(`
    <div style="color:${CONFIG.text_color};padding:4px 0 12px;">
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${esc(entry.name)}</div>
      <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:14px;">
        ${entry.recipeNames.length > 0
          ? `In ${entry.recipeNames.length} recipe${entry.recipeNames.length !== 1 ? 's' : ''}`
          : 'Custom item'}
        ${entry.mergedFrom.length > 0 ? ` · ${entry.mergedFrom.length} merged in` : ''}
      </div>
      <button onclick="closeModal();_libToggleAddToGrocery('${safe}')" class="lib-menu-btn">
        ${onList
          ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15"/></svg>`
          : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`
        }
        <span>${onList ? 'Remove from grocery list' : 'Add to grocery list'}</span>
      </button>
      <button onclick="closeModal();openPhotoSearch('${safeName}',function(url){setIngredientPhoto('${safeName}',url);render();});" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
        <span>${hasPhoto ? 'Change photo…' : 'Add photo…'}</span>
      </button>
      ${hasPhoto ? `
        <button onclick="closeModal();removeIngredientPhoto('${safeName}');render();" class="lib-menu-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span>Remove photo</span>
        </button>
      ` : ''}
      <button onclick="_libPromptRename('${safe}')" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
        <span>Edit name…</span>
      </button>
      <button onclick="_libStartMergeFromPage('${safe}')" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
        <span>Merge into another item…</span>
      </button>
      ${entry.mergedFrom.length > 0 ? `
        <button onclick="closeModal();_libUnmergeAllFromPage('${safe}')" class="lib-menu-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Undo all merges into this item</span>
        </button>
      ` : ''}
      <button onclick="_libConfirmHide('${safe}')" class="lib-menu-btn lib-menu-btn-danger">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79"/></svg>
        <span>${isCustomOnly ? 'Delete entirely' : 'Hide from library'}</span>
      </button>
      <button onclick="closeModal()" class="lib-menu-btn lib-menu-btn-cancel">Cancel</button>
    </div>
  `);
}

function _libUnmergeAllFromPage(masterCanonical) {
  const aliases = _libGetAliases();
  let changed = false;
  Object.keys(aliases).forEach(k => {
    if (_libResolveCanonical(aliases[k], aliases) === masterCanonical) {
      delete aliases[k];
      changed = true;
    }
  });
  if (changed) {
    _libSaveAliases(aliases);
    showToast('Merges removed', 'info');
  }
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

function _libDeleteCustomFromPage(canonical) {
  const list = _libGetCustom().filter(c => canonicalIngredientName(c.name) !== canonical);
  _libSaveCustom(list);
  showToast('Removed from library', 'info');
  _libRefreshSurface();
}

function _libStartMergeFromPage(sourceCanonical) {
  // Open the picker directly. openModal() replaces modal content and cancels
  // any in-flight close transition, so there's no need to closeModal() first —
  // doing so introduced a race where the close timeout could hide the modal
  // after the picker had already been swapped in, leaving the user stuck.
  _libOpenMergePickerModal(sourceCanonical);
}

function _libOpenMergePickerModal(sourceCanonical) {
  const all = buildIngredientLibrary();
  const source = all.find(e => e.canonical === sourceCanonical);
  if (!source) return;
  window._libraryMergeSource = sourceCanonical;
  window._libMergeSearch = '';
  window._libMergeContext = 'page';
  openModal(`
    <div style="color:${CONFIG.text_color};max-height:75vh;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <h2 style="font-size:16px;font-weight:600;margin:0;flex:1;">Merge "${esc(source.name)}" into…</h2>
        <button onclick="closeModal()" style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:10px;">
        Pick the item to keep. "${esc(source.name)}" will be grouped under it.
      </div>
      <input type="text" placeholder="Search items..." value=""
        oninput="window._libMergeSearch=this.value;_libRenderMergePickerModalList();"
        style="width:100%;padding:10px 12px;margin-bottom:10px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;" />
      <div id="libMergePickerModalBody" style="overflow-y:auto;flex:1;margin:0 -4px;padding:0 4px;"></div>
      <button onclick="closeModal()" style="margin-top:10px;width:100%;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
    </div>
  `);
  _libRenderMergePickerModalList();
}

function _libRenderMergePickerModalList() {
  const body = document.getElementById('libMergePickerModalBody');
  if (!body) return;
  const all = buildIngredientLibrary();
  const sourceCanon = window._libraryMergeSource;
  const q = (window._libMergeSearch || '').trim().toLowerCase();
  const candidates = all.filter(e => e.canonical !== sourceCanon)
    .filter(e => !q || e.name.toLowerCase().includes(q));

  if (candidates.length === 0) {
    body.innerHTML = `<div style="padding:24px 16px;text-align:center;color:${CONFIG.text_muted};font-size:13px;">No matching items.</div>`;
    return;
  }

  body.innerHTML = `<div class="lib-list">${candidates.map(e => `
    <button class="lib-merge-target" onclick="_libConfirmMergeFromPage('${escJs(e.canonical)}')">
      <div class="lib-row-body" style="cursor:pointer;">
        <div class="lib-row-name">${esc(e.name)}</div>
        ${e.recipeNames.length > 0 ? `<div class="lib-row-sub">In ${e.recipeNames.length} recipe${e.recipeNames.length !== 1 ? 's' : ''}</div>` : ''}
      </div>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:${CONFIG.text_muted};flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `).join('')}</div>`;
}

function _libConfirmMergeFromPage(targetCanonical) {
  const sourceCanon = window._libraryMergeSource;
  if (!sourceCanon || !targetCanonical || sourceCanon === targetCanonical) return;
  const all = buildIngredientLibrary();
  const target = all.find(e => e.canonical === targetCanonical);
  const source = all.find(e => e.canonical === sourceCanon);
  if (!target || !source) return;

  const aliases = _libGetAliases();
  aliases[sourceCanon] = targetCanonical;
  Object.keys(aliases).forEach(k => {
    if (aliases[k] === sourceCanon) aliases[k] = targetCanonical;
  });
  _libSaveAliases(aliases);
  const masterNames = _libGetMasterNames();
  masterNames[targetCanonical] = target.name;
  _libSaveMasterNames(masterNames);

  const list = getSmartGroceryList();
  const sourceIdx = list.findIndex(i => canonicalIngredientName(i.name) === sourceCanon);
  if (sourceIdx >= 0) {
    const targetExists = list.some(i => canonicalIngredientName(i.name) === targetCanonical);
    if (targetExists) {
      list.splice(sourceIdx, 1);
    } else {
      list[sourceIdx].name = target.name;
      list[sourceIdx].category = target.category || list[sourceIdx].category;
    }
    saveSmartGroceryList(list);
  }

  showToast(`Merged "${source.name}" into "${target.name}"`, 'success');
  window._libraryMergeSource = null;
  closeModal();
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

function _libOpenManageMergesModal() {
  const aliases = _libGetAliases();
  const masterNames = _libGetMasterNames();
  const entries = Object.entries(aliases);
  const rows = entries.length === 0
    ? `<div style="padding:24px 16px;text-align:center;color:${CONFIG.text_muted};font-size:13px;">No merges yet.</div>`
    : `<div class="lib-list">${entries.map(([alias, master]) => `
        <div class="lib-row">
          <div class="lib-row-body">
            <div class="lib-row-name" style="font-size:14px;">${esc(toTitleCase(alias))}</div>
            <div class="lib-row-sub">→ ${esc(masterNames[master] || toTitleCase(master))}</div>
          </div>
          <button onclick="_libUnmergeFromPage('${escJs(alias)}')" class="lib-row-action" style="background:${CONFIG.surface_elevated};color:${CONFIG.text_color};font-size:12px;padding:0 12px;width:auto;border-radius:14px;">Undo</button>
        </div>
      `).join('')}</div>`;
  openModal(`
    <div style="color:${CONFIG.text_color};max-height:75vh;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <h2 style="font-size:16px;font-weight:600;margin:0;flex:1;">Manage merges</h2>
        <button onclick="closeModal()" style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="libManageMergesBody" style="overflow-y:auto;flex:1;">${rows}</div>
      <button onclick="closeModal()" style="margin-top:10px;width:100%;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;font-size:14px;">Done</button>
    </div>
  `);
}

function _libUnmergeFromPage(aliasCanonical) {
  const aliases = _libGetAliases();
  if (!aliases[aliasCanonical]) return;
  delete aliases[aliasCanonical];
  _libSaveAliases(aliases);
  showToast('Merge undone', 'info');
  // Re-render the modal body in place rather than closing the sheet.
  closeModal();
  _libOpenManageMergesModal();
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

function openIngredientLibraryPage() {
  window._librarySearch = '';
  window._libCategoryFilter = 'All';
  navigateTo('grocery-library');
}

function renderGroceryLibrary() {
  const all = buildIngredientLibrary();
  const q = (window._librarySearch || '').trim().toLowerCase();
  const activeCat = window._libCategoryFilter || 'All';
  const aliases = _libGetAliases();
  const aliasCount = Object.keys(aliases).length;

  // Apply search first so category counts reflect the search-narrowed set.
  const searchedAll = q ? all.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.mergedFrom.some(m => m.name.toLowerCase().includes(q)) ||
    e.recipeNames.some(n => n.toLowerCase().includes(q))
  ) : all;

  // Only show category chips that have at least one item in the full library
  // (so the chip set is stable across searches).
  const presentCats = new Set();
  all.forEach(e => presentCats.add(e.category || 'Other'));
  const cats = ['All', ...GROCERY_CATEGORIES.filter(c => presentCats.has(c))];
  const counts = {};
  cats.forEach(c => {
    counts[c] = c === 'All' ? searchedAll.length : searchedAll.filter(e => (e.category || 'Other') === c).length;
  });

  const filtered = activeCat === 'All'
    ? searchedAll
    : searchedAll.filter(e => (e.category || 'Other') === activeCat);

  const exactExists = q && all.some(e =>
    e.name.toLowerCase() === q ||
    canonicalIngredientName(e.name) === canonicalIngredientName(q)
  );
  const manualAddHtml = (q && !exactExists) ? `
    <button onclick="_libAddCustomFromSearch()" class="lib-add-custom-row">
      <div class="lib-add-custom-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </div>
      <div style="flex:1;text-align:left;">
        <div style="font-size:14px;font-weight:600;color:${CONFIG.text_color};">Add "${esc(toTitleCase(q))}"</div>
        <div style="font-size:12px;color:${CONFIG.text_muted};">Save to library and grocery list</div>
      </div>
    </button>
  ` : '';

  const rowsHtml = filtered.map(e => _libRenderRow(e)).join('');
  const emptyHtml = filtered.length === 0 && !manualAddHtml ? `
    <div style="padding:32px 16px;text-align:center;color:${CONFIG.text_muted};">
      <div style="font-size:14px;margin-bottom:6px;">No ingredients ${q || activeCat !== 'All' ? 'match' : 'yet'}</div>
      <div style="font-size:12px;">${q || activeCat !== 'All' ? 'Try a different search or filter.' : 'Add recipes with ingredients to get started.'}</div>
    </div>
  ` : '';

  const chipsHtml = `
    <div class="lib-cat-chips">
      ${cats.map(c => `
        <button class="lib-cat-chip ${activeCat === c ? 'active' : ''}"
          onclick="window._libCategoryFilter='${escJs(c)}'; render();">
          <span>${esc(c)}</span>${counts[c] > 0 ? `<span class="lib-cat-count">${counts[c]}</span>` : ''}
        </button>
      `).join('')}
    </div>
  `;

  return `
    <div class="p-3 max-w-4xl mx-auto" style="padding-bottom:96px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <h2 style="font-size:20px;font-weight:700;color:${CONFIG.text_color};margin:0;flex:1;">Ingredient Library</h2>
        ${aliasCount > 0 ? `<button onclick="_libOpenManageMergesModal()" style="background:none;border:none;color:${CONFIG.primary_action_color};cursor:pointer;font-size:12px;padding:4px;">Merges (${aliasCount})</button>` : ''}
        <button onclick="_libShowAddItemModal()"
          style="display:inline-flex;align-items:center;gap:4px;padding:8px 12px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          Add
        </button>
      </div>
      <input id="libSearchInput" type="text" placeholder="Search ingredients..." value="${esc(window._librarySearch || '')}"
        oninput="window._librarySearch=this.value;render();"
        style="width:100%;padding:10px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
      ${chipsHtml}
      <div style="font-size:12px;color:${CONFIG.text_muted};margin:8px 0 8px;">Tap the + to add to grocery, or tap an item for more actions.</div>
      ${manualAddHtml}
      ${emptyHtml}
      <div class="lib-list">${rowsHtml}</div>
      ${(!q && activeCat === 'All' && all.length > 0) ? `<div style="text-align:center;font-size:12px;color:${CONFIG.text_muted};padding:14px 0 4px;">${all.length} unique ingredient${all.length !== 1 ? 's' : ''}</div>` : ''}
    </div>
  `;
}

function _libRowMenu(canonical) {
  const all = buildIngredientLibrary();
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;
  const safe = escJs(canonical);
  const isCustomOnly = entry.isCustom && entry.recipeNames.length === 0;

  // Reuse the modal frame; we'll stash + restore the body to return to the list
  const body = document.getElementById('libModalBody');
  if (!body) return;
  window._libCachedListBody = body.innerHTML;

  const onList = _libIsOnGrocery(canonical);
  const safeName = escJs(entry.name);
  const hasPhoto = !!findIngredientPhoto(entry.name);
  body.innerHTML = `
    <div style="padding:4px 0 12px;">
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${esc(entry.name)}</div>
      <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:14px;">
        ${entry.recipeNames.length > 0
          ? `In ${entry.recipeNames.length} recipe${entry.recipeNames.length !== 1 ? 's' : ''}`
          : 'Custom item'}
        ${entry.mergedFrom.length > 0 ? ` · ${entry.mergedFrom.length} merged in` : ''}
      </div>
      <button onclick="_libToggleAddToGrocery('${safe}');_libBackToList();" class="lib-menu-btn">
        ${onList
          ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15"/></svg>`
          : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`
        }
        <span>${onList ? 'Remove from grocery list' : 'Add to grocery list'}</span>
      </button>
      <button onclick="_libBackToList();openPhotoSearch('${safeName}',function(url){setIngredientPhoto('${safeName}',url);render();});" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
        <span>${hasPhoto ? 'Change photo…' : 'Add photo…'}</span>
      </button>
      ${hasPhoto ? `
        <button onclick="removeIngredientPhoto('${safeName}');_libBackToList();render();" class="lib-menu-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          <span>Remove photo</span>
        </button>
      ` : ''}
      <button onclick="_libPromptRename('${safe}')" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
        <span>Edit name…</span>
      </button>
      <button onclick="_libStartMerge('${safe}')" class="lib-menu-btn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
        <span>Merge into another item…</span>
      </button>
      ${entry.mergedFrom.length > 0 ? `
        <button onclick="_libUnmergeAll('${safe}')" class="lib-menu-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Undo all merges into this item</span>
        </button>
      ` : ''}
      <button onclick="_libConfirmHide('${safe}')" class="lib-menu-btn lib-menu-btn-danger">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79"/></svg>
        <span>${isCustomOnly ? 'Delete entirely' : 'Hide from library'}</span>
      </button>
      <button onclick="_libBackToList()" class="lib-menu-btn lib-menu-btn-cancel">Back</button>
    </div>
  `;
}

function _libBackToList() {
  const body = document.getElementById('libModalBody');
  if (!body) return;
  if (window._libCachedListBody) {
    body.innerHTML = window._libCachedListBody;
    window._libCachedListBody = null;
  } else {
    _libRenderListResults();
  }
}

function _libStartMerge(sourceCanonical) {
  window._libraryMergeSource = sourceCanonical;
  window._libView = 'mergePicker';
  window._libMergeSearch = '';
  _libRender();
}

function _libRenderMergePicker() {
  const header = document.getElementById('libModalHeader');
  const body = document.getElementById('libModalBody');
  const footer = document.getElementById('libModalFooter');
  if (!header || !body || !footer) return;

  const all = buildIngredientLibrary();
  const source = all.find(e => e.canonical === window._libraryMergeSource);
  if (!source) { _libSetView('list'); return; }

  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <button onclick="_libSetView('list')" aria-label="Back"
        style="background:none;border:none;color:${CONFIG.text_color};cursor:pointer;padding:4px;display:flex;align-items:center;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h2 style="font-size:16px;font-weight:600;margin:0;flex:1;">Merge "${esc(source.name)}" into…</h2>
      <button onclick="closeModal()" style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:10px;">
      Pick the item to keep. "${esc(source.name)}" will be grouped under it.
    </div>
    <input type="text" placeholder="Search items..." value="${esc(window._libMergeSearch || '')}"
      oninput="window._libMergeSearch=this.value;_libRenderMergePickerList();"
      style="width:100%;padding:10px 12px;margin-bottom:10px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;" />
  `;

  footer.innerHTML = `
    <button onclick="_libSetView('list')" style="width:100%;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
  `;

  _libRenderMergePickerList();
}

function _libRenderMergePickerList() {
  const body = document.getElementById('libModalBody');
  if (!body) return;
  const all = buildIngredientLibrary();
  const sourceCanon = window._libraryMergeSource;
  const q = (window._libMergeSearch || '').trim().toLowerCase();
  const candidates = all.filter(e => e.canonical !== sourceCanon)
    .filter(e => !q || e.name.toLowerCase().includes(q));

  if (candidates.length === 0) {
    body.innerHTML = `<div style="padding:24px 16px;text-align:center;color:${CONFIG.text_muted};font-size:13px;">No matching items.</div>`;
    return;
  }

  body.innerHTML = `<div class="lib-list">${candidates.map(e => `
    <button class="lib-merge-target" onclick="_libConfirmMerge('${escJs(e.canonical)}')">
      <div class="lib-row-body" style="cursor:pointer;">
        <div class="lib-row-name">${esc(e.name)}</div>
        ${e.recipeNames.length > 0 ? `<div class="lib-row-sub">In ${e.recipeNames.length} recipe${e.recipeNames.length !== 1 ? 's' : ''}</div>` : ''}
      </div>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:${CONFIG.text_muted};flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `).join('')}</div>`;
}

function _libConfirmMerge(targetCanonical) {
  const sourceCanon = window._libraryMergeSource;
  if (!sourceCanon || !targetCanonical || sourceCanon === targetCanonical) return;

  const all = buildIngredientLibrary();
  const target = all.find(e => e.canonical === targetCanonical);
  const source = all.find(e => e.canonical === sourceCanon);
  if (!target || !source) return;

  const aliases = _libGetAliases();
  // Map source → target, plus rewrite any existing chains that pointed at source
  aliases[sourceCanon] = targetCanonical;
  Object.keys(aliases).forEach(k => {
    if (aliases[k] === sourceCanon) aliases[k] = targetCanonical;
  });
  _libSaveAliases(aliases);

  // Persist preferred display name for the target
  const masterNames = _libGetMasterNames();
  masterNames[targetCanonical] = target.name;
  _libSaveMasterNames(masterNames);

  // If both source & target were on the grocery list, drop the source row
  const list = getSmartGroceryList();
  const sourceIdx = list.findIndex(i => canonicalIngredientName(i.name) === sourceCanon);
  if (sourceIdx >= 0) {
    const targetExists = list.some(i => canonicalIngredientName(i.name) === targetCanonical);
    if (targetExists) {
      list.splice(sourceIdx, 1);
    } else {
      list[sourceIdx].name = target.name;
      list[sourceIdx].category = target.category || list[sourceIdx].category;
    }
    saveSmartGroceryList(list);
  }

  showToast(`Merged "${source.name}" into "${target.name}"`, 'success');
  window._libraryMergeSource = null;
  _libSetView('list');
  _scheduleGroceryRender(150);
}

function _libRenderManageMerges() {
  const header = document.getElementById('libModalHeader');
  const body = document.getElementById('libModalBody');
  const footer = document.getElementById('libModalFooter');
  if (!header || !body || !footer) return;

  const aliases = _libGetAliases();
  const masterNames = _libGetMasterNames();
  const entries = Object.entries(aliases);

  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <button onclick="_libSetView('list')" aria-label="Back"
        style="background:none;border:none;color:${CONFIG.text_color};cursor:pointer;padding:4px;display:flex;align-items:center;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h2 style="font-size:16px;font-weight:600;margin:0;flex:1;">Manage merges</h2>
      <button onclick="closeModal()" style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:4px;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `;

  footer.innerHTML = `
    <button onclick="_libSetView('list')" style="width:100%;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;font-size:14px;">Done</button>
  `;

  if (entries.length === 0) {
    body.innerHTML = `<div style="padding:24px 16px;text-align:center;color:${CONFIG.text_muted};font-size:13px;">No merges yet.</div>`;
    return;
  }

  body.innerHTML = `<div class="lib-list">${entries.map(([alias, master]) => `
    <div class="lib-row">
      <div class="lib-row-body">
        <div class="lib-row-name" style="font-size:14px;">${esc(toTitleCase(alias))}</div>
        <div class="lib-row-sub">→ ${esc(masterNames[master] || toTitleCase(master))}</div>
      </div>
      <button onclick="_libUnmerge('${escJs(alias)}')" class="lib-row-action" style="background:${CONFIG.surface_elevated};color:${CONFIG.text_color};font-size:12px;padding:0 12px;width:auto;border-radius:14px;">Undo</button>
    </div>
  `).join('')}</div>`;
}

function _libUnmerge(aliasCanonical) {
  const aliases = _libGetAliases();
  if (!aliases[aliasCanonical]) return;
  delete aliases[aliasCanonical];
  _libSaveAliases(aliases);
  showToast('Merge undone', 'info');
  _libRender();
  _scheduleGroceryRender(150);
}

function _libUnmergeAll(masterCanonical) {
  const aliases = _libGetAliases();
  let changed = false;
  Object.keys(aliases).forEach(k => {
    if (_libResolveCanonical(aliases[k], aliases) === masterCanonical) {
      delete aliases[k];
      changed = true;
    }
  });
  if (changed) {
    _libSaveAliases(aliases);
    showToast('Merges removed', 'info');
  }
  _libBackToList();
  _scheduleGroceryRender(150);
}

function _libDeleteCustom(canonical) {
  const list = _libGetCustom().filter(c => canonicalIngredientName(c.name) !== canonical);
  _libSaveCustom(list);
  showToast('Removed from library', 'info');
  _libBackToList();
}

// Universal "delete" — works for both custom items (truly remove from custom
// list) and recipe-derived items (add to hidden set so they're suppressed
// from the library and won't auto-add to the grocery list). Also pulls the
// item off the grocery list if it's currently there.
function _libConfirmHide(canonical) {
  const all = buildIngredientLibrary();
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;
  const isCustomOnly = entry.isCustom && entry.recipeNames.length === 0;
  const verb = isCustomOnly ? 'delete' : 'hide';
  if (!confirm(`${verb === 'delete' ? 'Delete' : 'Hide'} "${entry.name}" from the library?${verb === 'hide' ? '\n\nIt\'s used by recipes, so it can\'t be deleted, but it\'ll be suppressed from this list.' : ''}`)) return;

  if (isCustomOnly) {
    const list = _libGetCustom().filter(c => canonicalIngredientName(c.name) !== canonical);
    _libSaveCustom(list);
  }
  // Always add to hidden so recipe-derived ones disappear too.
  const hidden = _libGetHidden();
  hidden.add(canonical);
  _libSaveHidden(hidden);

  // Remove from grocery list as well — keeping it there after deletion
  // confuses users since they can't get back to its library entry.
  const groList = getSmartGroceryList();
  const filtered = groList.filter(i => canonicalIngredientName(i.name) !== canonical);
  if (filtered.length !== groList.length) saveSmartGroceryList(filtered);

  showToast(verb === 'delete' ? 'Deleted from library' : 'Hidden from library', 'info');
  closeModal();
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

// Rename: store an override in LIB_MASTER_NAMES_KEY (already honored by
// buildIngredientLibrary's getOrCreate). The canonical key doesn't change —
// only the display name — so existing aliases/merges keep working.
function _libPromptRename(canonical) {
  const all = buildIngredientLibrary();
  const entry = all.find(e => e.canonical === canonical);
  if (!entry) return;
  const safe = escJs(canonical);
  openModal(`
    <div style="color:${CONFIG.text_color};padding:4px 0 8px;">
      <div style="font-size:15px;font-weight:600;margin-bottom:10px;">Rename ingredient</div>
      <input id="libRenameInput" type="text" value="${esc(entry.name)}"
        style="width:100%;padding:10px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:16px;outline:none;box-sizing:border-box;margin-bottom:12px;" />
      <div style="display:flex;gap:8px;">
        <button onclick="closeModal()" class="lib-menu-btn lib-menu-btn-cancel" style="flex:1;">Cancel</button>
        <button onclick="_libDoRename('${safe}')" class="lib-menu-btn" style="flex:1;background:${CONFIG.primary_action_color};color:white;">Save</button>
      </div>
    </div>
  `);
  setTimeout(() => {
    const inp = document.getElementById('libRenameInput');
    if (inp) { inp.focus(); inp.select(); }
  }, 50);
}

function _libDoRename(canonical) {
  const inp = document.getElementById('libRenameInput');
  const newName = (inp?.value || '').trim();
  if (!newName) { showError('Name cannot be empty'); return; }
  const display = toTitleCase(newName);
  const masterNames = _libGetMasterNames();
  masterNames[canonical] = display;
  _libSaveMasterNames(masterNames);

  // If the item is currently on the grocery list, update its name too so the
  // displayed text matches. The canonical doesn't change, so identity holds.
  const list = getSmartGroceryList();
  let groChanged = false;
  list.forEach(i => {
    if (canonicalIngredientName(i.name) === canonical && i.name !== display) {
      i.name = display;
      groChanged = true;
    }
  });
  if (groChanged) saveSmartGroceryList(list);

  showToast('Renamed', 'success');
  closeModal();
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

// Add a brand-new custom item from a small modal (separate from the
// search-no-match flow, which only triggers when the user has typed
// something that doesn't already exist).
function _libShowAddItemModal() {
  const groups = (typeof GROCERY_CATEGORIES !== 'undefined' ? GROCERY_CATEGORIES : ['Other']);
  openModal(`
    <div style="color:${CONFIG.text_color};padding:4px 0 8px;">
      <div style="font-size:15px;font-weight:600;margin-bottom:12px;">Add ingredient to library</div>
      <label style="display:block;font-size:12px;color:${CONFIG.text_muted};margin-bottom:4px;">Name</label>
      <input id="libAddItemName" type="text" placeholder="e.g., Sriracha"
        style="width:100%;padding:10px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:16px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
      <label style="display:block;font-size:12px;color:${CONFIG.text_muted};margin-bottom:4px;">Category</label>
      <select id="libAddItemCategory"
        style="width:100%;padding:10px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:16px;outline:none;box-sizing:border-box;margin-bottom:14px;">
        ${groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;">
        <button onclick="closeModal()" class="lib-menu-btn lib-menu-btn-cancel" style="flex:1;">Cancel</button>
        <button onclick="_libDoAddItem()" class="lib-menu-btn" style="flex:1;background:${CONFIG.primary_action_color};color:white;">Add</button>
      </div>
    </div>
  `);
  setTimeout(() => document.getElementById('libAddItemName')?.focus(), 50);
}

function _libDoAddItem() {
  const raw = (document.getElementById('libAddItemName')?.value || '').trim();
  const group = document.getElementById('libAddItemCategory')?.value || 'Other';
  if (!raw) { showError('Name is required'); return; }
  const canonical = canonicalIngredientName(raw);
  if (!canonical) { showError('Name is invalid'); return; }
  const display = toTitleCase(displayIngredientName(raw) || raw);

  // If it was previously hidden, unhide so the user sees it again.
  const hidden = _libGetHidden();
  if (hidden.has(canonical)) { hidden.delete(canonical); _libSaveHidden(hidden); }

  const customs = _libGetCustom();
  if (!customs.some(c => canonicalIngredientName(c.name) === canonical)) {
    customs.push({ name: display, group, addedAt: Date.now() });
    _libSaveCustom(customs);
  }

  showToast(`${display} added`, 'success');
  closeModal();
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

function _libAddCustomFromSearch() {
  const raw = (window._librarySearch || '').trim();
  if (!raw) return;
  const canonical = canonicalIngredientName(raw);
  if (!canonical) return;
  const display = toTitleCase(displayIngredientName(raw) || raw);

  // Save to custom library so it persists across sessions
  const customs = _libGetCustom();
  if (!customs.some(c => canonicalIngredientName(c.name) === canonical)) {
    customs.push({ name: display, group: 'Other', addedAt: Date.now() });
    _libSaveCustom(customs);
  }

  // Add to grocery list immediately
  const list = getSmartGroceryList();
  if (!list.some(i => canonicalIngredientName(i.name) === canonical)) {
    list.push({
      id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: display,
      category: 'Other',
      qty: '',
      unit: '',
      checked: false,
      manual: true,
      sourceMeals: [],
      store: state.groceryStoreFilter || (typeof getLastSelectedStore === 'function' ? getLastSelectedStore() || '' : ''),
      addedAt: Date.now()
    });
    saveSmartGroceryList(list);
  }

  showToast(`${display} added`, 'success');
  window._librarySearch = '';
  const inp = document.getElementById('libSearchInput');
  if (inp) inp.value = '';
  _libRefreshSurface();
  _scheduleGroceryRender(150);
}

function _libSetView(view) {
  window._libView = view;
  _libRender();
}

function init() {
  debugLog('[grocery] init() starting');
  try {
    loadAllState();
    debugLog('[grocery] loadAllState done — recipes:', state.recipes?.length, 'groceryItems:', state.groceryItems?.length, 'smartList:', getSmartGroceryList()?.length);
  } catch (e) {
    console.error('[grocery] loadAllState failed:', e);
  }
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView && VIEW_RENDERERS[targetView]) {
    sessionStorage.removeItem('yummy_target_view');
    state.currentView = targetView;
  } else {
    state.currentView = 'grocery-list';
  }
  debugLog('[grocery] currentView:', state.currentView);
  setupKeyboardShortcuts();
  render();
  debugLog('[grocery] init() done');
}

init();
