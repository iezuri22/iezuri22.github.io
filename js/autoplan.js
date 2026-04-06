/**
 * AutoPlan - Intelligent meal planning system for PotLuck
 * Generates 2-day meal suggestions with smart prioritization and user controls
 */

// ============================================================================
// HELPERS: Recipe Analysis
// ============================================================================

/**
 * Detect if a recipe is suited for air fryer cooking
 * Checks tags, title, and instructions for air fryer references
 */
function isAirFryerRecipe(recipe) {
  if (!recipe) return false;

  // Check tags (can be array or string)
  let tags = recipe.tags || [];
  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.toLowerCase().trim());
  }
  const hasAirFryTag = tags.some(tag =>
    tag.includes('air fry') || tag.includes('air fryer') || tag.includes('airfryer')
  );
  if (hasAirFryTag) return true;

  // Check title
  if (recipe.title && /air fr(y|er)/i.test(recipe.title)) return true;

  // Check instructions
  if (recipe.instructions && /air fr(y|er)/i.test(recipe.instructions)) return true;

  return false;
}

/**
 * Extract the dominant protein from a recipe's ingredients
 * Returns the protein name (lowercase) or null
 */
function getRecipeProtein(recipe) {
  if (!recipe || !recipe.ingredientsRows) return null;

  const proteins = ['beef', 'chicken', 'pork', 'lamb', 'shrimp', 'salmon', 'fish', 'turkey', 'tofu'];

  for (const row of recipe.ingredientsRows) {
    const ingredientName = (row.name || '').toLowerCase();
    for (const protein of proteins) {
      if (ingredientName.includes(protein)) {
        return protein;
      }
    }
  }

  return null;
}

/**
 * Parse cook time string into minutes for comparison
 * Handles formats like "30 min", "1 hr 15 min", "45"
 */
function parseCookTime(cookTimeStr) {
  if (!cookTimeStr) return Infinity;

  const str = String(cookTimeStr).toLowerCase();
  let minutes = 0;

  const hours = str.match(/(\d+)\s*hr/);
  if (hours) minutes += parseInt(hours[1]) * 60;

  const mins = str.match(/(\d+)\s*min/);
  if (mins) minutes += parseInt(mins[1]);

  // If just a number, assume minutes
  if (minutes === 0) {
    const numMatch = str.match(/^\d+/);
    if (numMatch) minutes = parseInt(numMatch[0]);
  }

  return minutes;
}

/**
 * Get the number of days until an ingredient expires
 * Returns -1 if no expiration, or number of days remaining
 */
function daysUntilExpiration(ingredient) {
  if (!ingredient.expiration_date) return -1;

  const today = new Date(getToday());
  const expiry = new Date(ingredient.expiration_date);
  const diffMs = expiry - today;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return days;
}

/**
 * Check if a recipe uses any soon-to-expire ingredients
 * Returns true if any ingredient expires within 3 days
 */
function usesExpiringIngredients(recipe) {
  if (!state.inventory) return false;
  if (!recipe || !recipe.ingredientsRows) return false;

  const recipeIngrNames = recipe.ingredientsRows.map(r =>
    (r.name || '').toLowerCase().trim()
  );

  for (const invItem of state.inventory) {
    const invName = (invItem.name || '').toLowerCase().trim();
    const expiring = daysUntilExpiration(invItem);

    if (expiring >= 0 && expiring <= 3 && expiring > 0) {
      // Check if this inventory item matches any recipe ingredient
      if (recipeIngrNames.some(rname => rname.includes(invName) || invName.includes(rname))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Load or generate the auto-plan from localStorage
 * Ensures fresh plan at midnight
 */
function getAutoPlan() {
  const stored = localStorage.getItem('yummy_autoplan');
  const today = getToday();

  if (stored) {
    try {
      const plan = JSON.parse(stored);
      // Check if plan is still valid for today
      if (plan.generatedAt && plan.days && plan.days[today]) {
        return plan;
      }
    } catch (e) {
      console.error('Failed to parse stored auto-plan:', e);
    }
  }

  // Generate new plan
  return generateAutoPlan();
}

/**
 * Check if recipe is suitable based on effort, time, and day of week
 */
function isRecipeSuitableForDay(recipe) {
  // Must be categorized
  if (!recipe.category) return false;
  // Skip drafts and tips
  if (recipe.isDraft || recipe.isTip) return false;
  return true;
}

/**
 * Score a recipe for auto-plan selection
 * Higher score = more likely to be selected
 */
function scoreRecipe(recipe, mealType, usedProteins = [], isWeeknight = false) {
  let score = 50; // Base score

  // Rating boost
  const ratings = getRecipeRatings(recipe.__backendId || recipe.id);
  if (ratings && ratings.userRating >= 4) {
    score += 20;
  }
  if (ratings && ratings.averageRating >= 4.5) {
    score += 10;
  }

  // Air fryer boost on weeknights
  if (isWeeknight && isAirFryerRecipe(recipe)) {
    score += 25;
  }

  // Expiring ingredients boost
  if (usesExpiringIngredients(recipe)) {
    score += 20;
  }

  // Protein penalty if used recently
  const protein = getRecipeProtein(recipe);
  if (protein && usedProteins.includes(protein)) {
    score -= 40;
  }

  // Cook time scoring for weeknights
  const minutes = parseCookTime(recipe.cookTime);
  if (isWeeknight) {
    if (minutes <= 20) score += 15;
    else if (minutes <= 30) score += 5;
    else if (minutes > 45) score -= 20;

    // Penalize timely effort on weeknights
    const effort = getRecipeEffort(recipe.__backendId || recipe.id);
    if (effort === 'timely') score -= 15;
    if (effort === 'lazy') score += 10;
  }

  // Small randomization to prevent predictability
  score += Math.random() * 20 - 10;

  return score;
}

/**
 * Get suitable recipes for a meal slot
 * Filters by category and suitability
 */
function getRecipesForMeal(mealType) {
  return (state.recipes || []).filter(recipe => {
    if (!isRecipeSuitableForDay(recipe)) return false;
    const cat = (recipe.category || '').toLowerCase();
    if (mealType === 'breakfast') return cat === 'breakfast';
    if (mealType === 'lunch') return cat === 'lunch' || cat === 'dinner';
    if (mealType === 'dinner') return cat === 'dinner' || cat === 'lunch';
    return false;
  });
}

// ============================================================================
// CORE: Auto-Plan Generation
// ============================================================================

/**
 * Generate a fresh 2-day auto-plan
 * Returns plan object with today and tomorrow's meal suggestions
 */
function generateAutoPlan() {
  const today = getToday();
  const tomorrow = new Date(today + 'T12:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = _localDateStr(tomorrow);

  const todayDate = new Date(today + 'T12:00:00');
  const tomorrowDate = new Date(tomorrowStr + 'T12:00:00');
  const todayDayOfWeek = todayDate.getDay();
  const tomorrowDayOfWeek = tomorrowDate.getDay();

  const isWeeknight = (dow) => dow >= 1 && dow <= 4; // Mon-Thu

  // Track used proteins to avoid repeats
  const usedProteinsToday = [];
  const usedProteinsTomorrow = [];

  /**
   * Select best recipe for a slot
   */
  function selectRecipe(dateStr, mealType, usedProteins, dayOfWeek) {
    const candidates = getRecipesForMeal(mealType);

    if (candidates.length === 0) {
      return null;
    }

    // Score all candidates
    const scored = candidates.map(recipe => ({
      recipe,
      score: scoreRecipe(recipe, mealType, usedProteins, isWeeknight(dayOfWeek))
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Pick top candidate
    const selected = scored[0].recipe;

    // Track protein for next meal
    const protein = getRecipeProtein(selected);
    if (protein && !usedProteins.includes(protein)) {
      usedProteins.push(protein);
    }

    return selected;
  }

  // Generate meals for today
  const todayBreakfast = selectRecipe(today, 'breakfast', usedProteinsToday, todayDayOfWeek);
  const todayLunch = selectRecipe(today, 'lunch', usedProteinsToday, todayDayOfWeek);
  const todayDinner = selectRecipe(today, 'dinner', usedProteinsToday, todayDayOfWeek);

  // Generate meals for tomorrow
  const tomorrowBreakfast = selectRecipe(tomorrowStr, 'breakfast', usedProteinsTomorrow, tomorrowDayOfWeek);
  const tomorrowLunch = selectRecipe(tomorrowStr, 'lunch', usedProteinsTomorrow, tomorrowDayOfWeek);
  const tomorrowDinner = selectRecipe(tomorrowStr, 'dinner', usedProteinsTomorrow, tomorrowDayOfWeek);

  const plan = {
    generatedAt: new Date().toISOString(),
    days: {
      [today]: {
        breakfast: todayBreakfast ? { recipeId: todayBreakfast.__backendId || todayBreakfast.id, locked: false } : null,
        lunch: todayLunch ? { recipeId: todayLunch.__backendId || todayLunch.id, locked: false } : null,
        dinner: todayDinner ? { recipeId: todayDinner.__backendId || todayDinner.id, locked: false } : null
      },
      [tomorrowStr]: {
        breakfast: tomorrowBreakfast ? { recipeId: tomorrowBreakfast.__backendId || tomorrowBreakfast.id, locked: false } : null,
        lunch: tomorrowLunch ? { recipeId: tomorrowLunch.__backendId || tomorrowLunch.id, locked: false } : null,
        dinner: tomorrowDinner ? { recipeId: tomorrowDinner.__backendId || tomorrowDinner.id, locked: false } : null
      }
    }
  };

  // Save to localStorage
  localStorage.setItem('yummy_autoplan', JSON.stringify(plan));

  return plan;
}

// ============================================================================
// PERSISTENCE: Lock & Swap
// ============================================================================

/**
 * Lock a meal slot so it won't be regenerated
 */
function lockMealSlot(dateStr, slot) {
  const plan = getAutoPlan();

  if (plan.days && plan.days[dateStr] && plan.days[dateStr][slot]) {
    plan.days[dateStr][slot].locked = true;
    localStorage.setItem('yummy_autoplan', JSON.stringify(plan));
  }
}

/**
 * Swap a single meal slot with a new recipe
 * User selects from modal, this updates the plan
 */
function swapMealSlot(dateStr, slot, newRecipeId) {
  const plan = getAutoPlan();

  if (plan.days && plan.days[dateStr] && plan.days[dateStr][slot]) {
    plan.days[dateStr][slot].recipeId = newRecipeId;
    // Don't lock it by default - user can swap again if desired
    localStorage.setItem('yummy_autoplan', JSON.stringify(plan));
  }
}

// ============================================================================
// UI: Star Rating Helper
// ============================================================================

/**
 * Render filled/empty stars for a recipe's user rating
 * size: 'sm' | 'lg'
 */
function renderStarRating(recipeId, size = 'sm') {
  const ratings = getRecipeRatings(recipeId);
  const userRating = ratings ? ratings.userRating : 0;

  const starSize = size === 'lg' ? 20 : 14;
  const filledColor = CONFIG.primary_action_color || '#e85d5d';
  const emptyColor = CONFIG.text_muted || '#888';

  let html = '<div style="display: flex; gap: 2px; align-items: center;">';

  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= userRating;
    const color = isFilled ? filledColor : emptyColor;

    html += `
      <svg width="${starSize}" height="${starSize}" viewBox="0 0 24 24" fill="${color}" style="display: block;">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;
  }

  html += '</div>';
  return html;
}

// ============================================================================
// UI: Auto-Plan View (Home Page Replacement)
// ============================================================================

/**
 * Render the two-day auto-plan view
 * This replaces the hero card + timeline on home page
 */
function renderAutoPlanView() {
  const plan = getAutoPlan();
  const today = getToday();
  const tomorrow = new Date(today + 'T12:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = _localDateStr(tomorrow);

  const todayObj = new Date(today + 'T12:00:00');
  const tomorrowObj = new Date(tomorrowStr + 'T12:00:00');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const todayName = dayNames[todayObj.getDay()];
  const tomorrowName = dayNames[tomorrowObj.getDay()];

  const todayFormatted = monthNames[todayObj.getMonth()] + ' ' + todayObj.getDate();
  const tomorrowFormatted = monthNames[tomorrowObj.getMonth()] + ' ' + tomorrowObj.getDate();

  let html = `
    <div style="
      padding: 16px;
      background: ${CONFIG.background_color};
      min-height: 100vh;
    ">
  `;

  // Render each day
  const days = [
    { date: today, dateStr: todayFormatted, dayName: todayName, isTodayFlag: true },
    { date: tomorrowStr, dateStr: tomorrowFormatted, dayName: tomorrowName, isTodayFlag: false }
  ];

  days.forEach(day => {
    html += renderAutoPlanDay(plan, day.date, day.dayName, day.dateStr, day.isTodayFlag);
  });

  html += '</div>';
  return html;
}

/**
 * Render a single day's meal cards
 */
function renderAutoPlanDay(plan, dateStr, dayName, dateFormatted, isToday) {
  let html = `
    <div style="margin-bottom: 32px;">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${CONFIG.divider_color};
      ">
        <h2 style="
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: ${CONFIG.text_color};
        ">
          ${isToday ? 'Today' : 'Tomorrow'}
        </h2>
        <span style="
          font-size: 14px;
          color: ${CONFIG.text_muted};
        ">
          ${dateFormatted}
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
  `;

  const dayPlan = plan.days?.[dateStr];
  const meals = ['breakfast', 'lunch', 'dinner'];
  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

  meals.forEach(mealType => {
    const mealData = dayPlan?.[mealType];
    const recipe = mealData?.recipeId ? getRecipeById(mealData.recipeId) : null;

    html += renderMealCard(recipe, dateStr, mealType, mealLabels[mealType], mealData?.locked || false);
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render a single meal card
 */
function renderMealCard(recipe, dateStr, mealType, mealLabel, isLocked) {
  if (!recipe) {
    // Placeholder for missing recipe
    return `
      <div style="
        background: ${CONFIG.surface_color};
        border: 1px solid ${CONFIG.divider_color};
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        color: ${CONFIG.text_muted};
      ">
        No ${mealLabel.toLowerCase()} planned
      </div>
    `;
  }

  const imageUrl = recipeThumb(recipe);
  const effort = getRecipeEffort(recipe.__backendId || recipe.id);
  const isAirFry = isAirFryerRecipe(recipe);
  const ratings = getRecipeRatings(recipe.__backendId || recipe.id);
  const userRating = ratings?.userRating || 0;

  const gradientFallback = getPlaceholderGradient(recipe);
  const backgroundImage = imageUrl
    ? `url(${imageUrl})`
    : `linear-gradient(135deg, ${gradientFallback})`;

  return `
    <div style="
      background: ${CONFIG.surface_color};
      border: 1px solid ${CONFIG.divider_color};
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    "
    class="autoplan-meal-card"
    data-recipe-id="${esc(recipe.__backendId || recipe.id)}"
    data-date="${esc(dateStr)}"
    data-meal="${esc(mealType)}"
    onclick="handleMealCardClick('${esc(recipe.__backendId || recipe.id)}', '${esc(dateStr)}', '${esc(mealType)}')">

      <!-- Image Section -->
      <div style="
        height: 160px;
        background-image: ${backgroundImage};
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 12px;
      ">
        <!-- Locked indicator -->
        ${isLocked ? `
          <div style="
            background: ${CONFIG.primary_action_color};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            &#128274;
          </div>
        ` : '<div></div>'}

        <!-- Swap button -->
        <button style="
          background: ${CONFIG.primary_action_color};
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        "
        onmouseover="this.style.opacity = '0.8'"
        onmouseout="this.style.opacity = '1'"
        onclick="event.stopPropagation(); handleSwapClick('${esc(dateStr)}', '${esc(mealType)}')">
          Swap
        </button>
      </div>

      <!-- Info Section -->
      <div style="
        padding: 12px;
        background: ${CONFIG.surface_color};
      ">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${CONFIG.text_color};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${esc(recipe.title || 'Untitled')}
        </h3>

        <!-- Rating row -->
        <div style="margin-bottom: 8px;">
          ${renderStarRating(recipe.id, 'sm')}
        </div>

        <!-- Meta row -->
        <div style="
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: ${CONFIG.text_muted};
          margin-bottom: 8px;
        ">
          ${recipe.cookTime ? `<span>&#9201; ${esc(recipe.cookTime)}</span>` : ''}
          ${effort ? `<span>${renderEffortPill(effort, 'sm')}</span>` : ''}
        </div>

        <!-- Air fryer badge -->
        ${isAirFry ? `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: ${CONFIG.primary_action_color}20;
            color: ${CONFIG.primary_action_color};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          ">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style="display: block;">
              <path d="M10 2v14m-5-3l5 5 5-5M7 5h6a3 3 0 013 3v4a3 3 0 01-3 3H7a3 3 0 01-3-3V8a3 3 0 013-3z"/>
            </svg>
            Air Fry
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ============================================================================
// UI: Swap Modal
// ============================================================================

/**
 * Render the swap modal with alternative recipes
 */
function renderSwapModal(dateStr, mealType) {
  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const mealLabel = mealLabels[mealType];

  // Get current recipe
  const plan = getAutoPlan();
  const currentRecipeId = plan.days?.[dateStr]?.[mealType]?.recipeId;

  // Get alternatives
  const alternatives = getRecipesForMeal(mealType)
    .filter(r => r.id !== currentRecipeId)
    .sort(() => Math.random() - 0.5);

  let cardsHtml = '';
  if (alternatives.length === 0) {
    cardsHtml = `
      <div style="
        text-align: center;
        color: ${CONFIG.text_muted};
        padding: 32px 16px;
      ">
        No other recipes available for ${mealLabel.toLowerCase()}
      </div>
    `;
  } else {
    alternatives.forEach(recipe => {
      cardsHtml += renderSwapAlternativeCard(recipe, dateStr, mealType);
    });
  }

  return `
    <div id="swap-modal-overlay" style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    " onclick="event.target.id === 'swap-modal-overlay' && closeSwapModal()">

      <div style="
        width: 100%;
        max-width: 500px;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
        background: ${CONFIG.background_color};
        overflow: hidden;
      " onclick="event.stopPropagation()">

        <!-- Header -->
        <div style="
          background: ${CONFIG.surface_color};
          border-bottom: 1px solid ${CONFIG.divider_color};
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        ">
          <h2 style="
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: ${CONFIG.text_color};
          ">Swap ${mealLabel}</h2>
          <button style="
            background: none;
            border: none;
            color: ${CONFIG.text_muted};
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          " onclick="closeSwapModal()">&#215;</button>
        </div>

        <!-- Shuffle button -->
        <div style="
          background: ${CONFIG.surface_color};
          padding: 12px 16px;
          border-bottom: 1px solid ${CONFIG.divider_color};
          flex-shrink: 0;
        ">
          <button style="
            background: ${CONFIG.primary_action_color};
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: opacity 0.2s;
          "
          onmouseover="this.style.opacity='0.8'"
          onmouseout="this.style.opacity='1'"
          onclick="shuffleSwapAlternatives('${esc(dateStr)}', '${esc(mealType)}')">
            Shuffle Alternatives
          </button>
        </div>

        <!-- Alternatives list -->
        <div style="
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          -webkit-overflow-scrolling: touch;
        ">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${cardsHtml}
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Render a compact horizontal alternative recipe card in swap modal
 */
function renderSwapAlternativeCard(recipe, dateStr, mealType) {
  const imageUrl = recipeThumb(recipe);
  const effort = getRecipeEffort(recipe.__backendId || recipe.id);
  const isAirFry = isAirFryerRecipe(recipe);
  const gradientBg = getPlaceholderGradient(recipe);

  // Star rating inline (10px stars)
  const ratings = typeof getRecipeRatings === 'function' ? getRecipeRatings(recipe.__backendId || recipe.id) : null;
  const userRating = ratings ? (ratings.userRating || 0) : 0;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    const color = i <= userRating ? (CONFIG.primary_action_color || '#e85d5d') : (CONFIG.text_tertiary || '#5c5c66');
    starsHtml += `<svg width="10" height="10" viewBox="0 0 24 24" fill="${color}" style="display:block;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }

  // Thumbnail: image or gradient placeholder
  const thumbHtml = imageUrl
    ? `<img src="${esc(imageUrl)}" style="
        width: 80px; height: 80px;
        border-radius: 8px;
        object-fit: cover;
        display: block;
        flex-shrink: 0;
      " loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      <div style="
        display: none;
        width: 80px; height: 80px;
        border-radius: 8px;
        flex-shrink: 0;
        background: ${gradientBg};
        align-items: center;
        justify-content: center;
      "></div>`
    : `<div style="
        width: 80px; height: 80px;
        border-radius: 8px;
        flex-shrink: 0;
        background: ${gradientBg};
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>`;

  return `
    <div style="
      background: ${CONFIG.surface_color};
      border: 1px solid ${CONFIG.divider_color};
      border-radius: 10px;
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      min-height: 44px;
      transition: background 0.15s ease;
    "
    onclick="selectSwapRecipe('${esc(recipe.__backendId || recipe.id)}', '${esc(dateStr)}', '${esc(mealType)}')"
    onmouseover="this.style.background='${CONFIG.divider_color}'"
    onmouseout="this.style.background='${CONFIG.surface_color}'">

      ${thumbHtml}

      <div style="flex: 1; min-width: 0; padding: 2px 0;">
        <div style="
          font-size: 14px;
          font-weight: 700;
          color: ${CONFIG.text_color};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        ">${esc(recipe.title || 'Untitled')}</div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
          ${recipe.cookTime ? `<span style="font-size: 12px; color: ${CONFIG.text_muted};">&#9201; ${esc(recipe.cookTime)}</span>` : ''}
          ${effort ? `<span>${renderEffortPill(effort, 'sm')}</span>` : ''}
          ${isAirFry ? `<span style="
            display: inline-block;
            background: ${CONFIG.primary_action_color}20;
            color: ${CONFIG.primary_action_color};
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.3px;
          ">AIR FRY</span>` : ''}
        </div>

        <div style="display: flex; gap: 2px; align-items: center;">
          ${starsHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Shuffle alternatives — re-renders swap modal with new random order
 */
function shuffleSwapAlternatives(dateStr, mealType) {
  closeSwapModal();
  const swapHtml = renderSwapModal(dateStr, mealType);
  showModalView(swapHtml);
}

// ============================================================================
// UI: Prep View
// ============================================================================

/**
 * Render the prep view for a recipe
 * Shows step-by-step cooking instructions
 */
function renderPrepView(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return '<div style="color: #888; padding: 32px;">Recipe not found</div>';
  }

  const steps = parseRecipeSteps(recipe.instructions || '');

  let html = `
    <div id="prep-modal-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      z-index: 1000;
    " onclick="event.target.id === 'prep-modal-overlay' && closePrepView()">

      <!-- Header -->
      <div style="
        background: ${CONFIG.surface_color};
        border-bottom: 1px solid ${CONFIG.divider_color};
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <h2 style="
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: ${CONFIG.text_color};
          ">
            ${esc(recipe.title || 'Cooking')}
          </h2>
          <p style="
            margin: 0;
            font-size: 13px;
            color: ${CONFIG.text_muted};
          ">
            ${steps.length} steps
          </p>
        </div>
        <button style="
          background: none;
          border: none;
          color: ${CONFIG.text_muted};
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        onclick="closePrepView()">
          &#215;
        </button>
      </div>

      <!-- Steps -->
      <div style="
        flex: 1;
        overflow-y: auto;
        background: ${CONFIG.background_color};
        padding: 16px;
      ">
        <div style="max-width: 600px; margin: 0 auto;">
  `;

  if (steps.length === 0) {
    html += `
      <div style="
        text-align: center;
        color: ${CONFIG.text_muted};
        padding: 32px 16px;
      ">
        No cooking steps available
      </div>
    `;
  } else {
    steps.forEach((step, index) => {
      html += renderPrepStep(step, index + 1, steps.length);
    });
  }

  html += `
        </div>
      </div>
    </div>
  `;

  return html;
}

/**
 * Parse recipe instructions into individual steps
 */
function parseRecipeSteps(instructionsStr) {
  if (!instructionsStr) return [];

  const steps = [];

  // Split by common delimiters
  let lines = instructionsStr
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // If already numbered, extract them
  const numbered = lines.every(line => /^\d+\.?\s/.test(line));
  if (numbered) {
    lines = lines.map(line => line.replace(/^\d+\.?\s*/, ''));
  }

  // Group consecutive lines into steps (max 3 lines per step unless numbered)
  if (numbered) {
    return lines;
  }

  let currentStep = '';
  let lineCount = 0;

  lines.forEach(line => {
    if (lineCount > 0 && line.match(/^[A-Z]/)) {
      // New sentence starting with capital = new step
      if (currentStep) steps.push(currentStep);
      currentStep = line;
      lineCount = 1;
    } else {
      currentStep += (currentStep ? ' ' : '') + line;
      lineCount++;
      if (lineCount >= 3) {
        steps.push(currentStep);
        currentStep = '';
        lineCount = 0;
      }
    }
  });

  if (currentStep) steps.push(currentStep);

  return steps;
}

/**
 * Render a single prep step
 */
function renderPrepStep(stepText, stepNum, totalSteps) {
  return `
    <div style="
      background: ${CONFIG.surface_color};
      border: 1px solid ${CONFIG.divider_color};
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    ">
      <!-- Step number circle -->
      <div style="
        display: flex;
        align-items: flex-start;
        gap: 16px;
      ">
        <div style="
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${CONFIG.primary_action_color};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        ">
          ${stepNum}
        </div>

        <div style="flex: 1;">
          <!-- Step text -->
          <p style="
            margin: 0 0 12px 0;
            font-size: 15px;
            color: ${CONFIG.text_color};
            line-height: 1.5;
          ">
            ${esc(stepText)}
          </p>

          <!-- Media placeholder -->
          <div style="
            background: ${CONFIG.background_color};
            border: 2px dashed ${CONFIG.divider_color};
            border-radius: 6px;
            height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.text_muted};
          ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 8px; display: block;">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span style="font-size: 13px;">Video coming soon</span>
          </div>
        </div>
      </div>

      <!-- Step counter -->
      <div style="
        margin-top: 12px;
        text-align: center;
        font-size: 12px;
        color: ${CONFIG.text_muted};
      ">
        Step ${stepNum} of ${totalSteps}
      </div>
    </div>
  `;
}

// ============================================================================
// EVENT HANDLERS (exported for inline onclick)
// ============================================================================

/**
 * Handle meal card click - opens prep view
 */
function handleMealCardClick(recipeId, dateStr, mealType) {
  const prepHtml = renderPrepView(recipeId);
  lockMealSlot(dateStr, mealType); // Auto-lock when user views
  showModalView(prepHtml);
}

/**
 * Handle swap button click - opens swap modal
 */
function handleSwapClick(dateStr, mealType) {
  const swapHtml = renderSwapModal(dateStr, mealType);
  showModalView(swapHtml);
}

/**
 * Handle selecting a recipe in swap modal
 */
function selectSwapRecipe(recipeId, dateStr, mealType) {
  swapMealSlot(dateStr, mealType, recipeId);
  closeSwapModal();

  // Refresh the view
  if (typeof render === 'function') render();
}

/**
 * Close swap modal
 */
function closeSwapModal() {
  const modal = document.getElementById('swap-modal-overlay');
  if (modal) modal.remove();
}

/**
 * Close prep view
 */
function closePrepView() {
  const modal = document.getElementById('prep-modal-overlay');
  if (modal) modal.remove();
}

/**
 * Show a modal view by injecting into page
 */
function showModalView(html) {
  // Remove any existing modals
  const existing = document.querySelector('[id$="-modal-overlay"]');
  if (existing) existing.remove();

  // Insert new modal
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container.firstElementChild);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the auto-plan system
 * Call once on app startup
 */
function initAutoplan() {
  // Load or generate plan for today
  const plan = getAutoPlan();
  console.log('AutoPlan initialized:', plan);
}
