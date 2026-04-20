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
    const escapedName = esc(recipeName).replace(/'/g, "\\'");

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

      // Store filter pills
      const allStores = [...new Set([...stores, ...groceryList.map(i => i.store).filter(Boolean)])];
      const storeFilterHtml = allStores.length > 0 ? `
        <div class="gro-store-filters">
          <button class="gro-store-pill ${!activeStore ? 'active' : ''}" onclick="state.groceryStoreFilter='';render();">All</button>
          ${allStores.map(s => `
            <button class="gro-store-pill ${activeStore === s ? 'active' : ''}" onclick="state.groceryStoreFilter='${esc(s).replace(/'/g, "\\'")}';render();">${esc(s)}</button>
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

      // Quick actions row
      const quickActionsHtml = `
        <div class="gro-quick-actions">
          <button onclick="showAddFromMealModal()" class="gro-quick-btn card-press">
            <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            <span>From a meal</span>
          </button>
          <button onclick="showRecurringItemsModal()" class="gro-quick-btn card-press">
            <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992"/></svg>
            <span>Recurring</span>
            ${allFreqItems.length > 0 ? `<span class="gro-quick-badge">${allFreqItems.length}</span>` : ''}
          </button>
          <button onclick="showManageStoresModal()" class="gro-quick-btn card-press">
            <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"/></svg>
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
        <div class="gro-container">
          <!-- Add Item Input -->
          <div class="gro-add-bar">
            <div class="search-bar" style="flex:1;">
              <div class="search-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </div>
              <input type="text" id="groceryManualInput" placeholder="Add an item..."
                onkeydown="if(event.key==='Enter') addManualGroceryItemSmart();"
                onfocus="document.getElementById('groceryCategoryRow').style.display='flex';"
              />
            </div>
            <button onclick="addManualGroceryItemSmart()" class="gro-add-btn">Add</button>
          </div>
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

          <!-- Main Grocery List -->
          <div class="gro-list">
            ${filteredUnchecked.map(item => _renderGroceryRow(item, false)).join('')}
          </div>

          <!-- Checked Items -->
          ${filteredChecked.length > 0 ? `
            <div class="gro-checked-section">
              <div class="gro-checked-header" onclick="var c=this.nextElementSibling;c.style.display=c.style.display==='none'?'block':'none';this.querySelector('.gro-chev').style.transform=c.style.display==='none'?'':'rotate(90deg)';">
                <span class="gro-chev" style="transform:rotate(90deg);">&#9656;</span>
                <span>Completed (${filteredChecked.length})</span>
              </div>
              <div class="gro-list">
                ${filteredChecked.map(item => _renderGroceryRow(item, true)).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Sticky Bottom Summary -->
        ${groceryList.length > 0 ? `
          <div class="grocery-sticky-bar">
            <span class="grocery-sticky-count">${unchecked.length} ITEM${unchecked.length !== 1 ? 'S' : ''} LEFT</span>
            ${activeStore ? `<span class="grocery-sticky-store">${esc(activeStore)}</span>` : ''}
          </div>
        ` : ''}
      `;
    }

function _renderGroceryRow(item, isChecked) {
      const name = toTitleCase(item.name);
      const qtyLabel = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : '';
      const sourceLabel = item.sourceMeals && item.sourceMeals.length > 0
        ? item.sourceMeals.join(', ') : '';
      const photo = findIngredientPhoto(item.name);
      const escapedItemName = esc(item.name).replace(/'/g, "\\'");
      const escapedId = esc(item.id).replace(/'/g, "\\'");
      const store = item.store || '';

      return `
        <div data-gro-id="${esc(item.id)}" class="gro-item ${isChecked ? 'gro-item-checked' : ''}">
          <div class="gro-item-check" onclick="toggleSmartGroceryItem('${escapedId}')">
            <div class="gro-checkbox ${isChecked ? 'checked' : ''}">
              ${isChecked ? '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </div>
          </div>
          <div class="gro-item-photo" onclick="event.stopPropagation();${photo ? `openPhotoExpandOverlay('${esc(photo).replace(/'/g, "\\'")}','${escapedItemName}')` : `openPhotoSearch('${escapedItemName}',function(url){setIngredientPhoto('${escapedItemName}',url);render();})`}">
            ${photo
              ? `<img src="${esc(photo)}" class="gro-item-img" />`
              : `<div class="gro-item-img-placeholder">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
                </div>`
            }
          </div>
          <div class="gro-item-body" onclick="toggleSmartGroceryItem('${escapedId}')">
            <div class="gro-item-name ${isChecked ? 'checked' : ''}">${esc(name)}</div>
            <div class="gro-item-meta">
              ${qtyLabel ? `<span class="gro-item-qty">${esc(qtyLabel)}</span>` : ''}
              ${sourceLabel ? `<span class="gro-item-source">from ${esc(sourceLabel)}</span>` : ''}
            </div>
            ${store ? `<span class="gro-item-store-tag">${esc(store)}</span>` : ''}
          </div>
          <div class="gro-item-actions">
            ${!isChecked ? `
              <button class="gro-item-store-btn" onclick="event.stopPropagation();showStorePickerForItem('${escapedId}')" title="Set store">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"/></svg>
              </button>
              <button class="gro-item-delete-btn" onclick="event.stopPropagation();removeSmartGroceryItem('${escapedId}')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ` : ''}
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

  const extraPadding = state.currentView === 'grocery-list' ? '120px' : '56px';
  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: ${extraPadding};">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${renderBottomNav()}
    </div>
  `;

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

  const defaultStoresHtml = DEFAULT_STORES.filter(s => !stores.includes(s)).length > 0
    ? `<div style="margin-top:12px;">
        <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:6px;">Suggested stores</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${DEFAULT_STORES.filter(s => !stores.includes(s)).slice(0, 6).map(s => `
            <button onclick="addGroceryStore('${esc(s).replace(/'/g, "\\'")}');showStorePickerForItem('${esc(itemId).replace(/'/g, "\\'")}')"
              style="padding:8px 14px;background:${CONFIG.surface_color};border:1px dashed rgba(255,255,255,0.1);border-radius:20px;color:${CONFIG.text_muted};font-size:13px;cursor:pointer;">+ ${esc(s)}</button>
          `).join('')}
        </div>
      </div>`
    : '';

  openModal(`
    <div style="color:${CONFIG.text_color};">
      <div style="font-size:17px;font-weight:600;margin-bottom:16px;">Assign Store</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <button onclick="setGroceryItemStore('${esc(itemId).replace(/'/g, "\\'")}','');closeModal();render();"
          style="padding:14px 16px;background:${!currentStore ? 'rgba(232,93,93,0.15)' : CONFIG.surface_color};border:1px solid ${!currentStore ? CONFIG.primary_action_color : 'transparent'};border-radius:12px;color:${CONFIG.text_color};font-size:15px;text-align:left;cursor:pointer;">
          No store assigned
        </button>
        ${stores.map(s => `
          <button onclick="setGroceryItemStore('${esc(itemId).replace(/'/g, "\\'")}','${esc(s).replace(/'/g, "\\'")}');closeModal();render();"
            style="padding:14px 16px;background:${currentStore === s ? 'rgba(232,93,93,0.15)' : CONFIG.surface_color};border:1px solid ${currentStore === s ? CONFIG.primary_action_color : 'transparent'};border-radius:12px;color:${CONFIG.text_color};font-size:15px;text-align:left;cursor:pointer;">
            ${esc(s)}
          </button>
        `).join('')}
      </div>
      ${defaultStoresHtml}
      <div style="margin-top:16px;">
        <div style="display:flex;gap:8px;">
          <input type="text" id="newStoreInput" placeholder="Add a new store..."
            onkeydown="if(event.key==='Enter'){addGroceryStore(this.value);showStorePickerForItem('${esc(itemId).replace(/'/g, "\\'")}');}"
            style="flex:1;padding:12px;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:${CONFIG.text_color};font-size:14px;outline:none;" />
          <button onclick="addGroceryStore(document.getElementById('newStoreInput').value);showStorePickerForItem('${esc(itemId).replace(/'/g, "\\'")}');"
            style="padding:12px 16px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Add</button>
        </div>
      </div>
    </div>
  `);
}

function showManageStoresModal() {
  const stores = getGroceryStores();

  const defaultStoresHtml = DEFAULT_STORES.filter(s => !stores.includes(s)).length > 0
    ? `<div style="margin-top:16px;">
        <div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:8px;">Quick add</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${DEFAULT_STORES.filter(s => !stores.includes(s)).map(s => `
            <button onclick="addGroceryStore('${esc(s).replace(/'/g, "\\'")}');showManageStoresModal();"
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
            <button onclick="removeGroceryStore('${esc(s).replace(/'/g, "\\'")}');showManageStoresModal();"
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
