// ============================================================
// HOME PAGE - js/home.js
// All home-page-specific functions for Yummy app.
// Depends on js/shared.js being loaded first.
// ============================================================

// ============================================================
// PATTERN DETECTION & COOK AGAIN (Home screen sections)
// ============================================================
function renderPatternSection() {
  const patterns = getTopFoodPatterns(14);
  if (patterns.length === 0) return '';

  const unexplored = getUnexploredCategories();

  return `
    <div style="padding: 0 ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_md};">
      <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 10px 12px;">
        <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted}; margin-bottom: 8px;">You've been eating a lot of:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: ${unexplored.length > 0 ? '10px' : '0'};">
          ${patterns.map(p => `
            <span style="font-size: 11px; padding: 6px 12px; border-radius: 16px; background: rgba(232,93,93,0.1); color: ${CONFIG.primary_action_color}; font-weight: 500;">
              ${esc(p.name)} (${p.count}x)
            </span>
          `).join('')}
        </div>
        ${unexplored.length > 0 ? `
          <button onclick="filterSwipeDeckToUnexplored()" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; padding: 0; text-decoration: underline; opacity: 0.8;">
            Try something different?
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function filterSwipeDeckToUnexplored() {
  const unexplored = getUnexploredCategories();
  if (unexplored.length === 0) {
    showToast('You\'ve explored all categories!', 'success');
    return;
  }
  const unexploredLower = new Set(unexplored.map(c => c.toLowerCase()));
  const mealType = state.swipeMealType || detectMealType();
  state.swipeDeck = state.recipes.filter(r => {
    const cat = (r.category || '').toLowerCase();
    return unexploredLower.has(cat) && !r.isDraft && !r.isTip;
  });
  if (state.swipeDeck.length === 0) {
    showToast('No recipes found in unexplored categories', 'info');
    return;
  }
  // Shuffle
  for (let i = state.swipeDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.swipeDeck[i], state.swipeDeck[j]] = [state.swipeDeck[j], state.swipeDeck[i]];
  }
  state.swipeIndex = 0;
  state.homeTab = 'swipe';
  showToast(`Showing ${state.swipeDeck.length} recipes from categories you haven\'t tried`, 'success');
  render();
}

function renderCookAgainRow() {
  const favorites = getCookAgainMeals();
  if (favorites.length === 0) return '';

  return `
    <div style="padding: 0 ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_md};">
      <div style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Cook Again</div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
        ${favorites.map(entry => `
          <div onclick="${entry.recipeId ? `openRecipeView('${entry.recipeId}')` : `openFoodLogDetail('${entry.id}')`}" style="flex-shrink: 0; cursor: pointer; text-align: center; width: 52px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; margin: 0 auto 4px; border: 2px solid ${CONFIG.primary_action_color}; background: ${CONFIG.surface_elevated};">
              ${(entry.photo || entry.image) ? `<img src="${esc(entry.photo || entry.image)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;">🍽️</div>`}
            </div>
            <div style="font-size: 11px; color: ${CONFIG.text_muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(entry.recipeName)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================================
// HOME SEARCH RESULTS
// ============================================================
function renderHomeSearchResults() {
  const container = document.getElementById('homeSearchResults');
  if (!container) return;

  const searchTerm = normalizeString(state.homeSearchTerm);
  const filter = state.homeSearchFilter || 'all';

  if (!searchTerm) {
    container.innerHTML = '';
    return;
  }

  let results = [];

  // Search recipes
  if (filter === 'all' || filter === 'recipes') {
    const matchingRecipes = state.recipes
      .filter(r => !r.isDraft)
      .filter(r => {
        if (r.title.toLowerCase().includes(searchTerm)) return true;
        const ings = recipeIngList(r);
        return ings.some(ing => ing.name.toLowerCase().includes(searchTerm));
      })
      .slice(0, 5)
      .map(r => ({
        type: 'recipe',
        id: r.__backendId || r.id,
        name: r.title,
        subtitle: r.category || 'Recipe',
        image: recipeThumb(r),
        icon: r.isTip ? '📝' : '🍽️'
      }));
    results = results.concat(matchingRecipes);
  }

  // Search ingredients
  if (filter === 'all' || filter === 'ingredients') {
    const addedNames = new Set();

    state.inventory
      .filter(item => item.name.toLowerCase().includes(searchTerm))
      .slice(0, 3)
      .forEach(item => {
        if (!addedNames.has(item.name.toLowerCase())) {
          addedNames.add(item.name.toLowerCase());
          results.push({
            type: 'inventory',
            id: item.id,
            name: capitalize(item.name),
            subtitle: 'In Stock • ' + (item.quantity || 1) + (item.unit ? ' ' + item.unit : ''),
            image: item.image_url || getIngredientImage(item.name, item.category),
            icon: '📦'
          });
        }
      });

    (state.ingredientKnowledge || [])
      .filter(ing => ing.name.toLowerCase().includes(searchTerm))
      .filter(ing => !addedNames.has(ing.name.toLowerCase()))
      .slice(0, 3)
      .forEach(ing => {
        const inStock = state.inventory.some(item => item.name.toLowerCase() === ing.name.toLowerCase());
        results.push({
          type: 'ingredient',
          id: ing.id,
          name: capitalize(ing.name),
          subtitle: inStock ? '✓ In Stock' : 'Ingredient Library',
          image: ing.image_url || getIngredientImage(ing.name, ing.category),
          icon: '🥗'
        });
      });
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 16px; text-align: center; color: ${CONFIG.text_muted};">
        No results found for "${esc(searchTerm)}"
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
      ${results.map(item => `
        <div onclick="${item.type === 'recipe' ? `openRecipeView('${item.id}')` : item.type === 'inventory' ? `showInventoryItemDetail('${item.id}')` : `showIngredientDetail('${item.id}')`}"
          style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 4px;"
          onmouseover="this.style.background='rgba(255,255,255,0.05)'"
          onmouseout="this.style.background='transparent'">
          ${item.image ? `
            <img loading="lazy" src="${esc(item.image)}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="display: none; width: 44px; height: 44px; border-radius: 8px; background: ${CONFIG.background_color}; align-items: center; justify-content: center; font-size: 20px;">${item.icon}</div>
          ` : `
            <div style="width: 44px; height: 44px; border-radius: 8px; background: ${CONFIG.background_color}; display: flex; align-items: center; justify-content: center; font-size: 20px;">${item.icon}</div>
          `}
          <div style="flex: 1; min-width: 0;">
            <div style="color: ${CONFIG.text_color}; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(item.name)}</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">${esc(item.subtitle)}</div>
          </div>
          <div style="color: ${CONFIG.text_muted}; font-size: 12px;">→</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
// MAIN HOME RENDERER
// ============================================================
function renderHome() {
  ensureTodayDateCurrent();
  if (isToday(state.viewingDate)) checkMealAutoTransitions();

  const viewDate = state.viewingDate;
  const isTodayView = isToday(viewDate);

  // Setup gate (only for today, and only after data has loaded from storage)
  if (isTodayView && state.dataLoaded && !state.swipeSettings.setupCompleted) {
    return renderSwipeSetupPrompt();
  }

  // Calendar picker overlay
  const calendarOverlay = state.calendarPickerOpen ? renderDatePicker() : '';

  // Tab-based content
  const tabContent = state.homeTab === 'swipe'
    ? renderSwipeTab()
    : renderSelectedTab();

  return `
    <div id="home-date-swipe-zone" style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 72px;">
      ${renderHomeHeader(viewDate)}
      ${renderCookAgainRow()}
      ${renderPatternSection()}
      ${renderHomeTabs()}
      ${tabContent}
    </div>
    ${calendarOverlay}
    <!-- Floating Quick Log Button -->
    <button onclick="showQuickLogModal()" style="position: fixed; bottom: 68px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background: ${CONFIG.primary_action_color}; border: none; color: white; font-size: 24px; cursor: pointer; z-index: 45; box-shadow: 0 2px 8px rgba(232,93,93,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
    </button>
  `;
}

// ============================================================
// HOME TAB FUNCTIONS
// ============================================================
function setHomeTab(tab) {
  state.homeTab = tab;
  if (tab === 'swipe') {
    const mealType = state.swipeMealType || detectMealType();
    if (!state.swipeMealType) state.swipeMealType = mealType;
    if (!state.swipeDeck || state.swipeDeck.length === 0) {
      state.swipeDeck = state.swipeSettings.setupCompleted
        ? buildSwipeDeckFiltered(state.swipeMealType)
        : buildSwipeDeck(state.swipeMealType);
      state.swipeIndex = 0;
    }
  }
  render();
}

function renderHomeHeader(dateStr) {
  const dateLabel = getDateLabel(dateStr);
  const fullDate = formatDateFull(dateStr);
  const isTodayDay = isToday(dateStr);

  return `
    <div class="max-w-4xl mx-auto" style="padding: ${CONFIG.space_md} ${CONFIG.space_md} 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${CONFIG.space_xs};">
        <button onclick="goToPreviousDay()" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 6px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <div style="text-align: center; flex: 1; cursor: pointer;" onclick="openDatePicker()">
          <div style="color: ${CONFIG.text_color}; font-size: 20px; font-weight: 700;">${dateLabel}</div>
          <div style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; margin-top: 2px;">${fullDate}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button onclick="goToNextDay()" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
          <button onclick="navigateTo('swipe-setup')" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 6px;" title="Swipe Settings">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
        </div>
      </div>

      ${!isTodayDay ? `
        <div style="text-align: center; margin-bottom: ${CONFIG.space_sm};">
          <button onclick="goToToday()"
            style="background: ${CONFIG.primary_subtle}; border: 1px solid rgba(232, 93, 93, 0.3); color: ${CONFIG.primary_action_color}; padding: 6px 16px; border-radius: 20px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer;">
            Go to Today
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderHomeTabs() {
  const swipeActive = state.homeTab === 'swipe';
  const selectedActive = state.homeTab === 'selected';

  return `
    <div style="padding: 0 ${CONFIG.space_md} ${CONFIG.space_sm};">
      <div class="max-w-4xl mx-auto">
        <div class="home-tab-toggle">
          <button class="home-tab-btn ${swipeActive ? 'active' : ''}" onclick="setHomeTab('swipe')">Swipe</button>
          <button class="home-tab-btn ${selectedActive ? 'active' : ''}" onclick="setHomeTab('selected')">Selected</button>
        </div>
      </div>
    </div>
  `;
}

function renderSwipeTab() {
  const dateStr = state.viewingDate;
  const mealType = state.swipeMealType || detectMealType();
  if (!state.swipeMealType) state.swipeMealType = mealType;

  if (!state.swipeDeck || state.swipeDeck.length === 0) {
    state.swipeDeck = state.swipeSettings.setupCompleted
      ? buildSwipeDeckFiltered(state.swipeMealType)
      : buildSwipeDeck(state.swipeMealType);
    state.swipeIndex = 0;
  }

  const deck = state.swipeDeck;
  const idx = state.swipeIndex;

  if (!deck || deck.length === 0) {
    const hasRecipes = state.recipes.filter(r => !r.isDraft && !r.isTip).length > 0;
    return `
      <div class="max-w-4xl mx-auto" style="padding: ${CONFIG.space_2xl} ${CONFIG.space_md}; text-align: center;">
        <div style="font-size: 36px; margin-bottom: ${CONFIG.space_md};">🍽️</div>
        <div style="color: ${CONFIG.text_color}; font-size: 18px; font-weight: 600; margin-bottom: ${CONFIG.space_sm};">${hasRecipes ? 'No recipes selected' : 'No Recipes Available'}</div>
        <div style="color: ${CONFIG.text_muted}; font-size: 14px; margin-bottom: ${CONFIG.space_lg};">${hasRecipes ? 'Tap below to choose which recipes appear in your swipe deck.' : 'Add some recipes first, then set up your meals.'}</div>
        <button onclick="navigateTo('${hasRecipes ? 'swipe-setup' : 'recipes'}')" style="background: ${CONFIG.primary_action_color}; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
          ${hasRecipes ? 'Set Up Your Meals' : 'Go to Recipes'}
        </button>
      </div>
    `;
  }

  const recipe = deck[idx];
  const img = recipeThumb(recipe);
  const ings = recipeIngList(recipe);
  const ingCount = ings.length;
  const category = recipe.category || 'Other';
  const nextRecipe = idx + 1 < deck.length ? deck[idx + 1] : null;
  const nextImg = nextRecipe ? recipeThumb(nextRecipe) : '';
  const dayData = getDayData(dateStr);
  const isFutureDay = isFutureDate(dateStr);
  const mealLabel = capitalize(mealType);

  return `
    <div class="max-w-4xl mx-auto" style="padding: 0 ${CONFIG.space_md};">
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.6);">What's for</div>
        <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${mealLabel}</div>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${['breakfast', 'lunch', 'dinner'].map(mt => {
          const active = mt === state.swipeMealType;
          const alreadySelected = dayData.meals[mt].status !== 'none';
          return `
            <button onclick="state.swipeMealType='${mt}'; state.swipeDeck=state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered('${mt}') : buildSwipeDeck('${mt}'); state.swipeIndex=0; render(); setTimeout(initSwipeGestures, 100);"
              style="padding: 6px 12px; border-radius: 20px; border: 1px solid ${active ? 'rgba(232, 93, 93, 0.4)' : 'rgba(255,255,255,0.15)'}; background: ${active ? 'rgba(232, 93, 93, 0.15)' : 'transparent'}; color: ${active ? '#e85d5d' : 'rgba(255,255,255,0.6)'}; font-size: 13px; font-weight: ${active ? '600' : '400'}; cursor: pointer; transition: all 0.2s ease; position: relative;">
              ${capitalize(mt)}
              ${alreadySelected ? `<span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: ${CONFIG.success_color}; border-radius: 50%;"></span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <div class="swipe-container">
        ${nextRecipe ? `
          <div style="position: absolute; top: 4px; left: 28px; right: 28px; bottom: 4px; background: ${CONFIG.surface_color}; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.2); overflow: hidden; transform: scale(0.97); opacity: 0.6;">
            ${nextImg ? `<img loading="lazy" src="${esc(nextImg)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:48px;">🍽️</div>`}
          </div>
        ` : ''}

        <div class="swipe-card entering" data-active="true">
          <div class="swipe-overlay like">Add!</div>
          <div class="swipe-overlay nope">Skip</div>
          ${img ? `<img loading="lazy" class="card-image" src="${esc(img)}" alt="${esc(recipe.title)}" />` : `<div class="card-image-placeholder">🍽️</div>`}
          <div class="card-body">
            <div class="card-title">${esc(recipe.title)}</div>
            <div class="card-meta">
              <span>${esc(category)}</span>
              ${ingCount > 0 ? `<span>${ingCount} ingredients</span>` : ''}
              ${recipe.timesCooked ? `<span>Cooked ${recipe.timesCooked}x</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 0;">
        <button onclick="handleHomeSwipeLeft()" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(255, 69, 58, 0.3); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #ff453a; transition: all 0.2s ease;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
          ✕
        </button>
        <button onclick="openRecipeView('${recipe.__backendId || recipe.id}'); state.viewingFromSwipe = true;" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: rgba(255,255,255,0.6); transition: all 0.2s ease;">
          👁️
        </button>
        <button onclick="handleHomeSwipeRight()" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(50, 215, 75, 0.3); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #32d74b; transition: all 0.2s ease;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
          ♥
        </button>
      </div>

      <div class="swipe-hint-arrows">
        <span class="swipe-hint-arrow" style="color: ${CONFIG.danger_color};">← Skip</span>
        <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro};">${idx + 1} / ${deck.length}</span>
        <span class="swipe-hint-arrow" style="color: ${CONFIG.success_color};">Add! →</span>
      </div>
    </div>
  `;
}

function renderSelectedTab() {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  const isPastDay = isPastDate(dateStr);
  const isFutureDay = isFutureDate(dateStr);
  const mealOrder = ['breakfast', 'lunch', 'dinner'];
  const progressBar = renderDayProgressBar(dayData, mealOrder);

  return `
    <div class="max-w-4xl mx-auto" style="padding: 0 ${CONFIG.space_md};">
      ${progressBar}
    </div>
    <div class="max-w-4xl mx-auto" style="padding: 0 ${CONFIG.space_md};">
      ${renderMealSection('breakfast', dayData.meals.breakfast, dateStr, isPastDay, isFutureDay)}
      ${renderMealSection('lunch', dayData.meals.lunch, dateStr, isPastDay, isFutureDay)}
      ${renderMealSection('dinner', dayData.meals.dinner, dateStr, isPastDay, isFutureDay)}

      <div style="margin-top: ${CONFIG.space_md};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${CONFIG.space_sm};">
          <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight}; text-transform: uppercase; letter-spacing: ${CONFIG.type_micro_tracking};">Snacks</span>
          <button onclick="showSnackPicker()" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; font-weight: 500;">+ Add</button>
        </div>
        ${dayData.meals.snacks && dayData.meals.snacks.length > 0 ? dayData.meals.snacks.map(snack => `
          <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: ${CONFIG.space_sm} ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_xs}; display: flex; align-items: center; gap: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
            <span style="font-size: 16px;">🍿</span>
            <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; flex: 1;">${esc(snack.name || 'Snack')}</span>
          </div>
        `).join('') : `
          <div style="color: ${CONFIG.text_tertiary}; font-size: ${CONFIG.type_caption}; text-align: center; padding: ${CONFIG.space_sm};">No snacks logged</div>
        `}
      </div>
    </div>
  `;
}

// ============================================================
// DATE NAVIGATION
// ============================================================
function goToPreviousDay() {
  const current = new Date(state.viewingDate + 'T12:00:00');
  current.setDate(current.getDate() - 1);
  state.viewingDate = current.toISOString().split('T')[0];
  render();
}

function goToNextDay() {
  const current = new Date(state.viewingDate + 'T12:00:00');
  current.setDate(current.getDate() + 1);
  state.viewingDate = current.toISOString().split('T')[0];
  render();
}

function goToToday() {
  state.viewingDate = getToday();
  render();
}

function openDatePicker() {
  state.calendarPickerOpen = true;
  state.calendarMonth = new Date(state.viewingDate + 'T12:00:00');
  render();
}

function closeDatePicker() {
  state.calendarPickerOpen = false;
  render();
}

function selectDate(dateStr) {
  state.viewingDate = dateStr;
  state.calendarPickerOpen = false;
  render();
}

function calendarPreviousMonth() {
  if (!state.calendarMonth) state.calendarMonth = new Date(state.viewingDate + 'T12:00:00');
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
  render();
}

function calendarNextMonth() {
  if (!state.calendarMonth) state.calendarMonth = new Date(state.viewingDate + 'T12:00:00');
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
  render();
}

function goToSwipe(mealType) {
  state.homeTab = 'swipe';
  state.swipeMealType = mealType;
  state.todaySwipeMealSlot = mealType;
  state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(mealType) : buildSwipeDeck(mealType);
  state.swipeIndex = 0;
  render();
}

function onSwipeExit() {
  if (state._returnToFoodLog) {
    state._returnToFoodLog = false;
    state._swapTargetLogId = null;
    state._swapMealType = null;
    state._swapDateStr = null;
    state.homeTab = 'selected';
    navigateTo('my-meals');
    return;
  }
  state.homeTab = 'selected';
  state.todaySwipeMealSlot = null;
  render();
}

function toggleMealExpanded(mealType, dateStr) {
  const dayData = getDayData(dateStr);
  if (!dayData.meals[mealType].expanded) {
    dayData.meals[mealType].expanded = true;
  } else {
    dayData.meals[mealType].expanded = false;
  }
  render();
}

// ============================================================
// DAY VIEW
// ============================================================
function renderDayView(dateStr) {
  const dayData = getDayData(dateStr);
  const dateLabel = getDateLabel(dateStr);
  const fullDate = formatDateFull(dateStr);
  const isPastDay = isPastDate(dateStr);
  const isFutureDay = isFutureDate(dateStr);
  const isTodayDay = isToday(dateStr);
  const mealOrder = ['breakfast', 'lunch', 'dinner'];
  const progressBar = renderDayProgressBar(dayData, mealOrder);

  return `
    <div id="home-date-swipe-zone" style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 72px;">
      <div class="max-w-4xl mx-auto" style="padding: ${CONFIG.space_lg} ${CONFIG.space_md} ${CONFIG.space_sm};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${CONFIG.space_sm};">
          <button onclick="goToPreviousDay()" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </button>
          <div style="text-align: center; flex: 1; cursor: pointer;" onclick="openDatePicker()">
            <div style="color: ${CONFIG.text_color}; font-size: 20px; font-weight: 700;">${dateLabel}</div>
            <div style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; margin-top: 2px;">${fullDate}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button onclick="goToNextDay()" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 8px;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
            <button onclick="navigateTo('swipe-setup')" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 6px;" title="Swipe Settings">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
        </div>

        ${!isTodayDay ? `
          <div style="text-align: center; margin-bottom: ${CONFIG.space_sm};">
            <button onclick="goToToday()"
              style="background: ${CONFIG.primary_subtle}; border: 1px solid rgba(232, 93, 93, 0.3); color: ${CONFIG.primary_action_color}; padding: 6px 16px; border-radius: 20px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer;">
              Go to Today
            </button>
          </div>
        ` : ''}

        ${progressBar}
      </div>

      <div class="max-w-4xl mx-auto" style="padding: 0 ${CONFIG.space_md};">
        ${renderMealSection('breakfast', dayData.meals.breakfast, dateStr, isPastDay, isFutureDay)}
        ${renderMealSection('lunch', dayData.meals.lunch, dateStr, isPastDay, isFutureDay)}
        ${renderMealSection('dinner', dayData.meals.dinner, dateStr, isPastDay, isFutureDay)}

        <div style="margin-top: ${CONFIG.space_md};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${CONFIG.space_sm};">
            <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight}; text-transform: uppercase; letter-spacing: ${CONFIG.type_micro_tracking};">Snacks</span>
            <button onclick="showSnackPicker()" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; font-weight: 500;">+ Add</button>
          </div>
          ${dayData.meals.snacks && dayData.meals.snacks.length > 0 ? dayData.meals.snacks.map(snack => `
            <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: ${CONFIG.space_sm} ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_xs}; display: flex; align-items: center; gap: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
              <span style="font-size: 16px;">🍿</span>
              <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; flex: 1;">${esc(snack.name || 'Snack')}</span>
            </div>
          `).join('') : `
            <div style="color: ${CONFIG.text_tertiary}; font-size: ${CONFIG.type_caption}; text-align: center; padding: ${CONFIG.space_sm};">No snacks logged</div>
          `}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// DAY PROGRESS BAR
// ============================================================
function renderDayProgressBar(dayData, mealOrder) {
  return `
    <div style="display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: ${CONFIG.space_md}; padding: 0 ${CONFIG.space_lg};">
      ${mealOrder.map((meal, index) => {
        const slot = dayData.meals[meal];
        const status = slot.status;
        let dotColor = CONFIG.text_tertiary;
        let dotIcon = '';
        if (status === 'logged') {
          dotColor = CONFIG.success_color;
          dotIcon = `<svg width="14" height="14" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`;
        } else if (status === 'pending') {
          dotColor = CONFIG.text_color;
          dotIcon = `<div style="width:6px; height:6px; background:${CONFIG.background_color}; border-radius:50%;"></div>`;
        } else if (status === 'selected') {
          dotColor = 'rgba(255,255,255,0.3)';
          dotIcon = `<div style="width:6px; height:6px; background:${CONFIG.background_color}; border-radius:50%;"></div>`;
        }

        const connectorColor = (index < mealOrder.length - 1) ?
          (status === 'logged' ? 'rgba(50, 215, 75, 0.3)' : CONFIG.divider_color) : 'transparent';

        return `
          <div style="display: flex; align-items: center; flex: 1;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${dotColor}; display: flex; align-items: center; justify-content: center;">
                ${dotIcon}
              </div>
              <span style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; font-weight: ${CONFIG.type_micro_weight};">${capitalize(meal)}</span>
            </div>
            ${index < mealOrder.length - 1 ? `<div style="flex: 1; height: 2px; background: ${connectorColor}; margin: 0 4px; margin-bottom: 18px;"></div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
// MEAL SECTION
// ============================================================
function renderMealSection(mealType, meal, dateStr, isPastDay, isFutureDay) {
  const label = capitalize(mealType);
  const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
  const icon = icons[mealType] || '🍽';

  if (meal.status === 'none' && isPastDay) {
    return `
      <div onclick="showMealActionSheet('${mealType}', '${dateStr}')" style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow}; cursor: pointer;" class="card-press">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</span>
              <span style="background: rgba(255,255,255,0.05); color: ${CONFIG.text_tertiary}; padding: 2px 8px; border-radius: 8px; font-size: ${CONFIG.type_micro};">Not logged</span>
            </div>
            <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">Tap to log what you ate</div>
          </div>
        </div>
      </div>
    `;
  }

  if (meal.status === 'none') {
    return `
      <div onclick="showMealActionSheet('${mealType}', '${dateStr}')" style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow}; cursor: pointer;" class="card-press">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(232,93,93,0.1);">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </div>
          <div>
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</div>
            <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">Tap to add a meal</div>
          </div>
        </div>
      </div>
    `;
  }

  const recipe = getRecipeById(meal.plannedRecipeId);
  const img = recipe ? recipeThumb(recipe) : null;

  if (meal.status === 'selected' && isFutureDay) {
    return `
      <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${CONFIG.space_sm};">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</span>
          </div>
          <button onclick="changeMeal('${mealType}', '${dateStr}')" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; font-weight: 500;">Change</button>
        </div>
        <div style="display: flex; align-items: center; gap: ${CONFIG.space_md};">
          <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:24px;">${icon}</div>`}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${recipe ? esc(recipe.title) : 'Selected'}</div>
            <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${recipe ? (recipe.cookTime || '30 min') : ''}</div>
            <span style="display: inline-block; margin-top: 4px; background: rgba(50, 215, 75, 0.1); color: ${CONFIG.success_color}; padding: 2px 8px; border-radius: 8px; font-size: ${CONFIG.type_micro};">Planned</span>
          </div>
        </div>
      </div>
    `;
  }

  if (meal.status === 'selected' || meal.status === 'pending') {
    if (meal.expanded) {
      return renderExpandedMealSection(mealType, meal, recipe, dateStr);
    }

    return `
      <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${CONFIG.space_sm};">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</span>
          </div>
          <button onclick="changeMeal('${mealType}', '${dateStr}')" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; font-weight: 500;">Change</button>
        </div>
        <div style="display: flex; align-items: center; gap: ${CONFIG.space_md};">
          <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:24px;">${icon}</div>`}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${recipe ? esc(recipe.title) : 'Selected'}</div>
            <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${recipe ? (recipe.cookTime || '30 min') : ''}</div>
            <button onclick="toggleMealExpanded('${mealType}', '${dateStr}')"
              style="margin-top: 6px; background: ${CONFIG.primary_action_color}; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
              Log meal
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (meal.status === 'logged') {
    const actualRecipe = meal.actualRecipeId ? getRecipeById(meal.actualRecipeId) : recipe;
    const displayImg = meal.photoUrl || (actualRecipe ? recipeThumb(actualRecipe) : img);
    let statusBadge = '';
    let statusBg = '';
    let displayName = '';

    if (meal.actualType === 'matched') { statusBg = CONFIG.success_color; statusBadge = 'Cooked'; }
    else if (meal.actualType === 'takeout') { statusBg = CONFIG.warning_color; statusBadge = 'Takeout'; }
    else if (meal.actualType === 'different_recipe') { statusBg = CONFIG.primary_action_color; statusBadge = 'Swapped'; }
    else if (meal.actualType === 'remix') { statusBg = CONFIG.primary_action_color; statusBadge = 'Remix'; }
    else if (meal.actualType === 'skipped') { statusBg = CONFIG.text_tertiary; statusBadge = 'Skipped'; }

    if (meal.actualType === 'takeout') {
      const ti = meal.takeoutInfo;
      displayName = (ti && typeof ti === 'object') ? esc(ti.description || 'Takeout') : esc(ti || 'Takeout');
    } else if (meal.actualType === 'remix') {
      const baseRecipe = meal.remixInfo?.baseRecipeId ? getRecipeById(meal.remixInfo.baseRecipeId) : actualRecipe;
      displayName = baseRecipe ? esc(baseRecipe.title) + ' (remixed)' : 'Remix';
    } else {
      displayName = actualRecipe ? esc(actualRecipe.title) : 'Skipped';
    }

    return `
      <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${CONFIG.space_sm};">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</span>
            ${statusBadge ? `<span style="background: ${statusBg}; color: white; padding: 2px 8px; border-radius: 8px; font-size: ${CONFIG.type_micro};">${statusBadge}</span>` : ''}
          </div>
          <span style="color: ${CONFIG.success_color}; font-size: ${CONFIG.type_caption}; font-weight: 500;">Done</span>
        </div>
        <div style="display: flex; align-items: center; gap: ${CONFIG.space_md};">
          <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
            ${displayImg ? `<img loading="lazy" src="${esc(displayImg)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:24px;">${icon}</div>`}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// ============================================================
// EXPANDED MEAL SECTION (for logging)
// ============================================================
function renderExpandedMealSection(mealType, meal, recipe, dateStr) {
  const label = capitalize(mealType);
  const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
  const icon = icons[mealType] || '🍽';
  const img = recipe ? recipeThumb(recipe) : null;
  const hasPhoto = !!meal.photoUrl;

  return `
    <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: ${CONFIG.space_md}; margin-bottom: ${CONFIG.space_sm}; box-shadow: ${CONFIG.shadow};">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${CONFIG.space_md};">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">${icon}</span>
          <span style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: 600;">${label}</span>
        </div>
        <button onclick="changeMeal('${mealType}', '${dateStr}')" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; font-weight: 500;">Change</button>
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <div style="font-size: ${CONFIG.type_micro}; font-weight: 600; letter-spacing: 1px; color: ${CONFIG.text_muted}; text-transform: uppercase; margin-bottom: ${CONFIG.space_sm};">What You Planned</div>
        <div style="display: flex; align-items: center; gap: ${CONFIG.space_sm};">
          <div style="width: 48px; height: 48px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:20px;">${icon}</div>`}
          </div>
          <div>
            <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 500;">${recipe ? esc(recipe.title) : 'Selected'}</div>
            <button onclick="openRecipeView('${recipe ? (recipe.__backendId || recipe.id) : ''}')" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer; padding: 0;">View recipe</button>
          </div>
        </div>
      </div>

      <div style="height: 1px; background: ${CONFIG.divider_color}; margin-bottom: ${CONFIG.space_md};"></div>

      <div style="margin-bottom: ${CONFIG.space_sm};">
        <div style="font-size: ${CONFIG.type_micro}; font-weight: 600; letter-spacing: 1px; color: ${CONFIG.text_muted}; text-transform: uppercase; margin-bottom: ${CONFIG.space_sm};">${hasPhoto ? 'What You Ate' : 'What Did You Eat?'}</div>

        ${hasPhoto ? `
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: ${CONFIG.space_xs}; cursor: pointer;" onclick="retakeMealPlanPhoto('${mealType}')">
            <img src="${meal.photoUrl}" style="width: 100%; height: 160px; object-fit: cover;" />
          </div>
          <div style="text-align: center; margin-bottom: ${CONFIG.space_md};">
            <span style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted};">Tap photo to retake</span>
          </div>

          <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 500; text-align: center; margin-bottom: ${CONFIG.space_md};">
            Was this your planned meal?
          </div>

          <button onclick="confirmMealPlan('${mealType}', 'matched')"
            style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: ${CONFIG.space_sm}; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Yes, matched plan
          </button>

          <div style="display: flex; gap: ${CONFIG.space_sm}; margin-bottom: ${CONFIG.space_sm};">
            <button onclick="showDifferentRecipePicker('${mealType}')"
              style="flex: 1; padding: 12px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: none; border-radius: 12px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer;">
              Different Recipe
            </button>
            <button onclick="showTakeoutLogger('${mealType}')"
              style="flex: 1; padding: 12px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: none; border-radius: 12px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer;">
              Takeout
            </button>
          </div>

          <button onclick="showRemixForm('${mealType}')"
            style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: 1px solid ${CONFIG.divider_color}; border-radius: 12px; font-size: ${CONFIG.type_caption}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
            Remix
          </button>
        ` : `
          <div onclick="takeMealPlanPhoto('${mealType}')" style="border: 2px dashed rgba(255,255,255,0.15); border-radius: 16px; padding: 36px 24px; text-align: center; cursor: pointer;">
            <div style="margin-bottom: ${CONFIG.space_sm};">
              <svg width="40" height="40" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1" viewBox="0 0 24 24" style="opacity: 0.5;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
            </div>
            <div style="color: ${CONFIG.text_muted}; font-size: 15px;">Take a photo of your meal</div>
          </div>
        `}
      </div>

      <div style="display: flex; justify-content: center; gap: ${CONFIG.space_md}; margin-top: ${CONFIG.space_sm}; padding-top: ${CONFIG.space_sm}; border-top: 1px solid ${CONFIG.divider_color};">
        <button onclick="toggleMealExpanded('${mealType}', '${dateStr}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Collapse</button>
        <span style="color: ${CONFIG.text_tertiary};">·</span>
        <button onclick="skipMealLogging('${mealType}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Skip logging</button>
      </div>
    </div>
  `;
}

// ============================================================
// CALENDAR DATE PICKER
// ============================================================
function renderDatePicker() {
  const today = getToday();
  const calMonth = state.calendarMonth || new Date(state.viewingDate + 'T12:00:00');
  const weeks = generateCalendarWeeks(calMonth);

  return `
    <div onclick="closeDatePicker()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100;">
      <div onclick="event.stopPropagation()" style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: 20px; width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <button onclick="calendarPreviousMonth()" style="background: none; border: none; color: ${CONFIG.text_color}; font-size: 18px; cursor: pointer; padding: 8px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </button>
          <span style="font-size: 16px; font-weight: 600; color: ${CONFIG.text_color};">${formatMonthYear(calMonth)}</span>
          <button onclick="calendarNextMonth()" style="background: none; border: none; color: ${CONFIG.text_color}; font-size: 18px; cursor: pointer; padding: 8px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 8px;">
          ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<span style="font-size: 12px; color: ${CONFIG.text_muted}; padding: 8px 0;">${d}</span>`).join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${weeks.map(week => `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr);">
              ${week.map(day => {
                if (!day) return `<span style="aspect-ratio: 1;"></span>`;
                const dateStr = day.toISOString().split('T')[0];
                const isSelected = dateStr === state.viewingDate;
                const isTodayDate = dateStr === today;
                const hasMeals = hasMealsOnDate(dateStr);

                let bgStyle = 'transparent';
                let textColor = CONFIG.text_color;
                if (isSelected) { bgStyle = CONFIG.primary_action_color; textColor = 'white'; }
                else if (isTodayDate) { textColor = CONFIG.primary_action_color; }

                return `
                  <span onclick="selectDate('${dateStr}')" style="aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; color: ${textColor}; cursor: pointer; border-radius: 50%; background: ${bgStyle}; position: relative; font-weight: ${isTodayDate ? '600' : '400'};">
                    ${day.getDate()}
                    ${hasMeals ? `<span style="position: absolute; bottom: 3px; width: 4px; height: 4px; background: ${isSelected ? 'white' : CONFIG.success_color}; border-radius: 50%;"></span>` : ''}
                  </span>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>

        <button onclick="selectDate('${today}')" style="width: 100%; margin-top: 16px; padding: 12px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
          Go to Today
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// CHANGE MEAL
// ============================================================
function changeMeal(mealType, dateStr) {
  const dayData = getDayData(dateStr);
  dayData.meals[mealType] = freshMealSlot();
  saveMealDay(dateStr);
  state.viewingDate = dateStr;
  showMealActionSheet(mealType, dateStr);
}

// ============================================================
// SWIPE SETUP PROMPT
// ============================================================
function renderSwipeSetupPrompt() {
  return `
    <div style="text-align: center; padding-top: ${CONFIG.space_2xl};">
      <div style="width: 64px; height: 64px; background: ${CONFIG.primary_subtle}; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto ${CONFIG.space_md};">
        <svg width="32" height="32" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25"/></svg>
      </div>
      <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; margin-bottom: ${CONFIG.space_xs};">Set Up Your Meals</div>
      <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; max-width: 260px; margin: 0 auto ${CONFIG.space_lg};">Pick which recipes appear for each meal type to start swiping.</div>
      <button onclick="navigateTo('swipe-setup')" style="padding: 14px 32px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Get Started
      </button>
    </div>
  `;
}

// ============================================================
// EMBEDDED SWIPE CARDS (Home)
// ============================================================
function renderHomeSwipeCards(meal) {
  const mealLabel = capitalize(meal);
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;

  if (!deck || deck.length === 0) {
    return emptyState(
      '🍽',
      `No recipes for ${mealLabel}. Add recipes or update your swipe settings.`,
      'Add Recipes',
      "navigateTo('recipes')"
    );
  }

  const recipe = deck[idx];
  const img = recipeThumb(recipe);
  const ings = recipeIngList(recipe);
  const category = recipe.category || 'Other';
  const nextRecipe = idx + 1 < deck.length ? deck[idx + 1] : null;
  const nextImg = nextRecipe ? recipeThumb(nextRecipe) : '';

  return `
    <div style="text-align: center; margin-bottom: ${CONFIG.space_md}; margin-top: ${CONFIG.space_sm};">
      <div style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.6);">What's for</div>
      <div style="font-size: 20px; font-weight: 600; color: #ffffff;">${mealLabel}</div>
    </div>

    <div class="swipe-container">
      ${nextRecipe ? `
        <div style="position: absolute; width: 280px; max-width: 80vw; background: ${CONFIG.surface_color}; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); overflow: hidden; transform: scale(0.95) translateY(10px);">
          <div style="height: 240px; background: rgba(255,255,255,0.05);">
            ${nextImg ? `<img loading="lazy" src="${esc(nextImg)}" style="width:100%; height:100%; object-fit:cover; opacity:0.6;" />` : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:48px;">🍽</div>`}
          </div>
          <div style="padding: 16px;"><div style="font-size: 16px; font-weight: 600; color: ${CONFIG.text_muted};">${esc(nextRecipe.title)}</div></div>
        </div>
      ` : ''}

      <div class="swipe-card entering" data-active="true">
        <div class="swipe-overlay like">Cook!</div>
        <div class="swipe-overlay nope">Skip</div>
        ${img ? `<img loading="lazy" class="card-image" src="${esc(img)}" alt="${esc(recipe.title)}" />` : `<div class="card-image-placeholder">🍽</div>`}
        <div class="card-body">
          <div class="card-title">${esc(recipe.title)}</div>
          <div class="card-meta">
            <span>${esc(category)}</span>
            ${ings.length > 0 ? `<span>${ings.length} ingredients</span>` : ''}
            ${recipe.timesCooked ? `<span>Cooked ${recipe.timesCooked}x</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: center; gap: 24px; padding: 16px 0;">
      <button onclick="handleHomeSwipeLeft()" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${CONFIG.danger_color}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        ✕
      </button>
      <button onclick="openRecipeView('${recipe.__backendId || recipe.id}'); state.viewingFromSwipe = true;" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${CONFIG.text_muted}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        👁
      </button>
      <button onclick="handleHomeSwipeRight()" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${CONFIG.success_color}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        &#9829;
      </button>
    </div>

    <div class="swipe-hint-arrows">
      <span class="swipe-hint-arrow" style="color: ${CONFIG.danger_color};">← Skip</span>
      <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro};">${idx + 1} / ${deck.length}</span>
      <span class="swipe-hint-arrow" style="color: ${CONFIG.success_color};">Cook! →</span>
    </div>

    <div style="text-align: center; margin-top: ${CONFIG.space_md};">
      <button onclick="skipMealSlot('${meal}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer; text-decoration: underline;">Skip ${mealLabel}</button>
    </div>
  `;
}

// ============================================================
// MEAL MODALS: Takeout, Remix, Different Recipe, Snack, Photo, Quick Log
// ============================================================
function showTakeoutLogger(meal) {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">Takeout / Eating Out</h3>
      <div style="margin-bottom: ${CONFIG.space_sm};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Restaurant</label>
        <input type="text" id="takeoutRestaurant" placeholder="e.g., Chipotle"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" autofocus />
      </div>
      <div style="margin-bottom: ${CONFIG.space_sm};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Meal</label>
        <input type="text" id="takeoutMealName" placeholder="e.g., Burrito bowl"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
      </div>
      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Price <span style="opacity: 0.5;">(optional)</span></label>
        <input type="number" id="takeoutPrice" placeholder="0.00" step="0.01" min="0"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
      </div>
      <button onclick="submitTakeoutForm('${meal}')"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: ${CONFIG.space_xs};">
        Save
      </button>
      <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

async function submitTakeoutForm(meal) {
  const restaurant = document.getElementById('takeoutRestaurant')?.value.trim() || '';
  const mealName = document.getElementById('takeoutMealName')?.value.trim() || '';
  const price = parseFloat(document.getElementById('takeoutPrice')?.value) || null;
  const desc = restaurant && mealName ? `${mealName} from ${restaurant}` : restaurant || mealName || 'Takeout';
  const takeoutInfo = { restaurant, meal: mealName, price, description: desc };
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'takeout';
  dayData.meals[meal].takeoutInfo = takeoutInfo;
  dayData.meals[meal].loggedAt = Date.now();
  dayData.meals[meal].expanded = false;
  closeModal();
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged as takeout!`, 'success');
  render();
}

function showRemixForm(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  const slot = dayData.meals[meal];
  const recipe = getRecipeById(slot.plannedRecipeId);
  const recipeName = recipe ? esc(recipe.title) : 'your meal';
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_xs};">Remix</h3>
      <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; margin-bottom: ${CONFIG.space_lg};">Based on ${recipeName}</div>
      <textarea id="remixModifications" rows="3" placeholder="What did you change? e.g., Added bacon, Used almond milk, Half portion"
        style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; margin-bottom: ${CONFIG.space_md}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};" autofocus></textarea>
      <button onclick="logMealAsRemix('${meal}')"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: ${CONFIG.space_xs};">
        Save Remix
      </button>
      <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function showDifferentRecipePicker(meal) {
  const recipes = state.recipes.filter(r => !r.isDraft && !r.isTip).slice(0, 30);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">Pick Recipe</h3>
      <div style="max-height: 400px; overflow-y: auto;">
        ${recipes.map(r => `
          <div onclick="closeModal(); logMealAsDifferent('${meal}', '${r.__backendId || r.id}')" class="card-press"
            style="display: flex; align-items: center; gap: 12px; padding: 10px; margin-bottom: 6px; background: ${CONFIG.background_color}; border-radius: 12px; cursor: pointer;">
            ${recipeThumb(r) ? `<img loading="lazy" src="${esc(recipeThumb(r))}" style="width:48px; height:48px; object-fit:cover; border-radius:8px;" />` : `<div style="width:48px; height:48px; background:${CONFIG.surface_elevated}; border-radius:8px; display:flex; align-items:center; justify-content:center;">🍽</div>`}
            <span style="font-size: 14px; font-weight: 500;">${esc(r.title)}</span>
          </div>
        `).join('')}
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function showSnackPicker() {
  const recipes = state.recipes.filter(r => !r.isDraft && !r.isTip).slice(0, 15);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">Add Snack</h3>
      <div style="margin-bottom: ${CONFIG.space_md};">
        <input type="text" id="quickSnackName" placeholder="Quick add (e.g., 'Apple')"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;"
          onkeydown="if(event.key === 'Enter') { addQuickSnack(); }" />
        <button onclick="addQuickSnack()" style="width: 100%; margin-top: 8px; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Add</button>
      </div>
      <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro}; margin-bottom: ${CONFIG.space_sm}; text-transform: uppercase; letter-spacing: 0.5px;">Or pick a recipe</div>
      <div style="max-height: 250px; overflow-y: auto;">
        ${recipes.map(r => `
          <div onclick="addSnackFromRecipe('${r.__backendId || r.id}')" class="card-press"
            style="padding: 10px; margin-bottom: 4px; background: ${CONFIG.background_color}; border-radius: 8px; cursor: pointer; font-size: 14px; color: ${CONFIG.text_color};">
            ${esc(r.title)}
          </div>
        `).join('')}
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

async function addQuickSnack() {
  const name = document.getElementById('quickSnackName')?.value.trim();
  if (!name) return;
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals.snacks.push({ name, loggedAt: Date.now() });
  closeModal();
  await saveMealDay(dateStr);
  showToast('Snack added!', 'success');
  render();
}

async function addSnackFromRecipe(recipeId) {
  const recipe = getRecipeById(recipeId);
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals.snacks.push({ name: recipe?.title || 'Snack', recipeId, loggedAt: Date.now() });
  closeModal();
  await saveMealDay(dateStr);
  showToast('Snack logged!', 'success');
  render();
}

function showQuickLogModal() {
  const mealType = detectMealType ? detectMealType() : 'dinner';
  const dateStr = (state.currentView === 'my-meals' && state.myMealsDate) ? state.myMealsDate : getToday();
  showMealActionSheet(mealType, dateStr);
}

function showCustomMealForm(meal) {
  const label = capitalize(meal);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_xs};">Log Custom Meal</h3>
      <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; margin-bottom: ${CONFIG.space_lg};">What did you have for ${label.toLowerCase()}?</div>
      <div style="margin-bottom: ${CONFIG.space_sm};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Meal name</label>
        <input type="text" id="customMealName" placeholder="e.g., Leftover stir fry, eggs and toast"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" autofocus />
      </div>
      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes <span style="opacity: 0.5;">(optional)</span></label>
        <textarea id="customMealNotes" rows="2" placeholder="Any details about the meal"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};"></textarea>
      </div>
      <button onclick="submitCustomMealForm('${meal}')"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: ${CONFIG.space_xs};">
        Save
      </button>
      <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

async function submitCustomMealForm(meal) {
  const name = document.getElementById('customMealName')?.value.trim();
  if (!name) {
    showToast('Please enter what you ate', 'error');
    return;
  }
  const notes = document.getElementById('customMealNotes')?.value.trim() || '';
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'remix';
  dayData.meals[meal].remixInfo = { name, notes, baseRecipeId: null };
  dayData.meals[meal].loggedAt = Date.now();
  dayData.meals[meal].expanded = false;
  addFoodLogEntry({ recipeName: name, mealType: meal, notes: notes || null, dateStr: dateStr, status: 'planned' });
  closeModal();
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged!`, 'success');
  render();
}

// ============================================================
// MEAL PLAN PHOTO CAPTURE
// ============================================================
function takeMealPlanPhoto(meal) {
  const dateStr = state.viewingDate;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file, 800, 0.7);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dayData = getDayData(dateStr);
      dayData.meals[meal].photoUrl = ev.target.result;
      await saveMealDay(dateStr);
      render();
    };
    reader.readAsDataURL(compressed);
  };
  input.click();
}

function retakeMealPlanPhoto(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].photoUrl = null;
  takeMealPlanPhoto(meal);
}

async function confirmMealPlan(meal, type) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].actualType = type;
  dayData.meals[meal].loggedAt = Date.now();
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].expanded = false;
  if (type === 'matched') {
    dayData.meals[meal].actualRecipeId = dayData.meals[meal].plannedRecipeId;
  }
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged!`, 'success');
  render();
}

async function skipMealLogging(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'skipped';
  dayData.meals[meal].loggedAt = Date.now();
  dayData.meals[meal].expanded = false;
  await saveMealDay(dateStr);
  render();
}

async function logMealAsRemix(meal) {
  const modifications = document.getElementById('remixModifications')?.value.trim();
  if (!modifications) return;
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  const slot = dayData.meals[meal];
  slot.status = 'logged';
  slot.actualType = 'remix';
  slot.actualRecipeId = slot.plannedRecipeId;
  slot.remixInfo = { baseRecipeId: slot.plannedRecipeId, modifications };
  slot.loggedAt = Date.now();
  slot.expanded = false;
  closeModal();
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged as remix!`, 'success');
  render();
}

// ============================================================
// MULTI-DAY MEAL FLOW STATE MACHINE
// ============================================================
function getActiveHomeSlot() {
  ensureTodayDateCurrent();
  checkMealAutoTransitions();

  if (!state.swipeSettings.setupCompleted) {
    return { type: 'setup-needed' };
  }

  const meals = state.today.meals;
  const mealOrder = ['breakfast', 'lunch', 'dinner'];

  const allLogged = mealOrder.every(m => meals[m].status === 'logged');
  if (allLogged) return { type: 'summary' };

  for (const meal of mealOrder) {
    if (meals[meal].status === 'pending' || meals[meal].status === 'selected') return { type: 'meal-plan', meal };
  }

  if (state.todaySwipeMealSlot && meals[state.todaySwipeMealSlot]?.status === 'none') {
    return { type: 'swiping', meal: state.todaySwipeMealSlot };
  }

  const currentMeal = detectMealType();
  if (currentMeal !== 'snack' && meals[currentMeal]) {
    if (meals[currentMeal].status === 'none') return { type: 'swiping', meal: currentMeal };
  }

  for (const meal of mealOrder) {
    if (meals[meal].status === 'none') return { type: 'swiping', meal };
  }

  return { type: 'summary' };
}

async function confirmHomeSwipeSelection(recipeId) {
  const meal = state.swipeContext.mealType || state.swipeMealType || state.todaySwipeMealSlot;
  const dateStr = state.swipeContext.forDate || state.viewingDate;
  if (!meal) return;

  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'selected';
  dayData.meals[meal].plannedRecipeId = recipeId;
  dayData.meals[meal].selectedAt = Date.now();

  let plan = state.planData.find(p => p.date === dateStr);
  if (!plan) {
    plan = { id: `plan_${dateStr}`, type: 'plan', date: dateStr, breakfast: [], lunch: [], dinner: [] };
    state.planData.push(plan);
  }
  if (!Array.isArray(plan[meal])) plan[meal] = [];
  if (!plan[meal].includes(recipeId)) plan[meal].push(recipeId);

  state.ignoreRealtimeUntil = Date.now() + 3000;
  await Promise.all([
    storage.update(plan).then(r => { if (!r?.isOk) return storage.create(plan); }),
    saveMealDay(dateStr)
  ]);

  state.homeTab = 'selected';
  state.todaySwipeMealSlot = null;
  showToast(`${capitalize(meal)} picked!`, 'success');
  render();
}

async function logMealAsMatched(meal, photoBase64) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'matched';
  dayData.meals[meal].actualRecipeId = dayData.meals[meal].plannedRecipeId;
  dayData.meals[meal].photoUrl = photoBase64 || null;
  dayData.meals[meal].loggedAt = Date.now();
  const recipe = getRecipeById(dayData.meals[meal].plannedRecipeId);
  if (recipe) {
    const ings = recipeIngList(recipe);
    addFoodLogEntry({
      recipeId: recipe.__backendId || recipe.id,
      recipeName: recipe.title || recipe.name || 'Recipe',
      image: recipeThumb(recipe),
      ingredients: ings.map(i => i.name),
      category: recipe.category || 'Other',
      mealType: meal,
      photo: photoBase64 || null,
      dateStr: dateStr,
      status: 'planned'
    });
  }
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged!`, 'success');
  render();
}

async function logMealAsDifferent(meal, actualRecipeId) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'different_recipe';
  dayData.meals[meal].actualRecipeId = actualRecipeId;
  dayData.meals[meal].loggedAt = Date.now();
  const recipe = getRecipeById(actualRecipeId);
  if (recipe) {
    const ings = recipeIngList(recipe);
    addFoodLogEntry({
      recipeId: recipe.__backendId || recipe.id,
      recipeName: recipe.title || recipe.name || 'Recipe',
      image: recipeThumb(recipe),
      ingredients: ings.map(i => i.name),
      category: recipe.category || 'Other',
      mealType: meal,
      dateStr: dateStr,
      status: 'planned'
    });
  }
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged!`, 'success');
  render();
}

async function logMealAsTakeout(meal, takeoutInfo) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'takeout';
  dayData.meals[meal].takeoutInfo = takeoutInfo;
  dayData.meals[meal].loggedAt = Date.now();
  addFoodLogEntry({
    recipeName: takeoutInfo?.restaurant ? `${takeoutInfo.restaurant} - ${takeoutInfo.meal || 'Takeout'}` : (takeoutInfo?.meal || 'Takeout'),
    mealType: meal,
    category: 'Takeout',
    dateStr: dateStr,
    status: 'planned'
  });
  await saveMealDay(dateStr);
  showToast(`${capitalize(meal)} logged!`, 'success');
  render();
}

async function logMealAsSkipped(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'logged';
  dayData.meals[meal].actualType = 'skipped';
  dayData.meals[meal].loggedAt = Date.now();
  await saveMealDay(dateStr);
  render();
}

async function changeMyMind(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal] = freshMealSlot();
  state.todaySwipeMealSlot = meal;
  state.swipeMealType = meal;
  state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(meal) : buildSwipeDeck(meal);
  state.swipeIndex = 0;
  await saveMealDay(dateStr);
  render();
}

function triggerMealLog(meal) {
  const dateStr = state.viewingDate;
  const dayData = getDayData(dateStr);
  dayData.meals[meal].status = 'pending';
  saveMealDay(dateStr);
  render();
}

// ============================================================
// SWIPE SYSTEM
// ============================================================
function handleHomeSwipeRight() {
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;
  if (idx >= deck.length) return;
  const recipe = deck[idx];
  const card = document.querySelector('.swipe-card[data-active="true"]');
  const doLog = () => {
    const dateStr = state.viewingDate || getToday();
    const mealType = state.swipeMealType || detectMealType();
    const ings = recipeIngList(recipe);
    const newName = recipe.title || recipe.name || 'Recipe';

    if (state._swapTargetLogId) {
      const oldLog = getFoodLog().find(e => e.id === state._swapTargetLogId);
      const oldName = oldLog ? oldLog.recipeName : 'old meal';
      deleteFoodLogEntry(state._swapTargetLogId);
      const entry = addFoodLogEntry({
        recipeId: recipe.__backendId || recipe.id,
        recipeName: newName,
        image: recipeThumb(recipe),
        ingredients: ings.map(i => i.name),
        category: recipe.category || 'Other',
        mealType: state._swapMealType || mealType,
        dateStr: state._swapDateStr || dateStr,
        status: 'planned'
      });
      showToast(`Swapped! ${oldName} → ${newName}`, 'success');
      state._swapTargetLogId = null;
      state._swapMealType = null;
      state._swapDateStr = null;
      state._returnToFoodLog = true;
      state._lastLoggedEntryId = entry.id;
    } else {
      const entry = addFoodLogEntry({
        recipeId: recipe.__backendId || recipe.id,
        recipeName: newName,
        image: recipeThumb(recipe),
        ingredients: ings.map(i => i.name),
        category: recipe.category || 'Other',
        mealType: mealType,
        dateStr: dateStr,
        status: 'planned'
      });
      const dateLabel = getFoodLogDateLabel(dateStr);
      const mealLabel = capitalize(mealType);
      showToast(`Added to ${mealLabel} on ${dateLabel}`, 'success');
      state._lastLoggedEntryId = entry.id;
    }

    state.swipeIndex++;
    if (state.swipeIndex >= deck.length) {
      state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(state.swipeMealType) : buildSwipeDeck(state.swipeMealType);
      state.swipeIndex = 0;
    }

    if (state._returnToFoodLog) {
      state._returnToFoodLog = false;
      state.homeTab = 'selected';
      navigateTo('my-meals');
      return;
    }
    render();
    setTimeout(initSwipeGestures, 100);
  };
  if (card) {
    card.classList.add('fly-right');
    setTimeout(doLog, 350);
  } else {
    doLog();
  }
}

function handleHomeSwipeLeft() {
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;
  if (idx >= deck.length) return;
  const card = document.querySelector('.swipe-card[data-active="true"]');
  const advance = () => {
    state.swipeIndex++;
    if (state.swipeIndex >= deck.length) {
      state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(state.swipeMealType) : buildSwipeDeck(state.swipeMealType);
      state.swipeIndex = 0;
    }
    render();
    setTimeout(initSwipeGestures, 100);
  };
  if (card) {
    card.classList.add('fly-left');
    setTimeout(advance, 350);
  } else {
    advance();
  }
}

async function skipMealSlot(meal) {
  await logMealAsSkipped(meal);
  state.homeTab = 'selected';
  state.todaySwipeMealSlot = null;
  showToast(`${capitalize(meal)} skipped`);
}

function detectMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  if (hour >= 21) return 'dinner';
  return 'breakfast';
}

function buildSwipeDeck(mealType) {
  const recipes = state.recipes.filter(r => !r.isDraft && !r.isTip);
  if (recipes.length === 0) return [];

  const scored = recipes.map(recipe => {
    let score = 0;
    const cat = (recipe.category || '').toLowerCase();

    if (mealType === 'breakfast' && cat === 'breakfast') score += 10;
    if (mealType === 'lunch' && (cat === 'lunch' || cat === 'dinner')) score += 10;
    if (mealType === 'dinner' && (cat === 'dinner' || cat === 'lunch')) score += 10;
    if (mealType === 'snack' && (cat === 'snack' || cat === 'dessert')) score += 10;

    const ings = recipeIngList(recipe);
    const expiringNames = state.inventory
      .filter(i => {
        if (!i.expiration_date) return false;
        const d = new Date(i.expiration_date);
        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        return d <= threeDays && d >= new Date();
      })
      .map(i => i.name.toLowerCase());

    ings.forEach(ing => {
      if (expiringNames.some(n => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n))) {
        score += 5;
      }
    });

    const wantToUseNames = state.inventory.filter(i => i.wantToUse).map(i => i.name.toLowerCase());
    ings.forEach(ing => {
      if (wantToUseNames.some(n => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n))) {
        score += 3;
      }
    });

    score += Math.random() * 4;
    return { recipe, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.recipe);
}

function startSwipe(mealType) {
  const mt = mealType || detectMealType();
  state.homeTab = 'swipe';
  state.todaySwipeMealSlot = mt;
  state.swipeMealType = mt;
  state.swipeDate = state.viewingDate;
  state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(mt) : buildSwipeDeck(mt);
  state.swipeIndex = 0;
  state.currentMealSelection = null;
  navigateTo('home');
}

function createMealLog(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return null;

  return {
    id: `meallog_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: 'mealLog',
    date: state.swipeDate || new Date().toISOString().split('T')[0],
    mealType: state.swipeMealType || detectMealType(),
    plannedRecipeId: recipeId,
    plannedAt: Date.now(),
    actualType: null,
    actualRecipeId: null,
    takeoutInfo: null,
    remixInfo: null,
    photoBase64: null,
    loggedAt: null,
    rating: null,
    notes: null
  };
}

async function confirmSwipeSelection(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return;

  state.currentMealSelection = {
    date: state.swipeDate || new Date().toISOString().split('T')[0],
    mealType: state.swipeMealType || detectMealType(),
    recipeId: recipeId,
    selectedAt: Date.now(),
    photoTaken: false,
    logged: false
  };

  const today = state.currentMealSelection.date;
  let plan = state.planData.find(p => p.date === today);
  if (!plan) {
    plan = { id: `plan_${today}`, type: 'plan', date: today, breakfast: [], lunch: [], dinner: [] };
    state.planData.push(plan);
  }

  const mealKey = state.currentMealSelection.mealType;
  if (mealKey !== 'snack') {
    if (!Array.isArray(plan[mealKey])) plan[mealKey] = [];
    if (!plan[mealKey].includes(recipeId)) {
      plan[mealKey].push(recipeId);
    }
    await storage.update(plan);
  }

  const log = createMealLog(recipeId);
  if (log) {
    await storage.create(log);
  }

  navigateTo('swipe-confirm');
}

function handleSwipeRight() {
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;
  if (idx >= deck.length) return;

  const recipe = deck[idx];
  const card = document.querySelector('.swipe-card[data-active="true"]');
  if (card) {
    card.classList.add('fly-right');
    setTimeout(() => {
      confirmSwipeSelection(recipe.__backendId || recipe.id);
    }, 350);
  } else {
    confirmSwipeSelection(recipe.__backendId || recipe.id);
  }
}

function handleSwipeLeft() {
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;
  if (idx >= deck.length) return;

  const reshuffleDeck = () => {
    return state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(state.swipeMealType) : buildSwipeDeck(state.swipeMealType);
  };

  const card = document.querySelector('.swipe-card[data-active="true"]');
  if (card) {
    card.classList.add('fly-left');
    setTimeout(() => {
      state.swipeIndex++;
      if (state.swipeIndex >= deck.length) {
        state.swipeDeck = reshuffleDeck();
        state.swipeIndex = 0;
      }
      render();
    }, 350);
  } else {
    state.swipeIndex++;
    if (state.swipeIndex >= deck.length) {
      state.swipeDeck = reshuffleDeck();
      state.swipeIndex = 0;
    }
    render();
  }
}

function initDateSwipeGestures() {
  setTimeout(() => {
    const zone = document.getElementById('home-date-swipe-zone');
    if (!zone) return;
    if (zone._dateSwipeAttached) return;
    zone._dateSwipeAttached = true;

    let startX = 0, startY = 0, isDragging = false, isHorizontal = null;
    const threshold = 150;

    zone.addEventListener('touchstart', (e) => {
      if (e.target.closest('.swipe-card')) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      isHorizontal = null;
    }, { passive: true });

    zone.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (isHorizontal === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      }
    }, { passive: true });

    zone.addEventListener('touchend', (e) => {
      if (!isDragging || !isHorizontal) { isDragging = false; return; }
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > threshold) {
        goToPreviousDay();
      } else if (dx < -threshold) {
        goToNextDay();
      }
    });
  }, 100);
}

function initSwipeGestures() {
  setTimeout(() => {
    const card = document.querySelector('.swipe-card[data-active="true"]');
    if (!card) return;

    let startX = 0, startY = 0, currentX = 0, isDragging = false;
    const threshold = 100;

    const onStart = (x, y) => {
      startX = x;
      startY = y;
      currentX = 0;
      isDragging = true;
      card.classList.add('dragging');
      card.style.transition = 'none';
    };

    const onMove = (x) => {
      if (!isDragging) return;
      currentX = x - startX;
      const rotation = currentX * 0.08;
      card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

      const likeOverlay = card.querySelector('.swipe-overlay.like');
      const nopeOverlay = card.querySelector('.swipe-overlay.nope');
      if (likeOverlay) likeOverlay.style.opacity = Math.min(currentX / threshold, 1);
      if (nopeOverlay) nopeOverlay.style.opacity = Math.min(-currentX / threshold, 1);
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('dragging');

      if (currentX > threshold) {
        state.currentView === 'home' ? handleHomeSwipeRight() : handleSwipeRight();
      } else if (currentX < -threshold) {
        state.currentView === 'home' ? handleHomeSwipeLeft() : handleSwipeLeft();
      } else {
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = 'translateX(0) rotate(0deg)';
        const likeOverlay = card.querySelector('.swipe-overlay.like');
        const nopeOverlay = card.querySelector('.swipe-overlay.nope');
        if (likeOverlay) likeOverlay.style.opacity = 0;
        if (nopeOverlay) nopeOverlay.style.opacity = 0;
      }
    };

    card.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      onMove(t.clientX);
    }, { passive: true });

    card.addEventListener('touchend', onEnd);

    card.addEventListener('mousedown', (e) => {
      onStart(e.clientX, e.clientY);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      onMove(e.clientX);
    });

    document.addEventListener('mouseup', onEnd);
  }, 50);
}

function renderSwipe() {
  const mealType = state.swipeMealType || detectMealType();
  const mealLabel = capitalize(mealType);
  const deck = state.swipeDeck;
  const idx = state.swipeIndex;

  if (!deck || deck.length === 0) {
    return `
      <div style="background: ${CONFIG.background_color}; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🍽️</div>
        <div style="color: ${CONFIG.text_color}; font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Recipes Yet</div>
        <div style="color: ${CONFIG.text_muted}; font-size: 14px; margin-bottom: 24px; text-align: center;">Add some recipes first, then come back to swipe!</div>
        <button onclick="navigateTo('recipes')" style="background: ${CONFIG.primary_action_color}; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
          Go to Recipes
        </button>
      </div>
    `;
  }

  const recipe = deck[idx];
  const img = recipeThumb(recipe);
  const ings = recipeIngList(recipe);
  const ingCount = ings.length;
  const category = recipe.category || 'Other';
  const nextRecipe = idx + 1 < deck.length ? deck[idx + 1] : null;
  const nextImg = nextRecipe ? recipeThumb(nextRecipe) : '';

  return `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 80px;">
      <div style="padding: 16px 20px 8px; display: flex; align-items: center; justify-content: space-between;">
        <div style="width: 36px;"></div>
        <div style="text-align: center;">
          <div style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.6);">What's for</div>
          <div style="font-size: 20px; font-weight: 600; color: #ffffff;">${mealLabel}</div>
        </div>
        <button onclick="navigateTo('swipe-setup')" style="background: none; border: none; cursor: pointer; color: ${CONFIG.text_muted}; padding: 6px;" title="Swipe Settings">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${['breakfast', 'lunch', 'dinner', 'snack'].map(mt => {
          const active = mt === mealType;
          return `
            <button onclick="state.swipeMealType='${mt}'; state.swipeDeck=buildSwipeDeckFiltered('${mt}'); state.swipeIndex=0; render(); setTimeout(initSwipeGestures, 100);"
              style="padding: 6px 12px; border-radius: 20px; border: 1px solid ${active ? 'rgba(232, 93, 93, 0.4)' : 'rgba(255,255,255,0.15)'}; background: ${active ? 'rgba(232, 93, 93, 0.15)' : 'transparent'}; color: ${active ? '#e85d5d' : 'rgba(255,255,255,0.6)'}; font-size: 13px; font-weight: ${active ? '600' : '400'}; cursor: pointer; transition: all 0.2s ease;">
              ${capitalize(mt)}
            </button>
          `;
        }).join('')}
      </div>

      <div class="swipe-container">
        ${nextRecipe ? `
          <div style="position: absolute; width: 280px; max-width: 80vw; height: auto; background: ${CONFIG.surface_color}; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); overflow: hidden; transform: scale(0.95) translateY(10px);">
            <div style="height: 240px; background: rgba(255,255,255,0.05);">
              ${nextImg ? `<img loading="lazy" src="${esc(nextImg)}" style="width:100%; height:100%; object-fit:cover; opacity:0.6;" />` : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:48px;">🍽️</div>`}
            </div>
            <div style="padding: 16px;">
              <div style="font-size: 16px; font-weight: 600; color: ${CONFIG.text_muted};">${esc(nextRecipe.title)}</div>
            </div>
          </div>
        ` : ''}

        <div class="swipe-card entering" data-active="true">
          <div class="swipe-overlay like">Cook!</div>
          <div class="swipe-overlay nope">Skip</div>
          ${img ? `<img loading="lazy" class="card-image" src="${esc(img)}" alt="${esc(recipe.title)}" />` : `<div class="card-image-placeholder">🍽️</div>`}
          <div class="card-body">
            <div class="card-title">${esc(recipe.title)}</div>
            <div class="card-meta">
              <span>${esc(category)}</span>
              ${ingCount > 0 ? `<span>${ingCount} ingredients</span>` : ''}
              ${recipe.timesCooked ? `<span>Cooked ${recipe.timesCooked}x</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 24px; padding: 16px 0;">
        <button onclick="handleSwipeLeft()" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${CONFIG.danger_color}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          ✕
        </button>
        <button onclick="openRecipeView('${recipe.__backendId || recipe.id}'); state.viewingFromSwipe = true;" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${CONFIG.text_muted}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          👁️
        </button>
        <button onclick="handleSwipeRight()" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${CONFIG.success_color}; background: ${CONFIG.surface_elevated}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          ♥
        </button>
      </div>

      <div class="swipe-hint-arrows">
        <span class="swipe-hint-arrow" style="color: ${CONFIG.danger_color};">← Skip</span>
        <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro};">${idx + 1} / ${deck.length}</span>
        <span class="swipe-hint-arrow" style="color: ${CONFIG.success_color};">Cook! →</span>
      </div>
    </div>
  `;
}

function renderSwipeConfirm() {
  const sel = state.currentMealSelection;
  if (!sel) return renderSwipe();

  const recipe = getRecipeById(sel.recipeId);
  if (!recipe) return renderSwipe();

  const img = recipeThumb(recipe);
  const mealEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' }[sel.mealType] || '🍽️';
  const mealLabel = capitalize(sel.mealType);
  const ings = recipeIngList(recipe);

  return `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding: 20px; padding-bottom: 80px;">
      <div class="max-w-md mx-auto confirm-pop">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
          <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color};">Great Choice!</div>
          <div style="color: ${CONFIG.text_muted}; font-size: 14px; margin-top: 4px;">Added to your ${mealLabel} plan</div>
        </div>

        <div style="background: ${CONFIG.surface_color}; border-radius: 20px; overflow: hidden; box-shadow: ${CONFIG.shadow}; margin-bottom: 20px;">
          ${img ? `<img loading="lazy" src="${esc(img)}" style="width: 100%; height: 200px; object-fit: cover;" />` : `<div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); font-size: 64px;">🍽️</div>`}
          <div style="padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">${mealEmoji}</span>
              <span style="background: ${CONFIG.primary_action_color}; color: white; padding: 2px 10px; border-radius: 12px; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight};">${mealLabel}</span>
            </div>
            <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin-bottom: 8px;">${esc(recipe.title)}</div>
            ${ings.length > 0 ? `
              <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">
                ${ings.slice(0, 5).map(i => esc(i.name)).join(', ')}${ings.length > 5 ? ` +${ings.length - 5} more` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button onclick="openRecipeView('${recipe.__backendId || recipe.id}')" style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
            View Full Recipe
          </button>
          <button onclick="startSwipe('${sel.mealType}')" style="width: 100%; padding: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer;">
            Pick Another
          </button>
          <button onclick="navigateTo('swipe')" style="width: 100%; padding: 14px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">
            Done
          </button>
        </div>
      </div>
    </div>
  `;
}

function showSwipeMealPicker() {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 class="text-lg font-bold mb-4">Choose Meal Type</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${['breakfast', 'lunch', 'dinner', 'snack'].map(mt => {
          const e = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' }[mt];
          return `
            <button onclick="closeModal(); startSwipe('${mt}');" style="padding: 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 16px;">
              ${e} ${capitalize(mt)}
            </button>
          `;
        }).join('')}
      </div>
      <button onclick="closeModal()" class="mt-4 w-full px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button>
    </div>
  `);
}

// ============================================================
// SWIPE SETUP & CONFIGURATION
// ============================================================
let recipesPageSearchTimeout = null;
let swipeSetupCurrentPage = 0;

function getSmartDefaults() {
  const recipes = state.recipes.filter(r => !r.isDraft && !r.isTip);
  const defaults = { breakfast: [], lunch: [], dinner: [], snack: [] };
  const breakfastKeywords = ['breakfast', 'pancake', 'waffle', 'omelette', 'omelet', 'eggs', 'cereal', 'toast', 'smoothie', 'muffin', 'bacon', 'french toast', 'granola'];
  const snackKeywords = ['snack', 'appetizer', 'dip', 'chips', 'cookie', 'brownie', 'trail mix', 'popcorn', 'bar', 'bites'];
  const dinnerKeywords = ['dinner', 'steak', 'roast', 'casserole', 'stew', 'chili', 'lasagna', 'pot roast'];

  recipes.forEach(r => {
    const id = r.__backendId || r.id;
    const cat = (r.category || '').toLowerCase();
    const title = (r.title || '').toLowerCase();

    if (cat === 'breakfast' || breakfastKeywords.some(k => title.includes(k))) defaults.breakfast.push(id);
    if (cat === 'snack' || cat === 'dessert' || snackKeywords.some(k => title.includes(k))) defaults.snack.push(id);
    if (cat === 'dinner' || dinnerKeywords.some(k => title.includes(k))) defaults.dinner.push(id);
    if (cat === 'lunch' || cat === 'dinner' || cat === 'other') defaults.lunch.push(id);
  });

  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
    if (defaults[meal].length === 0) {
      defaults[meal] = recipes.map(r => r.__backendId || r.id);
    }
  });

  return defaults;
}

function toggleSwipeSetupRecipe(mealType, recipeId) {
  const list = state.swipeSettings[mealType];
  const idx = list.indexOf(recipeId);
  if (idx > -1) list.splice(idx, 1);
  else list.push(recipeId);
  renderSwipeSetupSection(mealType);
}

function selectAllSwipeRecipes(mealType) {
  const recipes = getFilteredSetupRecipes();
  state.swipeSettings[mealType] = recipes.map(r => r.__backendId || r.id);
  renderSwipeSetupSection(mealType);
}

function deselectAllSwipeRecipes(mealType) {
  state.swipeSettings[mealType] = [];
  renderSwipeSetupSection(mealType);
}

function getRemixRecipes() {
  const remixes = [];
  const seen = new Set();
  for (const [dateStr, dayData] of Object.entries(state.mealDays || {})) {
    for (const [mealType, meal] of Object.entries(dayData.meals || {})) {
      if (meal.actualType === 'remix' && meal.remixInfo && meal.remixInfo.baseRecipeId) {
        const key = `${meal.remixInfo.baseRecipeId}__${(meal.remixInfo.modifications || '').trim().toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const baseRecipe = getRecipeById(meal.remixInfo.baseRecipeId);
        if (!baseRecipe) continue;
        const remixId = `remix_${remixes.length}_${meal.remixInfo.baseRecipeId}`;
        remixes.push({
          ...baseRecipe,
          id: remixId,
          __backendId: remixId,
          title: baseRecipe.title + ' (Remix)',
          _isRemix: true,
          _remixModifications: meal.remixInfo.modifications,
          _baseRecipeId: meal.remixInfo.baseRecipeId
        });
      }
    }
  }
  return remixes;
}

function getFilteredSetupRecipes() {
  let recipes = state.recipes.filter(r => !r.isDraft && !r.isTip);
  recipes = [...recipes, ...getRemixRecipes()];
  const term = normalizeString(state.swipeSetupSearchTerm);
  if (term) {
    recipes = recipes.filter(r => (r.title || '').toLowerCase().includes(term));
  }
  const filter = state.swipeSetupFilter || 'all';
  if (filter === 'favorites') {
    recipes = recipes.filter(r => r.isFavorite);
  } else if (filter === 'remixed') {
    recipes = recipes.filter(r => r._isRemix);
  } else if (filter === 'quick') {
    recipes = recipes.filter(r => {
      const time = parseInt(r.prepTime) || 0 + parseInt(r.cookTime) || 0;
      return time > 0 && time <= 30;
    });
  } else if (filter === 'have-ingredients') {
    const invNames = state.inventory.map(i => i.name.toLowerCase());
    recipes = recipes.filter(r => {
      const ings = recipeIngList(r);
      if (ings.length === 0) return false;
      const matched = ings.filter(i => invNames.some(n => n.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(n)));
      return matched.length / ings.length >= 0.5;
    });
  }
  return recipes;
}

function renderSwipeSetupSection(mealType) {
  const container = document.getElementById(`swipe-setup-${mealType}`);
  if (!container) return;
  const recipes = getFilteredSetupRecipes();
  const selected = state.swipeSettings[mealType] || [];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${selected.length} selected</span>
      <div style="display: flex; gap: 12px;">
        <button onclick="selectAllSwipeRecipes('${mealType}')" style="background: none; border: none; color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Select all</button>
        <button onclick="deselectAllSwipeRecipes('${mealType}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Clear</button>
      </div>
    </div>
    <div class="recipe-select-grid">
      ${recipes.map(r => {
        const id = r.__backendId || r.id;
        const isSelected = selected.includes(id);
        const img = recipeThumb(r);
        return `
          <div onclick="toggleSwipeSetupRecipe('${mealType}', '${id}')" style="cursor: pointer;">
            <div class="rs-thumb" style="border: 2px solid ${isSelected ? CONFIG.primary_action_color : 'transparent'}; transition: border-color 0.2s; background: ${CONFIG.surface_elevated};">
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <svg width="22" height="22" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-12.75H6A2.25 2.25 0 003.75 6v12a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75"/></svg>
              </div>
              ${img ? `<img loading="lazy" src="${esc(img)}" style="position: relative;" onerror="this.style.display='none'" />` : ''}
              ${isSelected ? `<div style="position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; background: ${CONFIG.primary_action_color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>` : ''}
              ${r._isRemix ? `<div style="position: absolute; top: 3px; left: 3px; background: rgba(232,93,93,0.9); color: white; font-size: 7px; font-weight: 700; padding: 1px 3px; border-radius: 3px; letter-spacing: 0.3px; text-transform: uppercase;">Remix</div>` : ''}
            </div>
            <div class="rs-name">${esc(r.title)}</div>
          </div>
        `;
      }).join('')}
      ${recipes.length === 0 ? `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">No recipes match your filters</div>` : ''}
    </div>
  `;
}

function toggleSwipeSetupSection(mealType) {
  state.swipeSetupExpandedSection = state.swipeSetupExpandedSection === mealType ? null : mealType;
  render();
}

function renderSwipeSetup() {
  const recipes = state.recipes.filter(r => !r.isDraft && !r.isTip);

  if (recipes.length === 0) {
    return `
      <div style="background: ${CONFIG.background_color}; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
        <div style="width: 80px; height: 80px; background: ${CONFIG.surface_color}; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <svg width="40" height="40" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
        </div>
        <div style="color: ${CONFIG.text_color}; font-size: 20px; font-weight: 700; margin-bottom: 8px;">You need recipes first!</div>
        <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; text-align: center; margin-bottom: 32px; max-width: 280px;">Add some recipes, then come back to set up your swipe options.</div>
        <button onclick="navigateTo('recipes')" style="background: ${CONFIG.primary_action_color}; color: white; border: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
          Add Recipes
        </button>
      </div>
    `;
  }

  const hasAnySelections = ['breakfast', 'lunch', 'dinner', 'snack'].some(m => state.swipeSettings[m].length > 0);
  let showDefaults = false;
  if (!hasAnySelections && !state.swipeSettings.setupCompleted) {
    const defaults = getSmartDefaults();
    state.swipeSettings.breakfast = defaults.breakfast;
    state.swipeSettings.lunch = defaults.lunch;
    state.swipeSettings.dinner = defaults.dinner;
    state.swipeSettings.snack = defaults.snack;
    showDefaults = true;
  }

  const mealSections = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { key: 'lunch', label: 'Lunch', emoji: '☀️' },
    { key: 'dinner', label: 'Dinner', emoji: '🌙' },
    { key: 'snack', label: 'Snacks', emoji: '🍿' }
  ];

  return `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 100px;">
      <div style="padding: ${CONFIG.space_md} 8px 8px;">
        ${state.swipeSettings.setupCompleted ? `
          <button onclick="navigateTo('swipe')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: 20px; cursor: pointer; margin-bottom: 4px;">←</button>
        ` : ''}
        <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; letter-spacing: ${CONFIG.type_title_tracking};">
          Set Up Your Meals
        </div>
        <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; margin-top: 2px;">
          Choose which recipes appear when you swipe
        </div>
        ${showDefaults ? `
          <div style="background: rgba(232,93,93,0.1); border-radius: 10px; padding: 8px 12px; margin-top: 8px;">
            <span style="color: ${CONFIG.primary_action_color}; font-size: ${CONFIG.type_caption}; font-weight: 500;">We picked some defaults. Adjust as needed.</span>
          </div>
        ` : ''}
      </div>

      <div style="padding: 0 8px;">
        <div style="margin-bottom: 8px;">
          <input type="text" placeholder="Search recipes..."
            value="${esc(state.swipeSetupSearchTerm || '')}"
            oninput="state.swipeSetupSearchTerm = this.value; if(state.swipeSetupExpandedSection) renderSwipeSetupSection(state.swipeSetupExpandedSection);"
            style="width: 100%; padding: 10px 12px; border-radius: 10px; font-size: ${CONFIG.type_body}; box-sizing: border-box; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: none;" />
          <div style="display: flex; gap: 6px; margin-top: 6px; overflow-x: auto;">
            ${[
              { key: 'all', label: 'All' },
              { key: 'favorites', label: 'Favorites' },
              { key: 'remixed', label: 'Remixed' },
              { key: 'quick', label: 'Quick <30min' },
              { key: 'have-ingredients', label: 'Have Ingredients' }
            ].map(f => `
              <button onclick="state.swipeSetupFilter = '${f.key}'; if(state.swipeSetupExpandedSection) renderSwipeSetupSection(state.swipeSetupExpandedSection); else render();"
                style="padding: 6px 14px; border-radius: 20px; border: 1px solid ${state.swipeSetupFilter === f.key ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; background: ${state.swipeSetupFilter === f.key ? CONFIG.primary_action_color : 'transparent'}; color: ${state.swipeSetupFilter === f.key ? 'white' : CONFIG.text_muted}; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; flex-shrink: 0;">
                ${f.label}
              </button>
            `).join('')}
          </div>
        </div>

        ${mealSections.map(section => {
          const count = state.swipeSettings[section.key].length;
          const isExpanded = state.swipeSetupExpandedSection === section.key;

          return `
            <div style="margin-bottom: 8px;">
              <button onclick="toggleSwipeSetupSection('${section.key}')"
                style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: ${CONFIG.surface_color}; border-radius: ${isExpanded ? '12px 12px 0 0' : '12px'}; border: none; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">${section.emoji}</span>
                  <span style="color: ${CONFIG.text_color}; font-size: 15px; font-weight: 600;">${section.label}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: ${count > 0 ? CONFIG.text_muted : CONFIG.warning_color}; font-size: 13px;">${count} recipe${count !== 1 ? 's' : ''}</span>
                  <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="2" viewBox="0 0 24 24" style="transform: rotate(${isExpanded ? '180' : '0'}deg); transition: transform 0.2s;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                  </svg>
                </div>
              </button>
              ${isExpanded ? `
                <div id="swipe-setup-${section.key}" style="background: ${CONFIG.surface_color}; padding: 6px 8px 8px; border-radius: 0 0 12px 12px;">
                </div>
              ` : ''}
              ${count === 0 && !isExpanded ? `
                <div style="padding: 4px 16px; color: ${CONFIG.warning_color}; font-size: 12px;">No recipes selected for ${section.label.toLowerCase()}</div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, ${CONFIG.background_color} 30%); z-index: 30;">
        <button onclick="completeSwipeSetup()"
          style="width: 100%; padding: 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 14px; font-size: 17px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(232,93,93,0.3);">
          ${state.swipeSettings.setupCompleted ? 'Save Changes' : 'Done'}
        </button>
      </div>
    </div>
  `;
}

async function completeSwipeSetup() {
  try {
    state.swipeSettings.setupCompleted = true;
    // Save to localStorage immediately as primary persistence
    saveToLS('swipeSettings', state.swipeSettings);
    // Also try Supabase sync (non-blocking)
    saveSwipeSettings().catch(e => console.warn('Supabase swipe settings sync failed:', e));
    showToast('Swipe settings saved!', 'success');
    startSwipe();
  } catch (e) {
    console.error('completeSwipeSetup error:', e);
    // Even if something fails, ensure settings are saved and we navigate
    saveToLS('swipeSettings', state.swipeSettings);
    showToast('Settings saved!', 'success');
    startSwipe();
  }
}

function buildSwipeDeckFiltered(mealType) {
  const allowedIds = state.swipeSettings[mealType] || [];
  if (allowedIds.length === 0) return buildSwipeDeck(mealType);

  const resolvedIds = new Set();
  allowedIds.forEach(id => {
    if (id.startsWith('remix_')) {
      const baseId = id.replace(/^remix_\d+_/, '');
      if (baseId) resolvedIds.add(baseId);
    } else {
      resolvedIds.add(id);
    }
  });

  const recipes = state.recipes.filter(r => {
    if (r.isDraft || r.isTip) return false;
    const id = r.__backendId || r.id;
    return resolvedIds.has(id);
  });

  if (recipes.length === 0) return buildSwipeDeck(mealType);

  const scored = recipes.map(recipe => {
    let score = 0;
    const ings = recipeIngList(recipe);
    const expiringNames = state.inventory
      .filter(i => {
        if (!i.expiration_date) return false;
        const d = new Date(i.expiration_date);
        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        return d <= threeDays && d >= new Date();
      })
      .map(i => i.name.toLowerCase());

    ings.forEach(ing => {
      if (expiringNames.some(n => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n))) {
        score += 5;
      }
    });

    const wantToUseNames = state.inventory.filter(i => i.wantToUse).map(i => i.name.toLowerCase());
    ings.forEach(ing => {
      if (wantToUseNames.some(n => n.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(n))) {
        score += 3;
      }
    });

    score += Math.random() * 4;
    return { recipe, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.recipe);
}

// ============================================================
// SWIPE HOME
// ============================================================
function renderSwipeHome() {
  if (!state.swipeSettings.setupCompleted) {
    return renderSwipeSetup();
  }
  if (hasSelectedMealForCurrentSlot()) {
    return renderAlreadySelected();
  }
  return renderSwipeCards_legacy();
}

function getMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 21) return 'dinner';
  if (hour >= 21) return 'dinner';
  return 'breakfast';
}

function hasSelectedMealForCurrentSlot() {
  if (!state.currentMealSelection) return false;
  const today = new Date().toISOString().split('T')[0];
  const currentMeal = getMealType();
  return state.currentMealSelection.date === today &&
         state.currentMealSelection.mealType === currentMeal;
}

function hasPendingMealToLog() {
  if (!state.currentMealSelection) return false;
  const today = new Date().toISOString().split('T')[0];
  return state.currentMealSelection.date === today &&
         state.currentMealSelection.status === 'selected' &&
         !state.currentMealSelection.loggedAt;
}

function renderAlreadySelected() {
  const sel = state.currentMealSelection;
  if (!sel) return renderSwipeCards_legacy();

  const recipe = getRecipeById(sel.recipeId);
  if (!recipe) return renderSwipeCards_legacy();

  const img = recipeThumb(recipe);
  const mealLabel = capitalize(sel.mealType);

  return `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding: 20px; padding-bottom: 100px;">
      <div style="max-width: 400px; margin: 0 auto;">
        <div style="text-align: center; padding-top: ${CONFIG.space_2xl}; margin-bottom: ${CONFIG.space_lg};">
          <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; margin-bottom: ${CONFIG.space_xs};">You picked for ${mealLabel}</div>
          <div style="color: ${CONFIG.text_color}; font-size: 22px; font-weight: 700;">${esc(recipe.title)}</div>
        </div>

        <div style="border-radius: 20px; overflow: hidden; margin-bottom: ${CONFIG.space_lg}; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
          ${img ? `<img loading="lazy" src="${esc(img)}" style="width: 100%; height: 280px; object-fit: cover;" />` : `<div style="height: 280px; display: flex; align-items: center; justify-content: center; background: ${CONFIG.surface_color}; font-size: 72px;">🍽️</div>`}
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: ${CONFIG.space_md};">
          <button onclick="state.currentMealSelection = null; startSwipe('${sel.mealType}')"
            style="flex: 1; padding: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: none; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer;">
            Change my mind
          </button>
          <button onclick="openRecipeView('${recipe.__backendId || recipe.id}')"
            style="flex: 1; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
            View Recipe
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderSwipeCards_legacy() {
  const mealType = state.swipeMealType || getMealType();
  if (!state.swipeMealType) state.swipeMealType = mealType;
  if (!state.swipeDeck || state.swipeDeck.length === 0) {
    state.swipeDate = new Date().toISOString().split('T')[0];
    state.swipeDeck = buildSwipeDeckFiltered(state.swipeMealType);
    state.swipeIndex = 0;
  }
  return renderSwipe();
}

// ============================================================
// EXTERNAL MEAL PICKER
// ============================================================
function renderExternalMealPicker() {
  const types = state.externalMealTypes.map(t =>
    typeof t === 'string' ? { name: t, emoji: '🍽️' } : t
  );

  return `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6 mobile-stack gap-3">
        <h2 style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; letter-spacing: ${CONFIG.type_title_tracking}; font-family: ${CONFIG.font_family}, sans-serif;" class="font-bold">
          External Meal for ${formatDateDisplay(state.selectedDayForRecipe)} - ${state.selectedMealForRecipe}
        </h2>
        <button type="button" onclick="navigateTo('home'); state.selectedDayForRecipe=null; state.selectedMealForRecipe=null;"
          style="background: ${CONFIG.secondary_action_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px;"
          class="px-4 py-2 rounded button-hover">
          Cancel
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-3">
        ${types.map(type => `
          <button type="button"
                  onclick="handleExternalMealSelect('${esc(type.name)}')"
                  style="background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size * 1.1}px;"
                  class="p-6 rounded card-hover text-left flex items-center gap-3">
            <span style="font-size: 2rem;">${type.emoji || '🍽️'}</span>
            <span class="font-semibold">${esc(type.name)}</span>
          </button>
        `).join('')}
      </div>

      <div class="mt-6">
        <button type="button" onclick="showManageExternalMealTypes()"
          style="background: ${CONFIG.primary_action_color}; color: ${CONFIG.text_color}; font-family: ${CONFIG.font_family}, sans-serif; font-size: ${CONFIG.font_size}px;"
          class="px-4 py-2 rounded button-hover">
          ⚙️ Manage External Meal Types
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// VIEW RENDERERS & RENDER / INIT
// ============================================================
const VIEW_RENDERERS = {
  'home': renderHome,
  'swipe': renderSwipeHome,
  'swipe-setup': renderSwipeSetup,
  'swipe-confirm': renderSwipeConfirm,
  'external-meal-picker': renderExternalMealPicker
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (state.currentView === 'ingredients') {
    state.pantryTab = 'ingredients';
    state.currentView = 'inventory';
  }

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  if (renderer) {
    content = renderer();
  } else {
    content = renderHome();
    state.currentView = 'home';
  }

  app.innerHTML = `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: ${state.currentView !== 'swipe-setup' ? '56px' : '0'};">
      ${renderNav()}
      ${content}
      ${typeof renderClaudeReceiptModal === 'function' ? renderClaudeReceiptModal() : ''}
      ${typeof renderReceiptScannerModal === 'function' ? renderReceiptScannerModal() : ''}
      ${typeof renderChefChatButton === 'function' ? renderChefChatButton() : ''}
      ${state.currentView === 'swipe-setup' ? '' : renderBottomNav()}
    </div>
  `;

  if (typeof renderChefChat === 'function') renderChefChat();

  if (state.currentView === 'swipe' || (state.currentView === 'home' && state.homeTab === 'swipe')) {
    initSwipeGestures();
  }
  if (state.currentView === 'home' || state.currentView === 'swipe') {
    initDateSwipeGestures();
  }
  if (state.currentView === 'swipe-setup' && state.swipeSetupExpandedSection) {
    setTimeout(() => renderSwipeSetupSection(state.swipeSetupExpandedSection), 0);
  }
}

function init() {
  loadAllState();
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView) {
    sessionStorage.removeItem('yummy_target_view');
    state.currentView = targetView;
  } else {
    state.currentView = 'home';
  }

  // Restore swap-for-slot state from cross-page navigation (My Meals → Home swipe)
  const swipeSlotData = sessionStorage.getItem('yummy_swipe_slot');
  if (swipeSlotData) {
    try {
      const slot = JSON.parse(swipeSlotData);
      sessionStorage.removeItem('yummy_swipe_slot');
      state.viewingDate = slot.dateStr;
      state.homeTab = 'swipe';
      state.swipeMealType = slot.mealType;
      state.todaySwipeMealSlot = slot.mealType;
      if (slot.swapLogId) {
        state._swapTargetLogId = slot.swapLogId;
        state._swapMealType = slot.mealType;
        state._swapDateStr = slot.dateStr;
      }
      state._returnToFoodLog = !!slot.returnToFoodLog;
      state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(slot.mealType) : buildSwipeDeck(slot.mealType);
      state.swipeIndex = 0;
    } catch (e) {
      console.error('Failed to restore swipe slot state:', e);
      sessionStorage.removeItem('yummy_swipe_slot');
    }
  }

  checkExpirationNotifications();
  setInterval(() => {
    if (state.currentView === 'home' && isToday(state.viewingDate)) {
      const changed = checkMealAutoTransitions();
      if (changed) render();
    }
  }, 60000);
  setupKeyboardShortcuts();
  render();
}

// ============================================================
// MISSING FUNCTIONS (extracted from index.original.html)
// ============================================================

async function askHomeClaudeQuestion() {
  const question = state.homeClaudeQuestion || document.getElementById('homeClaudeQuestion')?.value.trim();

  if (!question) {
    showError('Please enter a question');
    return;
  }

  // Show loading
  const loadingEl = document.getElementById('homeClaudeLoading');
  const responseEl = document.getElementById('homeClaudeResponse');
  if (loadingEl) loadingEl.style.display = 'block';
  if (responseEl) responseEl.style.display = 'none';

  try {
    const response = await fetch(CHEF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'You are Chef Claude, a helpful cooking assistant. Give concise, practical answers. Keep responses under 150 words.',
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await response.json();
    const responseText = data.content?.[0]?.text || data.error || 'No response received';

    state.homeClaudeResponse = responseText;
    state.homeClaudeQuestion = question;

    // Update UI
    if (loadingEl) loadingEl.style.display = 'none';
    if (responseEl) {
      responseEl.style.display = 'block';
      document.getElementById('homeClaudeResponseText').innerHTML = formatChefMessage(responseText);
    }

  } catch (error) {
    console.error('Claude error:', error);
    showError('Failed to get response');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function clearHomeClaudeResponse() {
  state.homeClaudeResponse = null;
  state.homeClaudeQuestion = '';
  const responseEl = document.getElementById('homeClaudeResponse');
  const inputEl = document.getElementById('homeClaudeQuestion');
  if (responseEl) responseEl.style.display = 'none';
  if (inputEl) inputEl.value = '';
}

function retryHomeClaudeQuestion() {
  // Keep the question, clear response, and re-ask
  state.homeClaudeResponse = null;
  const responseEl = document.getElementById('homeClaudeResponse');
  if (responseEl) responseEl.style.display = 'none';
  askHomeClaudeQuestion();
}

function showQuickLogOptions(meal) {
  const label = capitalize(meal);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">Log ${label}</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="closeModal(); showDifferentRecipePicker('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 15px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
          Pick from my recipes
        </button>
        <button onclick="closeModal(); showTakeoutLogger('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 15px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
          Takeout
        </button>
        <button onclick="closeModal(); showCustomMealForm('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 15px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
          Remix / Custom meal
        </button>
        <button onclick="closeModal(); skipMealLogging('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_muted}; cursor: pointer; text-align: left; font-size: 15px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"/></svg>
          I skipped this meal
        </button>
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function showQuickAddGrocery() {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">➕ Quick Add to Grocery</h2>

      <div style="margin-bottom: 16px;">
        <input type="text" id="quickGroceryItem" placeholder="Enter item name..."
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};"
          onkeydown="if(event.key === 'Enter') addQuickGroceryItem();" autofocus />
      </div>

      <div style="margin-bottom: 16px;">
        <div style="color: ${CONFIG.text_muted}; font-size: 12px; margin-bottom: 8px;">Common items:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${['Milk', 'Eggs', 'Bread', 'Butter', 'Chicken', 'Rice', 'Onions', 'Garlic'].map(item => `
            <button onclick="document.getElementById('quickGroceryItem').value = '${item}'; addQuickGroceryItem();"
              style="padding: 6px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color}; cursor: pointer;">
              ${item}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
          Cancel
        </button>
        <button onclick="addQuickGroceryItem()" style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Add Item
        </button>
      </div>
    </div>
  `);
}

async function addQuickGroceryItem() {
  const input = document.getElementById('quickGroceryItem');
  const itemName = input?.value.trim();

  if (!itemName) {
    showError('Please enter an item name');
    return;
  }

  // Add to grocery list
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

init();
