// ============================================================
// RECIPES PAGE - js/recipes.js
// All recipe-page-specific functions: list, view, edit,
// freestyle editing, recipe import, CRUD actions.
// Depends on js/shared.js for: CONFIG, state, storage, esc,
// capitalize, navigateTo, render (page-local), renderNav,
// renderBottomNav, openModal, closeModal, showToast, showError,
// getRecipeById, recipeThumb, recipeUrl, recipeIngList,
// newRecipeDraft, ensureRecipeForm, setRecipeField,
// handleImageUpload, removeImage, addIngRow, showBulkImportModal,
// ING_GROUPS, MEAL_CATEGORIES, TIP_CATEGORIES, CHEF_API_URL,
// loadAllState, compressImage, uploadPhoto, _debouncedRender,
// getSavedRecipes, isRecipeSaved, toggleSaveRecipe,
// SAVED_RECIPES_KEY, savePlan
// ============================================================

// ===== INGREDIENT ROW HELPERS =====

function delIngRow(i) {
  ensureRecipeForm();
  state.recipeForm.ingredientsRows.splice(i, 1);
  if (state.recipeForm.ingredientsRows.length === 0) addIngRow();
  render();
}

function setIng(i, field, value) {
  ensureRecipeForm();
  state.recipeForm.ingredientsRows[i][field] = value;
}

// ===== RECIPE CRUD ACTIONS =====

function openNewRecipe() {
  state.recipeForm = newRecipeDraft();
  state.recipeForm.isDraft = false;
  state.currentView = 'recipe-edit';
  render();
}

function openNewTip() {
  state.recipeForm = newRecipeDraft();
  state.recipeForm.isTip = true;
  state.recipeForm.category = 'Prep Techniques';
  state.currentView = 'recipe-edit';
  render();
}

function openEditRecipe(recipeId) {
  const r = getRecipeById(recipeId);
  if (!r) return;

  const rows = Array.isArray(r.ingredientsRows) ? r.ingredientsRows : [];
  state.recipeForm = {
    ...newRecipeDraft(),
    ...r,
    ingredientsRows: rows.length ? rows : [{ qty: '', unit: '', name: '', group: 'Produce' }]
  };

  state.currentView = 'recipe-edit';
  render();
}

function closeRecipeEditor() {
  state.recipeForm = null;
  navigateTo('recipes');
}

function openRecipeView(id, fromPlan = null, fromStats = false, fromTips = false, fromMealOptions = false) {
  // Save scroll position before navigating
  const app = document.getElementById('app');
  if (app && state.currentView) {
    state.scrollPositions[state.currentView] = app.scrollTop;
  }

  state.selectedRecipeViewId = id;
  state.viewingFromPlan = fromPlan; // {date, meal} or null
  state.viewingFromStats = fromStats; // true if coming from recipe-stats
  state.viewingFromTips = fromTips; // true if coming from tips page
  state.viewingFromMealOptions = fromMealOptions; // true if coming from meal options
  state.currentView = 'recipe-view';
  render();

  // Scroll to top for recipe view
  setTimeout(() => {
    const app = document.getElementById('app');
    if (app) app.scrollTop = 0;
  }, 0);
}

async function saveRecipeForm() {
  console.log('[saveRecipe] Starting save...');
  ensureRecipeForm();

  const title = (state.recipeForm.title || '').trim();
  const cat = (state.recipeForm.category || '').trim();
  const url = (state.recipeForm.recipe_url || '').trim();

  console.log('[saveRecipe] Form data:', { title, category: cat, id: state.recipeForm.id, ingredientCount: (state.recipeForm.ingredientsRows || []).length });

  if (!title) return showError(state.recipeForm.isTip ? 'Tip Title is required.' : 'Recipe Title is required.');
  if (!cat) return showError('Category is required.');

  const rows = (state.recipeForm.ingredientsRows || [])
    .map(r => ({
      qty: (r.qty || '').trim(),
      unit: (r.unit || '').trim(),
      name: (r.name || '').trim(),
      group: r.group || 'Other'
    }))
    .filter(r => r.name);

  const isEdit = !!state.recipeForm.id;
  const payload = {
    ...state.recipeForm,
    title,
    category: cat,
    recipe_url: url,
    image_url: (state.recipeForm.image_url || '').trim(),
    tags: (state.recipeForm.tags || '').trim(),
    notes: (state.recipeForm.notes || '').trim(),
    instructions: (state.recipeForm.instructions || '').trim(),
    ingredientsRows: rows,
    sourceType: state.recipeForm.sourceType || 'user',
    isDraft: state.recipeForm.isDraft || false
  };

  console.log('[saveRecipe] Payload ready:', { id: payload.id, title: payload.title, isEdit });

  try {
    if (payload.id) {
      console.log('[saveRecipe] Updating existing recipe:', payload.id);
      const result = await storage.update(payload);
      console.log('[saveRecipe] Update result:', result);
    } else {
      payload.id = `recipe_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      console.log('[saveRecipe] Creating new recipe:', payload.id);
      const result = await storage.create(payload);
      console.log('[saveRecipe] Create result:', result);
    }
    const toastMsg = payload.isTip
      ? (isEdit ? 'Tip updated!' : 'Tip saved!')
      : (isEdit ? 'Recipe updated!' : 'Recipe saved!');
    showToast(toastMsg, 'success');
    console.log('[saveRecipe] Save complete, navigating away');
    closeRecipeEditor();
  } catch (e) {
    console.error('[saveRecipe] Error:', e);
    showError('Failed to save recipe.');
  }
}

async function publishTip(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return;

  const updatedRecipe = { ...recipe, isTip: false };

  try {
    await storage.update(updatedRecipe);
    showToast('Tip converted to recipe!', 'success');
  } catch (e) {
    console.error(e);
    showError('Failed to convert tip.');
  }
}

async function deleteRecipe(recipe) {
  state.isLoading = true;
  render();
  try {
    const result = await storage.delete(recipe);
    if (!result.isOk) {
      showError('Failed to delete recipe');
    }
  } catch (error) {
    console.error('deleteRecipe failed:', error);
    showError('Failed to delete recipe');
  } finally {
    state.isLoading = false;
    render();
  }
}

async function toggleFavorite(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return;

  state.isLoading = true;
  render();
  try {
    const updatedRecipe = { ...recipe, favorite: !recipe.favorite };
    const result = await storage.update(updatedRecipe);
    if (!result.isOk) {
      showError('Failed to update favorite status');
    }
  } catch (error) {
    console.error('toggleFavorite failed:', error);
    showError('Failed to update favorite status');
  } finally {
    state.isLoading = false;
    render();
  }
}

// markAsCooked, saveCookedMeal, unmarkAsCooked removed — cooking is only tracked via My Meals food log

// ===== FREESTYLE MEAL FUNCTIONS =====

function getAllFreestyleTags() {
  const tags = new Set();
  state.freestyleMeals.forEach(meal => {
    (meal.tags || []).forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

function getPendingRecordingNeeds() {
  return (state.recordingNeeds || []).filter(r => !r.completed);
}

function parseNarrative(text) {
  const mentions = [];
  const recordingNeeds = [];

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({ title: match[1], id: match[2], index: match.index });
  }

  const recordingRegex = /#\[([^\]]+)\]/g;
  while ((match = recordingRegex.exec(text)) !== null) {
    recordingNeeds.push({ text: match[1], index: match.index });
  }

  return { mentions, recordingNeeds };
}

function narrativeToHtml(text) {
  if (!text) return '';

  let html = esc(text);

  html = html.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, title, id) => {
    return `<span class="mention-tag cursor-pointer" onclick="openRecipeView('${id}')">${title}</span>`;
  });

  html = html.replace(/#\[([^\]]+)\]/g, (match, text) => {
    return `<span class="record-tag">${text}</span>`;
  });

  return html;
}

function selectMention(item) {
  const textarea = document.getElementById('narrativeEditor');
  if (!textarea) return;

  const text = textarea.value;
  const cursorPos = state.mentionCursorPosition;

  let startPos = cursorPos - 1;
  while (startPos >= 0 && text[startPos] !== '@' && text[startPos] !== '#') {
    startPos--;
  }

  let insertText;
  if (state.mentionDropdownType === '@') {
    // Recipe mention: @[Recipe Name](recipe_id)
    insertText = `@[${item.title}](${item.id})`;
  } else {
    // Ingredient/blend mention: #ingredient-name (kebab-case, no brackets)
    const kebabName = (item.name || item).toLowerCase().replace(/\s+/g, '-');
    insertText = `#${kebabName}`;
  }

  const newText = text.slice(0, startPos) + insertText + ' ' + text.slice(cursorPos);

  state.freestyleForm.narrative = newText;
  state.mentionDropdownVisible = false;

  render();

  setTimeout(() => {
    const newTextarea = document.getElementById('narrativeEditor');
    if (newTextarea) {
      newTextarea.focus();
      const newPos = startPos + insertText.length + 1;
      newTextarea.setSelectionRange(newPos, newPos);
    }
  }, 0);
}

function handleNarrativeInput(e) {
  const textarea = e.target;
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;

  state.freestyleForm.narrative = text;
  state.mentionCursorPosition = cursorPos;

  let startPos = cursorPos - 1;
  let triggerChar = null;

  while (startPos >= 0) {
    const char = text[startPos];
    if (char === '@' || char === '#') {
      triggerChar = char;
      break;
    }
    // Only break on newline, not space (allows "chicken thighs" search)
    if (char === '\n') {
      break;
    }
    startPos--;
  }

  const wasDropdownVisible = state.mentionDropdownVisible;

  if (triggerChar && startPos >= 0) {
    const searchTerm = text.slice(startPos + 1, cursorPos);
    // Allow spaces in search term (e.g., "chicken th" matches "Chicken Thighs")
    state.mentionSearchTerm = searchTerm.toLowerCase();
    state.mentionDropdownType = triggerChar;
    state.mentionDropdownVisible = true;
    state.mentionDropdownIndex = 0;
  } else {
    state.mentionDropdownVisible = false;
  }

  // Only re-render if dropdown state changed (not on every keystroke)
  if (wasDropdownVisible !== state.mentionDropdownVisible || state.mentionDropdownVisible) {
    // Update just the dropdown, not the whole page
    const dropdownContainer = document.getElementById('mentionDropdownContainer');
    if (dropdownContainer) {
      dropdownContainer.innerHTML = renderMentionDropdown();
    } else {
      // Fallback: full render if container not found
      render();
      setTimeout(() => {
        const newTextarea = document.getElementById('narrativeEditor');
        if (newTextarea) {
          newTextarea.focus();
          newTextarea.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  }
}

function renderMentionDropdown() {
  const dropdownItems = state.mentionDropdownVisible ? getMentionDropdownItems() : [];

  if (!state.mentionDropdownVisible || dropdownItems.length === 0) {
    return '';
  }

  return `
    <div style="background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-height: 250px; overflow-y: auto;">
      ${state.mentionDropdownType === '@' ? dropdownItems.map((item, i) => `
        <div style="padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; ${i === state.mentionDropdownIndex ? 'background: rgba(232,93,93,0.15);' : ''} color: ${CONFIG.text_color};"
          onmouseover="this.style.background='rgba(232,93,93,0.1)'"
          onmouseout="this.style.background='${i === state.mentionDropdownIndex ? 'rgba(232,93,93,0.15)' : 'transparent'}'"
          onclick="selectMention(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          <span>${esc(item.title)}</span>
          <span style="opacity: 0.4; font-size: ${CONFIG.type_micro};">recipe</span>
        </div>
      `).join('') : dropdownItems.map((item, i) => `
        <div style="padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; ${i === state.mentionDropdownIndex ? 'background: rgba(232,93,93,0.15);' : ''} color: ${CONFIG.text_color};"
          onmouseover="this.style.background='rgba(232,93,93,0.1)'"
          onmouseout="this.style.background='${i === state.mentionDropdownIndex ? 'rgba(232,93,93,0.15)' : 'transparent'}'"
          onclick="selectMention(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          <span>${esc(item.name)}</span>
          <span style="opacity: 0.4; font-size: ${CONFIG.type_micro};">${item.type === 'blend' ? 'blend' : item.type === 'pantry' ? 'pantry' : item.type === 'custom' ? 'new' : 'ingredient'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function handleNarrativeKeydown(e) {
  if (!state.mentionDropdownVisible) return;

  const items = getMentionDropdownItems();

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    state.mentionDropdownIndex = Math.min(state.mentionDropdownIndex + 1, items.length - 1);
    render();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    state.mentionDropdownIndex = Math.max(state.mentionDropdownIndex - 1, 0);
    render();
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (items.length > 0) {
      e.preventDefault();
      selectMention(items[state.mentionDropdownIndex]);
    }
  } else if (e.key === 'Escape') {
    state.mentionDropdownVisible = false;
    render();
  }
}

function getMentionDropdownItems() {
  const search = state.mentionSearchTerm.toLowerCase();

  if (state.mentionDropdownType === '@') {
    // @ = Recipes
    return state.recipes
      .filter(r => !r.isDraft)
      .filter(r => r.title.toLowerCase().includes(search))
      .slice(0, 8)
      .map(r => ({
        id: r.__backendId || r.id,
        title: r.title,
        type: 'recipe'
      }));
  } else {
    // # = Pantry items + Seasoning blends
    const results = [];

    // Add seasoning blends first
    (state.seasoningBlends || []).forEach(blend => {
      if (blend.name.toLowerCase().includes(search)) {
        results.push({
          name: capitalize(blend.name),
          type: 'blend'
        });
      }
    });

    // Add pantry items
    state.inventory.forEach(item => {
      if (item.name.toLowerCase().includes(search)) {
        results.push({
          name: capitalize(item.name),
          type: 'pantry'
        });
      }
    });

    // Add ingredient knowledge items not in pantry
    state.ingredientKnowledge.forEach(ing => {
      const alreadyAdded = results.some(r => r.name.toLowerCase() === ing.name.toLowerCase());
      if (!alreadyAdded && ing.name.toLowerCase().includes(search)) {
        results.push({
          name: capitalize(ing.name),
          type: 'ingredient'
        });
      }
    });

    // If search term doesn't match anything, allow custom entry
    if (search && !results.some(r => r.name.toLowerCase() === search)) {
      results.unshift({
        name: capitalize(search),
        type: 'custom'
      });
    }

    return results.slice(0, 10);
  }
}

function addFreestyleTag(tag) {
  if (!state.freestyleForm) return;
  const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanTag) return;

  if (!state.freestyleForm.tags.includes(cleanTag)) {
    state.freestyleForm.tags.push(cleanTag);
    render();
  }
}

function removeFreestyleTag(tag) {
  if (!state.freestyleForm) return;
  state.freestyleForm.tags = state.freestyleForm.tags.filter(t => t !== tag);
  render();
}

async function deleteFreestyle(id) {
  const meal = (state.freestyleMeals || []).find(m => m.id === id);
  if (!meal) return;

  state.freestyleMeals = state.freestyleMeals.filter(m => m.id !== id);
  render();

  try {
    await storage.delete(meal);
    showToast('Freestyle meal deleted', 'success');
  } catch (e) {
    console.error(e);
    showError('Failed to delete');
  }
}

async function saveFreestyle() {
  const form = state.freestyleForm;
  if (!form) return;

  if (!form.image_url && !form.narrative) {
    showError('Please add a photo or write about your meal');
    return;
  }

  // Extract mentions and recording needs from narrative
  const parsed = parseNarrative(form.narrative || '');
  const linkedRecipes = parsed.mentions.map(m => m.id);
  const recordingNeedsFromNarrative = parsed.recordingNeeds.map(r => r.text);

  const meal = {
    id: form.id || `freestyle_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: 'freestyle',
    date: form.date,
    image_url: form.image_url || '',
    narrative: form.narrative || '',
    notes: form.narrative || '', // Keep for backward compatibility
    linkedRecipes: linkedRecipes,
    tags: form.tags || []
  };

  try {
    if (form.id) {
      await storage.update(meal);
      state.freestyleMeals = state.freestyleMeals.map(m => m.id === meal.id ? meal : m);
    } else {
      await storage.create(meal);
      state.freestyleMeals = [...(state.freestyleMeals || []), meal];
    }

    // Create recording need items from #[...] tags
    for (const needText of recordingNeedsFromNarrative) {
      const existingNeed = state.recordingNeeds.find(r =>
        r.text.toLowerCase() === needText.toLowerCase() && !r.completed
      );

      if (!existingNeed) {
        const recordingNeed = {
          id: `recording_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          type: 'recording_need',
          text: needText,
          sourceFreestyleId: meal.id,
          createdAt: new Date().toISOString(),
          completed: false
        };
        await storage.create(recordingNeed);
        state.recordingNeeds.push(recordingNeed);
      }
    }

    state.freestyleForm = null;
    state.currentView = 'recipes';
    render();
    showToast('Freestyle meal saved!', 'success');
  } catch (e) {
    console.error(e);
    showError('Failed to save');
  }
}

function openNewFreestyle() {
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));

  state.freestyleForm = {
    id: null,
    date: localDate.toISOString().split('T')[0],
    image_url: '',
    narrative: '',
    notes: '',
    linkedRecipes: [],
    tags: []
  };
  state.currentView = 'freestyle-edit';
  render();
}

function editFreestyle(id) {
  const meal = (state.freestyleMeals || []).find(m => m.id === id);
  if (!meal) return;
  state.freestyleForm = {
    ...meal,
    narrative: meal.narrative || meal.notes || ''
  };
  state.currentView = 'freestyle-edit';
  render();
}

async function cleanupNarrativeWithAI() {
  const form = state.freestyleForm;
  if (!form || !form.narrative || form.narrative.trim().length < 10) {
    showToast('Write a bit more before cleaning up!', 'info');
    return;
  }

  showToast('Cleaning up with AI...', 'info');

  try {
    // Get list of available recipes, pantry items, and blends for context
    const recipeNames = state.recipes.filter(r => !r.isDraft).map(r => r.title).slice(0, 50);
    const pantryNames = state.inventory.map(i => i.name).slice(0, 50);
    const blendNames = (state.seasoningBlends || []).map(b => b.name);

    const prompt = `You are helping organize a cooking journal entry. Clean up the following narrative while keeping it readable and personal.

Rules:
1. Keep it as a flowing narrative (NOT sections or bullet points)
2. Fix grammar and spelling
3. Where appropriate, convert recipe references to @[Recipe Name](id) format - use the recipe names provided
4. Where appropriate, convert ingredient/seasoning references to #ingredient-name format (kebab-case)
5. At the end, add a "Used:" line listing all #ingredients mentioned
6. Keep the writer's voice and personality
7. Don't add information that wasn't there

Available recipes: ${recipeNames.join(', ')}
Available pantry items: ${pantryNames.join(', ')}
Available seasoning blends: ${blendNames.join(', ')}

Original entry:
${form.narrative}

Return ONLY the cleaned up narrative with the Used: line at the end. No explanations.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const cleanedText = data.content?.[0]?.text || form.narrative;

    // Extract used ingredients from the cleaned text
    const usedMatch = cleanedText.match(/Used:\s*(.+)$/i);
    let usedIngredients = [];
    if (usedMatch) {
      usedIngredients = usedMatch[1]
        .split(/[,•]/)
        .map(s => s.trim().replace(/^#/, ''))
        .filter(s => s.length > 0);
    }

    // Update form
    state.freestyleForm.narrative = cleanedText.replace(/\n*Used:\s*.+$/i, '').trim();
    state.freestyleForm.usedIngredients = usedIngredients;

    showToast('Narrative cleaned up!', 'success');
    render();

  } catch (e) {
    console.error('AI cleanup failed:', e);
    showError('Failed to clean up. Try again.');
  }
}

async function handleFreestylePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  showToast('Compressing photo...', 'info');
  const compressedFile = await compressImage(file);

  const url = await uploadPhoto(compressedFile);
  if (url) {
    state.freestyleForm.image_url = url;
    render();
  }

  event.target.value = '';
}

// ===== RECIPE IMPORT FUNCTIONS =====

function showImportRecipeModal() {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 class="text-2xl font-bold mb-4">Import Recipe from URL</h2>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Recipe URL:</label>
        <input type="url" id="importRecipeUrl"
               class="w-full px-3 py-2 border rounded"
               placeholder="https://www.allrecipes.com/recipe/..."
               autofocus />
        <div class="text-sm mt-1" style="color: ${CONFIG.text_muted};">
          Works with most recipe sites (AllRecipes, Food Network, NYT Cooking, etc.)
        </div>
      </div>

      <div class="flex gap-2 justify-end">
        <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Cancel
        </button>
        <button onclick="importRecipeFromUrl()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
          Import Recipe
        </button>
      </div>
    </div>
  `);
}

async function importRecipeFromUrl() {
  const url = document.getElementById('importRecipeUrl')?.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showError('Please enter a valid URL starting with http:// or https://');
    return;
  }

  closeModal();
  state.isLoading = true;
  render();
  showToast('Importing recipe...', 'info');

  try {
    const response = await fetch(CHEF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fetchUrl: url,
        messages: [{
          role: 'user',
          content: `Extract the recipe from this HTML and return ONLY valid JSON (no markdown, no backticks, no explanation). Use this exact structure:
{
  "title": "Recipe Name",
  "category": "one of: Breakfast, Lunch, Dinner, Dessert, Snack, Beverage, Other",
  "servings": number,
  "prepTime": "e.g. 15 mins",
  "cookTime": "e.g. 30 mins",
  "ingredients": [
    {"item": "ingredient name", "amount": "quantity", "unit": "unit of measure", "group": "one of: Proteins, Vegetables, Carbs, Dairy, Fruits, Seasonings, Oils, Sweeteners, Other"}
  ],
  "instructions": ["Step 1 text", "Step 2 text", "Step 3 text"],
  "notes": "any tips or notes from the recipe",
  "sourceUrl": "${url}"
}`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      showError(data.error);
      state.isLoading = false;
      render();
      return;
    }

    if (data.content && data.content[0]?.text) {
      const text = data.content[0].text;

      let recipeData;
      try {
        let cleanText = text.trim();
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipeData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        console.error('Failed to parse recipe JSON:', e, text);
        showError('Could not parse recipe data. Please try a different URL.');
        state.isLoading = false;
        render();
        return;
      }

      showImportPreviewModal(recipeData, url);
    } else {
      showError('Could not fetch recipe. Please try a different URL.');
    }
  } catch (error) {
    console.error('Import error:', error);
    showError('Failed to import recipe. Please check the URL and try again.');
  } finally {
    state.isLoading = false;
    render();
  }
}

function showImportPreviewModal(recipeData, sourceUrl) {
  const ingredientsList = (recipeData.ingredients || [])
    .map(ing => `${ing.amount || ''} ${ing.unit || ''} ${ing.item}`.trim())
    .join('\n');

  const instructionsList = (recipeData.instructions || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join('\n');

  openModal(`
    <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
      <h2 class="text-2xl font-bold mb-4">Review Imported Recipe</h2>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Title:</label>
        <input type="text" id="importTitle" value="${esc(recipeData.title || '')}"
               class="w-full px-3 py-2 border rounded" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block mb-2 font-semibold">Category:</label>
          <select id="importCategory" class="w-full px-3 py-2 border rounded">
            ${MEAL_CATEGORIES.map(c => `
              <option value="${c}" ${recipeData.category === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block mb-2 font-semibold">Servings:</label>
          <input type="number" id="importServings" value="${recipeData.servings || 4}"
                 class="w-full px-3 py-2 border rounded" min="1" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block mb-2 font-semibold">Prep Time:</label>
          <input type="text" id="importPrepTime" value="${esc(recipeData.prepTime || '')}"
                 class="w-full px-3 py-2 border rounded" placeholder="15 mins" />
        </div>
        <div>
          <label class="block mb-2 font-semibold">Cook Time:</label>
          <input type="text" id="importCookTime" value="${esc(recipeData.cookTime || '')}"
                 class="w-full px-3 py-2 border rounded" placeholder="30 mins" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Ingredients:</label>
        <textarea id="importIngredients" rows="6"
                  class="w-full px-3 py-2 border rounded font-mono text-sm">${esc(ingredientsList)}</textarea>
        <div class="text-xs mt-1" style="color: ${CONFIG.text_muted};">One ingredient per line</div>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Instructions:</label>
        <textarea id="importInstructions" rows="6"
                  class="w-full px-3 py-2 border rounded text-sm">${esc(instructionsList)}</textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Notes:</label>
        <textarea id="importNotes" rows="2"
                  class="w-full px-3 py-2 border rounded">${esc(recipeData.notes || '')}</textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Image URL (optional):</label>
        <input type="url" id="importImage" value=""
               class="w-full px-3 py-2 border rounded"
               placeholder="https://example.com/image.jpg" />
      </div>

      <input type="hidden" id="importSourceUrl" value="${esc(sourceUrl)}" />
      <input type="hidden" id="importIngredientsData" value='${JSON.stringify(recipeData.ingredients || [])}' />

      <div class="flex gap-2 justify-end">
        <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Cancel
        </button>
        <button onclick="saveImportedRecipe()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">
          Save Recipe
        </button>
      </div>
    </div>
  `);
}

async function saveImportedRecipe() {
  const title = document.getElementById('importTitle')?.value.trim();
  const category = document.getElementById('importCategory')?.value;
  const servings = parseInt(document.getElementById('importServings')?.value) || 4;
  const prepTime = document.getElementById('importPrepTime')?.value.trim();
  const cookTime = document.getElementById('importCookTime')?.value.trim();
  const notes = document.getElementById('importNotes')?.value.trim();
  const image = document.getElementById('importImage')?.value.trim();
  const sourceUrl = document.getElementById('importSourceUrl')?.value;

  // Parse ingredients from textarea
  const ingredientsText = document.getElementById('importIngredients')?.value || '';
  const ingredientsData = JSON.parse(document.getElementById('importIngredientsData')?.value || '[]');

  // Parse instructions from textarea
  const instructionsText = document.getElementById('importInstructions')?.value || '';
  const instructions = instructionsText
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);

  if (!title) {
    showError('Please enter a recipe title');
    return;
  }

  // Create recipe object
  const recipe = {
    id: `recipe_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title: title,
    category: category,
    servings: servings,
    prepTime: prepTime,
    cookTime: cookTime,
    ingredientsRows: ingredientsData.map(ing => ({
      qty: ing.amount || '',
      unit: ing.unit || '',
      name: ing.item || '',
      group: ing.group || 'Other'
    })),
    instructions: instructions.join('\n'),
    notes: notes,
    image: image || null,
    sourceUrl: sourceUrl,
    sourceType: 'imported',
    favorite: false,
    isDraft: false,
    createdAt: new Date().toISOString()
  };

  closeModal();
  state.isLoading = true;
  render();

  try {
    await storage.create(recipe);
    showToast(`"${title}" imported successfully!`, 'success');
  } catch (e) {
    console.error('Save error:', e);
    showError('Failed to save recipe');
  } finally {
    state.isLoading = false;
    render();
  }
}

// ===== RENDER FUNCTIONS =====

function renderFreestyleMeals() {
  const freestyleMeals = state.freestyleMeals || [];
  const allTags = getAllFreestyleTags();

  // Get pantry items and seasoning blends for # autocomplete
  const pantryItems = state.inventory.map(i => ({ name: i.name, type: 'pantry' }));
  const seasoningBlends = (state.seasoningBlends || []).map(b => ({ name: b.name, type: 'blend' }));

  // Filter meals
  let filteredMeals = [...freestyleMeals];

  if (state.freestyleFilterTag) {
    filteredMeals = filteredMeals.filter(m => (m.tags || []).includes(state.freestyleFilterTag));
  }

  if (state.freestyleSearchTerm) {
    const search = state.freestyleSearchTerm.toLowerCase();
    filteredMeals = filteredMeals.filter(m =>
      (m.narrative || m.notes || '').toLowerCase().includes(search)
    );
  }

  // Sort by date descending
  filteredMeals.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
  });

  const userCount = state.recipes.filter(r => !r.isDraft && !r.isTip && r.sourceType === 'user').length;
  const freestyleCount = state.freestyleMeals.length;
  const chefiqCount = state.recipes.filter(r => !r.isDraft && !r.isTip && r.sourceType === 'chefiq').length;

  return `
    <div class="p-2 max-w-7xl mx-auto">
      <!-- Tab Navigation -->
      <div class="flex items-center justify-between mb-2 gap-2">
        <div class="flex items-center gap-1 flex-wrap">
        <button onclick="state.recipeTab = 'user'; render();"
            class="px-2 py-1 rounded"
            style="background:transparent; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
            My Recipes (${userCount})
          </button>
          <button onclick="state.recipeTab = 'freestyle'; render();"
            class="px-2 py-1 rounded"
            style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
            Meal Journal (${freestyleCount})
          </button>
          <button onclick="state.recipeTab = 'chefiq'; render();"
            class="px-2 py-1 rounded"
            style="background:transparent; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
            Chef IQ (${chefiqCount})
          </button>
          <button onclick="state.recipeTab = 'imported'; render();"
            class="px-2 py-1 rounded"
            style="background:transparent; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
            Imported (${state.recipes.filter(r => !r.isDraft && !r.isTip && r.sourceType === 'imported').length})
          </button>
        </div>
        <button type="button" onclick="openNewFreestyle()"
          class="px-3 py-1.5 rounded button-hover"
          style="background:${CONFIG.secondary_action_color}; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.8}px;">
          + New Entry
        </button>
      </div>

      <!-- Filters & View Toggle -->
      <div class="mb-3 p-3 rounded" style="background:${CONFIG.surface_color};">
        <div class="flex items-center justify-between gap-2 mb-2">
          <input type="text" id="freestyleSearchInput" placeholder="Search meals..."
            class="flex-1 px-3 py-2 rounded"
            style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1);"
            value="${esc(state.freestyleSearchTerm || '')}"
            oninput="state.freestyleSearchTerm = this.value; _debouncedRender(this, 'freestyleSearch');" />

          <div class="flex gap-1">
            <button onclick="state.freestyleViewMode = 'list'; render();"
              class="px-3 py-2 rounded"
              style="background:${state.freestyleViewMode === 'list' ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; color:${CONFIG.text_color};">
              list
            </button>
            <button onclick="state.freestyleViewMode = 'grid'; render();"
              class="px-3 py-2 rounded"
              style="background:${state.freestyleViewMode === 'grid' ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; color:${CONFIG.text_color};">
              grid
            </button>
          </div>
        </div>

        ${allTags.length > 0 ? `
          <div class="flex gap-1 flex-wrap">
            <button onclick="state.freestyleFilterTag = null; render();"
              class="px-2 py-1 rounded text-sm"
              style="background:${!state.freestyleFilterTag ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; color:${CONFIG.text_color};">
              All
            </button>
            ${allTags.map(tag => `
              <button onclick="state.freestyleFilterTag = '${tag}'; render();"
                class="px-2 py-1 rounded text-sm"
                style="background:${state.freestyleFilterTag === tag ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; color:${CONFIG.text_color};">
                #${esc(tag)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

     ${filteredMeals.length === 0 ? `
      <div class="p-8 rounded text-center" style="background:${CONFIG.surface_color}; color:${CONFIG.text_color};">
          <div style="font-size:${CONFIG.font_size * 1.1}px; margin-bottom:0.5rem;">No journal entries yet</div>
          <div style="opacity:0.7; font-size:${CONFIG.font_size * 0.9}px; margin-bottom:1rem;">
            Log meals you've cooked — use @recipe to link recipes & #ingredient to tag what you used
          </div>
          <button onclick="openNewFreestyle()"
            class="px-4 py-2 rounded button-hover"
            style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color};">
            + Add Your First Entry
          </button>
        </div>
      ` : state.freestyleViewMode === 'grid' ? `
        <!-- Grid View -->
        <div class="freestyle-grid">
          ${filteredMeals.map(meal => {
            const narrativeHtml = narrativeToHtml(meal.narrative || meal.notes || '');

            return `
              <div class="rounded-lg overflow-hidden cursor-pointer card-hover"
                onclick="editFreestyle('${meal.id}')"
                style="background:${CONFIG.surface_color}; border:1px solid rgba(255,255,255,0.08);">
                ${meal.image_url ? `
                  <div style="height:180px; overflow:hidden;">
                    <img loading="lazy" src="${esc(meal.image_url)}" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
              ` : `
                  <div style="height:180px; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center;">
                  </div>
                `}
                <div class="p-3">
                  <div style="color:${CONFIG.text_color}; opacity:0.6; font-size:${CONFIG.font_size * 0.75}px; margin-bottom:8px;">
                    ${new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.9}px; line-height:1.5; max-height:60px; overflow:hidden;">
                    ${narrativeHtml || '<span style="opacity:0.5;">No description</span>'}
                  </div>
                  ${(meal.tags || []).length > 0 ? `
                    <div class="flex gap-1 flex-wrap mt-2">
                      ${meal.tags.slice(0, 3).map(tag => `
                        <span style="color:${CONFIG.primary_action_color}; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight}; letter-spacing: ${CONFIG.type_micro_tracking};">#${esc(tag)}</span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <!-- List View -->
        <div class="space-y-3">
          ${filteredMeals.map(meal => {
            const narrativeHtml = narrativeToHtml(meal.narrative || meal.notes || '');

            return `
              <div class="rounded-lg overflow-hidden" style="background:${CONFIG.surface_color}; border:1px solid rgba(255,255,255,0.08);">
                <div class="flex gap-4">
                  ${meal.image_url ? `
                    <div style="width:120px; height:120px; flex-shrink:0; overflow:hidden;">
                      <img loading="lazy" src="${esc(meal.image_url)}" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                  ` : ''}
                  <div class="flex-1 p-3">
                    <div class="flex justify-between items-start mb-2">
                      <div style="color:${CONFIG.text_color}; opacity:0.6; font-size:${CONFIG.font_size * 0.8}px;">
                        ${new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div class="flex gap-1">
                        <button onclick="event.stopPropagation(); editFreestyle('${meal.id}')"
                          class="px-2 py-1 rounded button-hover"
                          style="background:rgba(255,255,255,0.1); color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
                          Edit
                        </button>
                        <button onclick="event.stopPropagation(); if(confirm('Delete this freestyle meal?')) deleteFreestyle('${meal.id}')"
                          class="px-2 py-1 rounded button-hover"
                          style="background:rgba(220,38,38,0.8); color:white; font-size:${CONFIG.font_size * 0.75}px;">
                          Delete
                        </button>
                      </div>
                    </div>

                    <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.95}px; line-height:1.6;">
                      ${narrativeHtml || '<span style="opacity:0.5;">No description</span>'}
                    </div>

                    ${(meal.tags || []).length > 0 ? `
                      <div class="flex gap-1 flex-wrap mt-2">
                        ${meal.tags.map(tag => `
                          <span class="px-2 py-0.5 rounded" style="background:rgba(232, 93, 93, 0.2); color:${CONFIG.primary_action_color}; font-size:${CONFIG.font_size * 0.75}px;">
                            #${esc(tag)}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderFreestyleEditHeader(form) {
  return `
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 1.3}px;">
        ${form.id ? 'Edit' : 'New'} Journal Entry
      </h2>
      <div class="flex gap-2">
        <button onclick="state.freestyleForm = null; state.currentView = 'recipes'; state.recipeTab = 'freestyle'; render();"
          class="px-3 py-1.5 rounded button-hover"
          style="background:${CONFIG.secondary_action_color}; color:${CONFIG.text_color};">
          Cancel
        </button>
        <button onclick="saveFreestyle()"
          class="px-3 py-1.5 rounded button-hover"
          style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color};">
          Save
        </button>
      </div>
    </div>
  `;
}

function renderFreestyleEditMentionDropdown(dropdownItems) {
  if (!state.mentionDropdownVisible) return '';

  return `
    <div style="background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-height: 250px; overflow-y: auto;"> ${dropdownItems.length > 0 ? `
        ${state.mentionDropdownType === '@' ? dropdownItems.map((item, i) => `
          <div style="padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; ${i === state.mentionDropdownIndex ? 'background: rgba(232,93,93,0.15);' : ''} color: ${CONFIG.text_color};"
            onmouseover="this.style.background='rgba(232,93,93,0.1)'"
            onmouseout="this.style.background='${i === state.mentionDropdownIndex ? 'rgba(232,93,93,0.15)' : 'transparent'}'"
            onclick="selectMention(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <span>${esc(item.title)}</span>
            <span style="opacity: 0.4; font-size: ${CONFIG.type_micro};">recipe</span>
          </div>
        `).join('') : dropdownItems.map((item, i) => `
          <div style="padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; ${i === state.mentionDropdownIndex ? 'background: rgba(232,93,93,0.15);' : ''} color: ${CONFIG.text_color};"
            onmouseover="this.style.background='rgba(232,93,93,0.1)'"
            onmouseout="this.style.background='${i === state.mentionDropdownIndex ? 'rgba(232,93,93,0.15)' : 'transparent'}'"
            onclick="selectMention(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <span>${esc(item.name)}</span>
            <span style="opacity: 0.4; font-size: ${CONFIG.type_micro};">${item.type === 'blend' ? 'blend' : item.type === 'pantry' ? 'pantry' : item.type === 'custom' ? 'new' : 'ingredient'}</span>
          </div>
        `).join('')}
      ` : `
        <div style="padding: 12px; color: ${CONFIG.text_muted}; text-align: center; font-size: ${CONFIG.type_caption};">
          ${state.mentionDropdownType === '@' ? 'No recipes found' : 'Type to search or add new'}
        </div>
      `}
    </div>
  `;
}

function renderFreestyleEditFields(form, allTags, dropdownItems) {
  return `
    <!-- Date -->
    <div class="mb-4">
      <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">Date</label>
      <input type="date" value="${form.date || ''}"
        onchange="state.freestyleForm.date = this.value"
        class="w-full px-3 py-2 rounded"
        style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1);" />
    </div>

    <!-- Photo -->
    <div class="mb-4">
      <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">Photo</label>
      ${form.image_url ? `
        <div class="relative mb-2">
          <img loading="lazy" src="${esc(form.image_url)}" class="w-full rounded" style="max-height:200px; object-fit:cover;" />
          <button onclick="state.freestyleForm.image_url = ''; render();"
            class="absolute top-2 right-2 px-2 py-1 rounded"
            style="background:rgba(220,38,38,0.9); color:white;">
            Remove
          </button>
        </div>
      ` : `
        <div class="mb-3 p-6 rounded border-2 border-dashed text-center cursor-pointer"
          style="border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.05);"
          onclick="document.getElementById('freestylePhotoInput').click();">
          <div style="font-size:2rem; margin-bottom:8px; opacity:0.5;">camera</div>
          <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.9}px;">
            Tap to take or choose a photo
          </div>
          <div style="color:${CONFIG.text_color}; opacity:0.5; font-size:${CONFIG.font_size * 0.75}px; margin-top:4px;">
            or paste a URL below
          </div>
        </div>
        <input type="file"
          id="freestylePhotoInput"
          accept="image/*"
          onchange="handleFreestylePhotoUpload(event)"
          style="display:none;" />
      `}
      <input type="text" placeholder="Or paste image URL..."
        value="${esc(form.image_url || '')}"
        onchange="state.freestyleForm.image_url = this.value; render();"
        class="w-full px-3 py-2 rounded"
        style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1);" />
    </div>

    <!-- Narrative with @mentions -->
    <div class="mb-4" style="position: relative;">
      <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">
        What did you make?
      </label>
      <div class="mb-2 p-2 rounded" style="background:rgba(232, 93, 93, 0.1); font-size:${CONFIG.font_size * 0.8}px; color:${CONFIG.text_color};">
        Type <span class="mention-tag">@</span> to link a recipe • Type <span class="record-tag">#</span> to tag ingredients or seasonings you used
      </div>

      <div style="position: relative;">
        <textarea
          id="narrativeEditor"
          class="narrative-editor w-full px-3 py-2 rounded"
          style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1); min-height:120px; font-size:${CONFIG.font_size}px; line-height:1.6;"
          placeholder="Made @jerk-chicken tonight with #chicken-thighs and #my-jerk-seasoning. Came out great, kids loved it!"
          oninput="handleNarrativeInput(event)"
          onkeydown="handleNarrativeKeydown(event)"
        >${esc(form.narrative || '')}</textarea>

        <div id="mentionDropdownContainer" style="position: absolute; left: 0; right: 0; top: 100%; z-index: 1000;">
          ${renderFreestyleEditMentionDropdown(dropdownItems)}
        </div>
      </div>

      <!-- To Record Checkbox -->
      <div class="mb-4 p-3 rounded" style="background:rgba(255,214,10,0.1); border:1px solid rgba(255,214,10,0.3);">
        <label class="flex items-center gap-3 cursor-pointer" style="color:${CONFIG.text_color};">
          <input type="checkbox"
            ${form.toRecord ? 'checked' : ''}
            onchange="state.freestyleForm.toRecord = this.checked; render();"
            style="width: 20px; height: 20px;" />
          <div>
            <div style="font-weight: 600;">To Record</div>
            <div style="font-size: 12px; opacity: 0.7;">Mark this if you want to record/document this recipe later</div>
          </div>
        </label>
      </div>

      <!-- AI Cleanup Button -->
      <div class="mb-4">
        <button type="button" onclick="cleanupNarrativeWithAI()"
          class="w-full px-4 py-3 rounded button-hover flex items-center justify-center gap-2"
          style="background: ${CONFIG.surface_elevated}; color: white; font-weight: 600;">
          Clean up with AI
        </button>
        <div style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-align: center; margin-top: 4px;">
          Organize your narrative and extract ingredients used
        </div>
      </div>

      <!-- Used Ingredients (auto-extracted) -->
      ${(form.usedIngredients || []).length > 0 ? `
        <div class="mb-4 p-3 rounded" style="background:${CONFIG.background_color};">
          <div style="font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 8px;">Used:</div>
          <div class="flex flex-wrap gap-2">
            ${form.usedIngredients.map(ing => `
              <span class="px-2 py-1 rounded" style="background: rgba(34, 197, 94, 0.2); color: ${CONFIG.success_color}; font-size: ${CONFIG.type_caption};">
                #${esc(ing)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Tags -->
    <div class="mb-4">
      <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">Tags</label>

      ${(form.tags || []).length > 0 ? `
        <div class="flex flex-wrap gap-1 mb-2">
          ${form.tags.map(tag => `
            <span class="px-2 py-1 rounded flex items-center gap-1"
              style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.8}px;">
              #${esc(tag)}
              <button onclick="removeFreestyleTag('${tag}')" style="color:white; font-weight:bold;">x</button>
            </span>
          `).join('')}
        </div>
      ` : ''}

      <div class="flex gap-2">
        <input type="text" id="newTagInput" placeholder="Add tag..."
          onkeydown="if(event.key === 'Enter') { addFreestyleTag(this.value); this.value = ''; event.preventDefault(); }"
          class="flex-1 px-3 py-2 rounded"
          style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1);" />
        <button onclick="addFreestyleTag(document.getElementById('newTagInput').value); document.getElementById('newTagInput').value = '';"
          class="px-3 py-2 rounded button-hover"
          style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color};">
          Add
        </button>
      </div>

      ${allTags.length > 0 ? `
        <div class="mt-2">
          <div style="color:${CONFIG.text_color}; opacity:0.6; font-size:${CONFIG.font_size * 0.75}px; margin-bottom:4px;">Quick add:</div>
          <div class="flex flex-wrap gap-1">
            ${allTags.filter(t => !(form.tags || []).includes(t)).slice(0, 10).map(tag => `
              <button onclick="addFreestyleTag('${tag}')"
                class="px-2 py-1 rounded"
                style="background:rgba(255,255,255,0.1); color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px;">
                #${esc(tag)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderFreestyleEdit() {
  const form = state.freestyleForm || {};
  const allTags = getAllFreestyleTags();
  const dropdownItems = state.mentionDropdownVisible ? getMentionDropdownItems() : [];

  return `
    <div class="p-4 max-w-2xl mx-auto">
      ${renderFreestyleEditHeader(form)}
      <div class="rounded p-4" style="background:${CONFIG.surface_color};">
        ${renderFreestyleEditFields(form, allTags, dropdownItems)}
      </div>
    </div>
  `;
}

function renderIngredientGrid() {
  if (!state.recipeForm) return '';

  return `
    <div class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="font-semibold" style="color:${CONFIG.text_color};">Ingredients</label>
        <div class="flex gap-2">
          <button type="button" onclick="showBulkImportModal()"
            class="px-3 py-2 rounded button-hover"
            style="background:${CONFIG.secondary_action_color}; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.9}px;">
            Bulk Import
          </button>
          <button type="button" onclick="addIngRow()"
            class="px-3 py-2 rounded button-hover"
            style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color};">+ Add</button>
        </div>
      </div>

      <div class="rounded overflow-hidden" style="border:1px solid rgba(255,255,255,0.08);">
        <div class="grid" style="grid-template-columns:110px 120px 1fr 160px 56px; background:rgba(255,255,255,0.04);">
          <div class="p-3 font-semibold" style="color:${CONFIG.text_color}; opacity:.85;">Amt</div>
          <div class="p-3 font-semibold" style="color:${CONFIG.text_color}; opacity:.85;">Unit</div>
          <div class="p-3 font-semibold" style="color:${CONFIG.text_color}; opacity:.85;">Ingredient</div>
          <div class="p-3 font-semibold" style="color:${CONFIG.text_color}; opacity:.85;">Group</div>
          <div class="p-3"></div>
        </div>

        ${(state.recipeForm.ingredientsRows || []).map((row, i) => `
          <div class="grid items-center" style="grid-template-columns:110px 120px 1fr 160px 56px; border-top:1px solid rgba(255,255,255,0.06);">
            <div class="p-2">
              <input class="w-full px-3 py-2 rounded border"
                style="background:rgba(0,0,0,0.16); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.10);"
                value="${esc(row.qty || '')}"
                oninput="setIng(${i},'qty',this.value)" />
            </div>

            <div class="p-2">
              <input class="w-full px-3 py-2 rounded border" placeholder="e.g. lb"
                style="background:rgba(0,0,0,0.16); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.10);"
                value="${esc(row.unit || '')}"
                oninput="setIng(${i},'unit',this.value)" />
            </div>

            <div class="p-2">
              <input class="w-full px-3 py-2 rounded border" placeholder="e.g. Chicken breast"
                style="background:rgba(0,0,0,0.16); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.10);"
                value="${esc(row.name || '')}"
                oninput="setIng(${i},'name',this.value)" />
            </div>

            <div class="p-2">
              <select class="w-full px-3 py-2 rounded border"
                style="background:rgba(0,0,0,0.16); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.10);"
                onchange="setIng(${i},'group',this.value)">
                ${ING_GROUPS.map(g => `<option value="${g}" ${(row.group || 'Produce') === g ? 'selected' : ''}>${g}</option>`).join('')}
              </select>
            </div>

            <div class="p-2 flex justify-center">
              <button type="button" onclick="delIngRow(${i})"
                class="w-10 h-10 rounded button-hover"
                style="background:rgba(220,38,38,0.75); color:white;">x</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderRecipeFilterPills() {
  // Primary filter row: All | Saved | Breakfast | Lunch | Dinner | Snack
  const primaryPill = state.recipePrimaryFilter || 'all';
  const primaryFilters = [
    { id: 'all', label: 'All' },
    { id: 'saved', label: 'Saved' },
    { id: 'plates', label: 'Plates' },
    { id: 'Breakfast', label: 'Breakfast' },
    { id: 'Lunch', label: 'Lunch' },
    { id: 'Dinner', label: 'Dinner' },
    { id: 'Snack', label: 'Snack' }
  ];

  const primaryRow = primaryFilters.map(f => {
    const active = primaryPill === f.id;
    return `<button onclick="state.recipePrimaryFilter = '${f.id}'; render();"
      style="flex-shrink:0; padding:8px 16px; border-radius:20px; border:none;
      background:${active ? CONFIG.primary_action_color : 'transparent'};
      color:${active ? 'white' : CONFIG.text_muted};
      font-size:13px; font-weight:${active ? '600' : '500'}; cursor:pointer; white-space:nowrap;">
      ${f.label}</button>`;
  }).join('');

  // Secondary filters (collapsible)
  const showSecondary = state.recipeShowSecondaryFilters || false;
  const sourcesToggles = state.recipeSourceToggles || {};
  const effortToggles = state.recipeEffortToggles || {};

  const sourceOptions = [
    { id: 'user', label: 'My Recipes' },
    { id: 'chefiq', label: 'ChefIQ' },
    { id: 'claude', label: 'Claude' },
    { id: 'imported', label: 'Imported' }
  ];
  const effortOptions = [
    { id: 'lazy', label: 'Lazy' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'timely', label: 'Timely' },
    { id: 'uncategorized', label: 'Uncategorized' }
  ];

  const activeSecondaryCount = Object.values(sourcesToggles).filter(Boolean).length + Object.values(effortToggles).filter(Boolean).length;

  const secondaryRow = showSecondary ? `
    <div style="display:flex; gap:4px; flex-wrap:wrap; padding:0 12px 8px;">
      <span style="font-size:10px; color:${CONFIG.text_tertiary}; align-self:center; margin-right:2px;">Source:</span>
      ${sourceOptions.map(s => {
        const active = !!sourcesToggles[s.id];
        return `<button onclick="if(!state.recipeSourceToggles) state.recipeSourceToggles = {}; state.recipeSourceToggles['${s.id}'] = !state.recipeSourceToggles['${s.id}']; render();"
          style="flex-shrink:0; padding:4px 10px; border-radius:12px;
          border:1px solid ${active ? 'rgba(232,93,93,0.3)' : 'rgba(255,255,255,0.08)'};
          background:${active ? 'rgba(232,93,93,0.1)' : 'transparent'};
          color:${active ? CONFIG.primary_action_color : CONFIG.text_tertiary};
          font-size:11px; font-weight:${active ? '600' : '400'}; cursor:pointer; white-space:nowrap;">
          ${s.label}</button>`;
      }).join('')}
      <span style="width:1px; height:16px; background:rgba(255,255,255,0.06); flex-shrink:0; margin:0 4px; align-self:center;"></span>
      <span style="font-size:10px; color:${CONFIG.text_tertiary}; align-self:center; margin-right:2px;">Effort:</span>
      ${effortOptions.map(e => {
        const active = !!effortToggles[e.id];
        const effortDef = EFFORT_LEVELS[e.id];
        const clr = effortDef ? effortDef.color : CONFIG.text_tertiary;
        return `<button onclick="if(!state.recipeEffortToggles) state.recipeEffortToggles = {}; state.recipeEffortToggles['${e.id}'] = !state.recipeEffortToggles['${e.id}']; render();"
          style="flex-shrink:0; padding:4px 10px; border-radius:12px;
          border:1px solid ${active ? (effortDef ? effortDef.border : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.08)'};
          background:${active ? (effortDef ? effortDef.bg : 'rgba(255,255,255,0.05)') : 'transparent'};
          color:${active ? clr : CONFIG.text_tertiary};
          font-size:11px; font-weight:${active ? '600' : '400'}; cursor:pointer; white-space:nowrap;">
          ${e.label}</button>`;
      }).join('')}
    </div>
  ` : '';

  return `
    <!-- Primary filter row -->
    <div style="display:flex; gap:6px; overflow-x:auto; padding:8px 12px 6px; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
      ${primaryRow}
    </div>
    <!-- Filters toggle + secondary row -->
    <div style="padding:0 12px 4px;">
      <button onclick="state.recipeShowSecondaryFilters = !state.recipeShowSecondaryFilters; render();"
        style="background:none; border:none; color:${CONFIG.text_tertiary}; font-size:11px; cursor:pointer; padding:2px 0; display:flex; align-items:center; gap:4px;">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="transform:rotate(${showSecondary ? '180' : '0'}deg); transition:transform 0.2s;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
        Filters${activeSecondaryCount > 0 ? ` (${activeSecondaryCount})` : ''}
      </button>
    </div>
    ${secondaryRow}
  `;
}

function _renderPillBtn(label, active, onclick, colors) {
  const borderColor = active ? (colors?.border || 'rgba(232,93,93,0.4)') : 'rgba(255,255,255,0.12)';
  const bgColor = active ? (colors?.bg || 'rgba(232,93,93,0.15)') : 'transparent';
  const txtColor = active ? (colors?.text || CONFIG.primary_action_color) : CONFIG.text_muted;
  const fw = active ? '600' : '400';
  return `<button onclick="${onclick}" style="flex-shrink:0;padding:6px 10px;border-radius:16px;border:1px solid ${borderColor};background:${bgColor};color:${txtColor};font-size:12px;font-weight:${fw};cursor:pointer;white-space:nowrap;">${label}</button>`;
}

function showEffortContextMenu(event, recipeId, recipeName) {
  event.preventDefault();
  event.stopPropagation();
  // Remove existing menu if any
  const existing = document.getElementById('effort-context-menu');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.id = 'effort-context-menu';
  const currentEffort = getRecipeEffort(recipeId);
  menu.innerHTML = `
    <div style="position:fixed; inset:0; z-index:999;" onclick="this.parentElement.remove()"></div>
    <div style="position:fixed; left:${Math.min(event.clientX || event.touches?.[0]?.clientX || 100, window.innerWidth - 180)}px; top:${Math.min(event.clientY || event.touches?.[0]?.clientY || 100, window.innerHeight - 160)}px; z-index:1000; background:${CONFIG.surface_elevated}; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.5); overflow:hidden; min-width:160px;">
      <div style="padding:10px 14px; font-size:11px; color:${CONFIG.text_muted}; border-bottom:1px solid rgba(255,255,255,0.06);">Set effort</div>
      ${Object.entries(EFFORT_LEVELS).map(([key, e]) => `
        <div onclick="event.stopPropagation(); setRecipeEffort('${recipeId}', ${currentEffort === key ? 'null' : `'${key}'`}); document.getElementById('effort-context-menu').remove(); showToast(${currentEffort === key ? `'Removed effort from ${recipeName.replace(/'/g, "\\'")}'` : `'Set ${recipeName.replace(/'/g, "\\'")} as ${e.label}'`}, 'success'); render();"
          style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; color:${currentEffort === key ? e.color : CONFIG.text_color}; background:${currentEffort === key ? e.bg : 'transparent'};"
          onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='${currentEffort === key ? e.bg : 'transparent'}'">
          <span style="width:8px; height:8px; border-radius:50%; background:${e.color};"></span>
          ${e.label}
        </div>
      `).join('')}
      <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
      <div onclick="event.stopPropagation(); document.getElementById('effort-context-menu').remove(); showAddToMealsModal('${recipeId}');"
        style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; color:${CONFIG.primary_action_color};"
        onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
        Add to My Meals
      </div>
    </div>
  `;
  document.body.appendChild(menu);
}

function showRecipeMoreFilters() {
  const content = `
    <div style="color:${CONFIG.text_color};">
      <h3 style="font-size:17px;font-weight:600;margin-bottom:12px;">Filters</h3>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <input id="recipeModalSearchInput" placeholder="${state.searchByIngredient ? 'Search by ingredient...' : 'Search recipes...'}"
          style="flex:1;padding:8px 12px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:13px;"
          value="${esc(state.searchTerm || '')}" />
        <button onclick="state.searchByIngredient = !state.searchByIngredient; document.getElementById('recipeModalSearchInput').placeholder = state.searchByIngredient ? 'Search by ingredient...' : 'Search recipes...';"
          style="padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;background:${state.searchByIngredient ? CONFIG.primary_action_color : CONFIG.surface_color};color:${state.searchByIngredient ? 'white' : CONFIG.text_color};">
          ${state.searchByIngredient ? 'Ingredient' : 'Name'}
        </button>
      </div>
      <select id="recipeModalCategory" style="width:100%;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);font-size:13px;padding:8px;border-radius:8px;margin-bottom:16px;">
        <option value="All" ${state.selectedCategory === 'All' ? 'selected' : ''}>All Categories</option>
        ${MEAL_CATEGORIES.map(c => `<option value="${c}" ${state.selectedCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;">
        <button onclick="state.searchTerm = document.getElementById('recipeModalSearchInput').value; state.selectedCategory = document.getElementById('recipeModalCategory').value; closeModal(); render();"
          style="flex:1;padding:10px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Apply</button>
        <button onclick="state.searchTerm='';state.selectedCategory='All';state.searchByIngredient=false;state.filterIngredientGroup='all';closeModal();render();"
          style="flex:1;padding:10px;background:${CONFIG.surface_color};color:${CONFIG.text_color};border:none;border-radius:8px;font-size:14px;cursor:pointer;">Reset</button>
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;">
        <button onclick="closeModal();showImportRecipeModal();" style="flex:1;padding:10px;background:${CONFIG.surface_color};color:${CONFIG.text_color};border:none;border-radius:8px;font-size:13px;cursor:pointer;">Import Recipe</button>
        <button onclick="closeModal();openNewRecipe();" style="flex:1;padding:10px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">+ New Recipe</button>
      </div>
      <div style="margin-top:8px;">
        <button onclick="closeModal();openNewBatchRecipe();" style="width:100%;padding:10px;background:${CONFIG.surface_color};color:${CONFIG.primary_action_color};border:1px solid rgba(232,93,93,0.2);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">+ Build a Plate</button>
      </div>
    </div>
  `;
  openModal(content);
}

function renderRecipes() {
  if (!state.recipes || !Array.isArray(state.recipes)) return '<div class="p-3">Loading...</div>';

  // Build the full recipe list (all sources, no tabs)
  let list = state.recipes.filter(r => !r.isDraft && !r.isTip);

  // Apply primary filter
  const primaryFilter = state.recipePrimaryFilter || 'all';
  const showPlatesOnly = primaryFilter === 'plates';
  if (primaryFilter === 'saved') {
    list = list.filter(r => isRecipeSaved(r.__backendId || r.id));
  } else if (['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(primaryFilter)) {
    list = list.filter(r => (r.category || '') === primaryFilter);
  }
  // 'all' shows everything

  // Get batch recipes for display
  let batchList = state.batchRecipes || [];
  if (['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(primaryFilter)) {
    batchList = batchList.filter(b => capitalize(b.mealType || '') === primaryFilter);
  } else if (primaryFilter === 'saved') {
    batchList = []; // Batch recipes don't have a saved/bookmark state
  }
  if (state.searchTerm) {
    const sl = state.searchTerm.toLowerCase();
    batchList = batchList.filter(b => (b.name || '').toLowerCase().includes(sl));
  }

  // Apply secondary source toggles (if any active, filter to those sources)
  const sourcesToggles = state.recipeSourceToggles || {};
  const activeSources = Object.entries(sourcesToggles).filter(([, v]) => v).map(([k]) => k);
  if (activeSources.length > 0) {
    list = list.filter(r => activeSources.includes(r.sourceType || 'user'));
  }

  // Apply secondary effort toggles (if any active, filter to those efforts)
  const effortToggles = state.recipeEffortToggles || {};
  const activeEfforts = Object.entries(effortToggles).filter(([, v]) => v).map(([k]) => k);
  if (activeEfforts.length > 0) {
    list = list.filter(r => {
      const effort = getRecipeEffort(r.__backendId || r.id);
      if (activeEfforts.includes('uncategorized') && effort === null) return true;
      return effort && activeEfforts.includes(effort);
    });
  }

  // Apply search (name + ingredients)
  if (state.searchTerm) {
    const searchLower = state.searchTerm.toLowerCase();
    list = list.filter(r => {
      if ((r.title || '').toLowerCase().includes(searchLower)) return true;
      const ingredients = recipeIngList(r);
      return ingredients.some(ing => (ing.name || '').toLowerCase().includes(searchLower));
    });
  }

  return `
    <div style="padding: 0; max-width: 100%; overflow-x: hidden;">
      <!-- Search bar -->
      <div style="padding: 8px 12px 0;">
        <div style="position:relative;">
          <input id="recipesPageSearchInput" type="text" placeholder="Search recipes or ingredients..."
            value="${esc(state.searchTerm || '')}"
            oninput="handleRecipesPageSearch(this.value)"
            style="width:100%; height:40px; padding:0 36px 0 12px; box-sizing:border-box;
            background:${CONFIG.surface_color}; color:${CONFIG.text_color};
            border:1px solid rgba(255,255,255,0.08); border-radius:10px;
            font-size:14px; font-family:${CONFIG.font_family};" />
          ${state.searchTerm ? `
            <button onclick="state.searchTerm=''; render(); setTimeout(() => { const i = document.getElementById('recipesPageSearchInput'); if(i) i.focus(); }, 0);"
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
      ${renderRecipeFilterPills()}

      <!-- Build a Plate button -->
      ${!showPlatesOnly ? '' : `
        <div style="padding:8px 12px;">
          <button onclick="openNewBatchRecipe()" style="width:100%; padding:10px; background:${CONFIG.surface_elevated}; color:${CONFIG.primary_action_color}; border:1px solid rgba(232,93,93,0.2); border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;">
            + Build a Plate
          </button>
        </div>
      `}

      <!-- Results -->
      ${(showPlatesOnly ? batchList.length === 0 : list.length === 0 && batchList.length === 0) ? `
        <div style="padding: 48px 12px; text-align: center;">
          <div style="font-size: 14px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 4px;">
            ${state.searchTerm ? 'No matches found' : (showPlatesOnly ? 'No plates yet' : 'No recipes yet')}
          </div>
          <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-bottom: 12px;">
            ${state.searchTerm ? 'Try a different search' : (showPlatesOnly ? 'Build your first plate!' : 'Add your first recipe!')}
          </div>
          ${!state.searchTerm ? `
            <button onclick="${showPlatesOnly ? 'openNewBatchRecipe()' : 'openNewRecipe()'}" style="padding: 8px 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
              ${showPlatesOnly ? '+ Build a Plate' : '+ Add Recipe'}
            </button>
          ` : ''}
        </div>
      ` : `
        <div class="recipes-photo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px;">
          ${!showPlatesOnly ? '' : ''}${batchList.map(b => {
            const bImg = getBatchCoverPhoto(b);
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
              <div style="position:absolute; top:4px; left:4px; z-index:2; display:flex; gap:4px; align-items:center;">
                <div style="width:22px; height:22px; border-radius:5px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
                  <svg width="14" height="14" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>
                </div>
                ${renderEffortPill(getBatchEffortLevel(b), 'sm')}
              </div>
              <div style="padding:6px; background:${CONFIG.background_color};">
                <div style="color:${CONFIG.text_color}; font-size:11px; font-weight:600; -webkit-line-clamp:2; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3;">${esc(b.name)}</div>
              </div>
            </div>`;
          }).join('')}${showPlatesOnly ? '' : list.map(r => {
            const id = r.__backendId || r.id;
            const img = recipeThumb(r);
            const saved = isRecipeSaved(id);
            const effort = getRecipeEffort(id);
            return `
            <div style="position: relative; cursor: pointer; overflow: hidden; border-radius: 8px;" oncontextmenu="event.preventDefault(); showEffortContextMenu(event, '${id}', '${esc(r.title).replace(/'/g, "\\'")}');" ontouchstart="this._longPressTimer = setTimeout(() => { this._didLongPress = true; showEffortContextMenu(event, '${id}', '${esc(r.title).replace(/'/g, "\\'")}'); }, 500);" ontouchend="clearTimeout(this._longPressTimer); if(this._didLongPress) { event.preventDefault(); this._didLongPress = false; }" ontouchmove="clearTimeout(this._longPressTimer);">
              <div onclick="if(this.parentElement._didLongPress) return; openRecipeView('${id}')">
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
              <button onclick="event.stopPropagation(); toggleSaveRecipe('${id}')"
                style="position: absolute; top: 4px; right: 4px; z-index: 2; width: 24px; height: 24px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); color: ${saved ? CONFIG.primary_action_color : 'rgba(255,255,255,0.7)'}; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;">
                <svg width="12" height="12" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
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

function renderRecipeEdit() {
  if (!state.recipeForm) return '';

  return `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6 mobile-stack gap-3">
     <h2 class="font-bold" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 1.6}px;">
          ${state.recipeForm.id ? 'Edit ' : 'New '}${state.recipeForm.isTip ? 'Tip' : 'Recipe'}
        </h2>
       <div class="flex gap-2">
          <button type="button" onclick="closeRecipeEditor()"
            class="px-4 py-2 rounded button-hover"
            style="background:${CONFIG.secondary_action_color}; color:${CONFIG.text_color};">Cancel</button>
          ${state.recipeForm.id ? `
            <button type="button" onclick="if(confirm('Delete this ${state.recipeForm.isTip ? 'tip' : 'recipe'}?')) { deleteRecipe(state.recipeForm); closeRecipeEditor(); }"
              class="px-4 py-2 rounded button-hover"
              style="background:${CONFIG.danger_color}; color:white;">Delete</button>
          ` : ''}
          <button type="button" onclick="saveRecipeForm()"
            class="px-4 py-2 rounded button-hover"
            style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color};">
            ${state.recipeForm.isTip ? 'Save Tip' : 'Save Recipe'}
          </button>
        </div>
      </div>

    <div class="rounded p-6" style="background:${CONFIG.surface_color};">
        <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">${state.recipeForm.isTip ? 'Tip Title' : 'Recipe Title'} *</label>
        <input class="w-full px-4 py-3 rounded border"
          style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
          value="${esc(state.recipeForm.title || '')}"
          oninput="setRecipeField('title', this.value)" />

        <div class="grid md:grid-cols-2 gap-4 mt-5">
          <div>
            <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Category *</label>
            <select class="w-full px-4 py-3 rounded border"
              style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
              onchange="setRecipeField('category', this.value)">
              ${state.recipeForm.isTip ?
                TIP_CATEGORIES.map(c => `
                  <option value="${c}" ${state.recipeForm.category === c ? 'selected' : ''}>${c}</option>
                `).join('') :
                MEAL_CATEGORIES.map(c => `
                  <option value="${c}" ${state.recipeForm.category === c ? 'selected' : ''}>${c}</option>
                `).join('')
              }
            </select>
          </div>

          ${state.recipeForm.isTip ? `
            <div>
              <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Reference URL (optional)</label>
              <input class="w-full px-4 py-3 rounded border" placeholder="https://..."
                style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
                value="${esc(state.recipeForm.recipe_url || '')}"
                oninput="setRecipeField('recipe_url', this.value)" />
            </div>
          ` : `
            <div>
              <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Source Type</label>
              <select class="w-full px-4 py-3 rounded border"
                style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
                onchange="setRecipeField('sourceType', this.value)">
               <option value="user" ${(state.recipeForm.sourceType || 'user') === 'user' ? 'selected' : ''}>User-Created</option>
                <option value="chefiq" ${state.recipeForm.sourceType === 'chefiq' ? 'selected' : ''}>ChefIQ Guided</option>
                <option value="imported" ${state.recipeForm.sourceType === 'imported' ? 'selected' : ''}>Imported</option>
                <option value="claude" ${state.recipeForm.sourceType === 'claude' ? 'selected' : ''}>Chef Claude</option>
              </select>
            </div>
          `}
        </div>

       ${!state.recipeForm.isTip ? `
          <div class="mt-5">
            <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Recipe URL (optional)</label>
            <input class="w-full px-4 py-3 rounded border" placeholder="https://..."
              style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
              value="${esc(state.recipeForm.recipe_url || '')}"
              oninput="setRecipeField('recipe_url', this.value)" />
          </div>
        ` : ''}

        <div class="mt-5">
          <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Image</label>

          <!-- Tab Selection -->
          <div class="flex gap-2 mb-3">
            <button type="button"
              onclick="document.getElementById('imageUrlTab').style.display='block'; document.getElementById('imageUploadTab').style.display='none'; this.style.background='${CONFIG.primary_action_color}'; this.nextElementSibling.style.background='rgba(255,255,255,0.05)';"
              class="px-3 py-2 rounded button-hover"
              style="background:${CONFIG.primary_action_color}; color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.9}px;">
              Image URL
            </button>
            <button type="button"
              onclick="document.getElementById('imageUrlTab').style.display='none'; document.getElementById('imageUploadTab').style.display='block'; this.style.background='${CONFIG.primary_action_color}'; this.previousElementSibling.style.background='rgba(255,255,255,0.05)';"
              class="px-3 py-2 rounded button-hover"
              style="background:rgba(255,255,255,0.05); color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.9}px;">
              Upload Image
            </button>
          </div>

          <!-- Image URL Tab -->
          <div id="imageUrlTab">
            <input class="w-full px-4 py-3 rounded border" placeholder="Paste image URL here"
              style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12);"
              value="${esc(state.recipeForm.image_url || '')}"
              oninput="setRecipeField('image_url', this.value)" />
            <p style="color:${CONFIG.text_color}; opacity:0.6; font-size:${CONFIG.font_size * 0.85}px; margin-top:8px;">
              Enter a URL to an image hosted online
            </p>
          </div>

          <!-- Image Upload Tab -->
          <div id="imageUploadTab" style="display:none;">
            <div class="rounded border-2 border-dashed p-6 text-center"
              style="border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.05);">
              <input type="file" id="imageUploadInput" accept="image/*"
                onchange="handleImageUpload(event)"
                class="hidden" />
              <label for="imageUploadInput" class="cursor-pointer">
                <div style="font-size:3rem; margin-bottom:0.5rem;">camera</div>
                <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size}px; margin-bottom:0.5rem;">
                  Click to upload or drag image here
                </div>
                <div style="color:${CONFIG.text_color}; opacity:0.6; font-size:${CONFIG.font_size * 0.85}px;">
                  Supports JPG, PNG, GIF (max 5MB)
                </div>
              </label>
            </div>
          </div>

          <!-- Image Preview -->
          ${state.recipeForm.image_url ? `
            <div class="mt-4 rounded overflow-hidden relative" style="border:1px solid rgba(255,255,255,0.08);">
              <img loading="lazy" src="${state.recipeForm.image_url}"
                   alt="Recipe preview"
                   onerror="this.parentElement.querySelector('.error-msg').style.display='block'; this.style.display='none';"
                   style="width:100%; max-height:260px; object-fit:cover;" />
              <div class="error-msg p-4 text-center" style="display:none; color:${CONFIG.danger_color}; background:rgba(220,38,38,0.1);">
                Image failed to load. The URL might be invalid or blocked.
              </div>
              <button type="button" onclick="removeImage()"
                class="absolute top-2 right-2 px-3 py-1.5 rounded button-hover"
                style="background:rgba(220,38,38,0.9); color:white; font-size:${CONFIG.font_size * 0.85}px;">
                Remove
              </button>
            </div>
            <div class="mt-2 p-2 rounded" style="background:rgba(255,255,255,0.05); color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px; word-break:break-all;">
              <strong>Current URL:</strong> ${state.recipeForm.image_url}
            </div>` : ''}
        </div>

${state.recipeForm.isTip ? '' : renderIngredientGrid()}

        <div class="mt-6">
          <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">
            Step-by-step Instructions (optional)
            <span style="opacity:0.7; font-weight:normal; font-size:${CONFIG.font_size * 0.85}px;"> — Enter each step on a new line</span>
          </label>
          <textarea class="w-full px-4 py-3 rounded border"
            style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12); min-height:180px;"
            placeholder="Step 1: Preheat oven to 350F
Step 2: Mix dry ingredients
Step 3: Add wet ingredients..."
            oninput="setRecipeField('instructions', this.value)">${state.recipeForm.instructions || ''}</textarea>
        </div>

        <div class="mt-6">
          <label class="block mb-2 font-semibold" style="color:${CONFIG.text_color};">Notes (optional)</label>
          <textarea class="w-full px-4 py-3 rounded border"
            style="background:rgba(0,0,0,0.18); color:${CONFIG.text_color}; border-color:rgba(255,255,255,0.12); min-height:120px;"
            oninput="setRecipeField('notes', this.value)">${state.recipeForm.notes || ''}</textarea>
        </div>

      <div class="mt-6">
          <label class="flex items-center gap-2" style="color:${CONFIG.text_color};">
            <input type="checkbox" ${state.recipeForm.isTip ? 'checked' : ''}
              onchange="setRecipeField('isTip', this.checked)">
            Save as Tip/Note (won't appear in meal planning)
          </label>
        </div>
      </div>
    </div>`;
}

function renderRecipeView() {
  const r = getRecipeById(state.selectedRecipeViewId);
  if (!r) return `<div class="p-6" style="color:${CONFIG.text_color};">Recipe not found.</div>`;

  const img = recipeThumb(r);
  const url = (r.recipe_url || '').trim();
  const tags = (r.tags || '').trim();
  const notes = (r.notes || '').trim();
  const instructions = Array.isArray(r.instructions)
    ? r.instructions.join('\n')
    : (r.instructions || '').trim();
  const sourceLabel = r.sourceType === 'chefiq' ? 'ChefIQ Guided' :
                        r.sourceType === 'imported' ? 'Imported' :
                        r.sourceType === 'claude' ? 'Chef Claude' : 'User-Created';
  let rows = [];
  if (Array.isArray(r.ingredientsRows) && r.ingredientsRows.length > 0) {
    rows = r.ingredientsRows;
  } else if (Array.isArray(r.ingredients) && r.ingredients.length > 0) {
    // Handle imported recipes with old format
    rows = r.ingredients.map(ing => ({
      qty: ing.amount || '',
      unit: ing.unit || '',
      name: ing.item || ing.name || '',
      group: ing.group || 'Other'
    }));
  }
  const grouped = {};
  rows.forEach(x => {
    const g = x.group || 'Other';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(x);
  });
  const groupOrder = Object.keys(grouped);

  // Parse instructions into steps - group numbered steps with their sub-instructions
  const instructionSteps = [];
  if (instructions) {
    const lines = instructions.split('\n');
    let currentStep = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if line starts with a number (e.g., "1.", "2.", etc.)
      if (/^\d+[\.\)]\s*/.test(trimmed)) {
        if (currentStep) instructionSteps.push(currentStep);
        currentStep = { header: trimmed, details: [] };
      } else if (currentStep) {
        currentStep.details.push(trimmed);
      } else {
        // Line without a number and no current step - treat as standalone
        instructionSteps.push({ header: null, details: [trimmed] });
      }
    });

    if (currentStep) instructionSteps.push(currentStep);
  }

  // Debug: Log image URL
  console.log('Recipe image URL:', img);

  const recipeId = r.__backendId || r.id;
  const saved = isRecipeSaved(recipeId);
  const externalUrl = url || recipeUrl(r);

  return `
              <div class="p-6 max-w-5xl mx-auto" style="overflow-x:hidden; max-width:100%; box-sizing:border-box;">
      <!-- Compact header row -->
      <nav style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; min-height:36px;">
        <button type="button" onclick="if(window.history.length>1){window.history.back();}else{window.location.href='/recipes.html';}" style="color:${CONFIG.text_color}; background:none; border:none; cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; padding:0;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <span style="color:${CONFIG.text_color}; font-weight:700; font-size:18px; flex:1; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:0 8px;">Recipe</span>
        <div style="display:flex; align-items:center; gap:12px;">
          ${state.viewingFromPlan ? `
            <button type="button" onclick="openRecipePicker('${state.viewingFromPlan.date}', '${state.viewingFromPlan.meal}')"
              style="padding:6px 12px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">
              Change
            </button>
            <button type="button" onclick="if(confirm('Remove this meal from your plan?')) { removeMealFromPlan('${state.viewingFromPlan.date}', '${state.viewingFromPlan.meal}', '${recipeId}'); state.currentView='weekly-plan'; state.viewingFromPlan=null; }"
              style="padding:6px 12px; background:${CONFIG.danger_color}; color:white; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">
              Remove
            </button>
          ` : ''}
          ${r.isTip ? `
            <button type="button" onclick="publishTip('${recipeId}')"
              style="padding:6px 12px; background:${CONFIG.success_color}; color:white; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">Convert</button>
          ` : ''}
          <button type="button" onclick="openEditRecipe('${recipeId}')" style="background:none; border:none; cursor:pointer; color:${CONFIG.text_muted}; width:28px; height:28px; display:flex; align-items:center; justify-content:center; padding:0;" title="Edit recipe">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
          </button>
          <button type="button" onclick="toggleSaveRecipe('${recipeId}')" style="background:none; border:none; cursor:pointer; color:${saved ? CONFIG.primary_action_color : CONFIG.text_muted}; width:28px; height:28px; display:flex; align-items:center; justify-content:center; padding:0;" title="${saved ? 'Unsave recipe' : 'Save recipe'}">
            <svg width="18" height="18" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
          </button>
        </div>
      </nav>

      ${externalUrl ? `
        <div style="margin-bottom:12px;">
          <a href="${esc(externalUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; color:${CONFIG.primary_action_color}; font-size:13px; text-decoration:none; font-weight:500;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
            View original recipe &rarr;
          </a>
        </div>
      ` : ''}

      <div class="rounded p-5" style="background:${CONFIG.surface_color};">
        <div>
          <div>
            <div class="font-bold" style="color:${CONFIG.text_color}; font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; letter-spacing: ${CONFIG.type_title_tracking};">
              ${esc(r.title)}
            </div>
            <div style="color:${CONFIG.text_color}; opacity:.7;">
              ${esc(r.category)} - ${sourceLabel}
            </div>
            ${r.servings || r.prepTime || r.cookTime || getRecipeEffort(recipeId) ? `
              <div style="color:${CONFIG.text_color}; opacity:.7; margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                ${getRecipeEffort(recipeId) ? renderEffortPill(getRecipeEffort(recipeId)) + '<span>·</span>' : ''}
                ${r.cookTime ? `<span>Cook: ${r.cookTime}</span>` : ''}
                ${r.prepTime ? `<span>· Prep: ${r.prepTime}</span>` : ''}
                ${r.servings ? `<span>· ${r.servings} servings</span>` : ''}
                ${rows.length > 0 ? `<span>· ${rows.length} ingredients</span>` : ''}
              </div>
            ` : ''}
            <div style="margin-top:10px;">
              <div style="color:${CONFIG.text_muted}; font-size:12px; margin-bottom:6px;">Effort</div>
              <div style="display:flex; gap:8px; flex-wrap:nowrap; width:100%; max-width:100%; overflow-x:hidden; box-sizing:border-box;">
                ${Object.entries(EFFORT_LEVELS).map(([key, e]) => {
                  const active = getRecipeEffort(recipeId) === key;
                  return `<button onclick="setRecipeEffort('${recipeId}', ${active ? 'null' : `'${key}'`}); render();"
                    style="padding:6px 16px; border-radius:20px; border:1px solid ${active ? e.border : 'rgba(255,255,255,0.12)'}; background:${active ? e.bg : 'transparent'}; color:${active ? e.color : CONFIG.text_muted}; font-size:13px; font-weight:${active ? '600' : '400'}; cursor:pointer; white-space:nowrap;">
                    ${e.label}
                  </button>`;
                }).join('')}
              </div>
            </div>
${r.isTip ? `<div style="color:${CONFIG.primary_action_color}; font-weight:600; margin-top:8px;">TIP/NOTE - Not available for meal planning</div>` : ''}          </div>
        </div>

        ${img ? `
          <div class="mt-4 rounded overflow-hidden" style="border:1px solid rgba(255,255,255,0.08);">
            <img loading="lazy" src="${img}"
                 alt="${esc(r.title)}"
                 onerror="console.error('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='block';"
                 onload="console.log('Image loaded successfully:', this.src);"
                 style="width:100%; max-width:100%; max-height:260px; object-fit:cover; display:block;" />
            <div style="display:none; padding:20px; text-align:center; color:${CONFIG.danger_color}; background:rgba(220,38,38,0.1);">
              Image failed to load<br>
              <small style="font-size:12px; opacity:0.8;">${img}</small>
            </div>
          </div>
        ` : ''}


        ${tags ? `<div class="mt-4" style="color:${CONFIG.text_color}; opacity:.85;">
          <span class="font-semibold">Tags:</span> ${esc(tags)}
        </div>` : ''}

        ${groupOrder.length ? `
          <div class="mt-6 p-3 rounded" style="background:rgba(232, 93, 93, 0.1); border: 1px solid rgba(232, 93, 93, 0.2);">
            <div class="font-semibold mb-3" style="color:${CONFIG.text_color};">Ingredients</div>
            ${groupOrder.map(g => `
              <div class="mb-3">
                <div class="font-semibold mb-1" style="color:${CONFIG.primary_action_color}; font-size:${CONFIG.font_size * 0.9}px;">${esc(g)}</div>
                <div class="grid grid-cols-2 gap-1">
                  ${grouped[g].map(x => {
                    const qty = (x.qty || '').trim();
                    const unit = (x.unit || '').trim();
                    const name = (x.name || '').trim();
                    const capName = capitalize(name);
                    return `
                      <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px; opacity:0.9;">
                        - ${qty} ${unit} ${capName}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="mt-6">
          <div class="font-semibold mb-2" style="color:${CONFIG.text_color};">Step-by-step Instructions</div>
          ${instructionSteps.length ? `
          <ol class="space-y-4" style="color:${CONFIG.text_color}; opacity:.9; list-style: none;">
              ${instructionSteps.map((step) => `
                <li style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${CONFIG.primary_action_color};">
                  ${step.header ? `
                    <div style="font-weight: 600; color: ${CONFIG.primary_action_color}; margin-bottom: 4px;">
                      ${esc(step.header)}
                    </div>
                  ` : ''}
                  ${step.details.map(d => `
                    <div style="padding-left: ${step.header ? '12px' : '0'}; color: ${CONFIG.text_color};">
                      ${esc(d)}
                    </div>
                  `).join('')}
                </li>
              `).join('')}
            </ol>` : `
            <div style="color:${CONFIG.text_color}; opacity:.6;">
              No instructions saved yet. Add them in Edit.
            </div>`}
        </div>

        ${notes ? `
          <div class="mt-6">
            <div class="font-semibold mb-2" style="color:${CONFIG.text_color};">Notes</div>
            <div class="rounded p-4" style="background:rgba(255,255,255,0.03); color:${CONFIG.text_color}; white-space:pre-wrap;">
              ${esc(notes)}
            </div>
          </div>` : ''}

        ${externalUrl ? `
          <div class="mt-6">
            <a href="${esc(externalUrl)}" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex; align-items:center; gap:4px;
              color:${CONFIG.primary_action_color};
              font-size:13px; font-weight:500; text-decoration:none;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
              View original recipe &rarr;
            </a>
          </div>
        ` : ''}
      </div>
    </div>`;
}

// ===== BATCH RECIPE (Build a Plate) =====

function openNewBatchRecipe() {
  state.batchForm = newBatchRecipeDraft();
  state.currentView = 'batch-edit';
  render();
}

function openEditBatchRecipe(batchId) {
  const batch = getBatchRecipeById(batchId);
  if (!batch) return;
  state.batchForm = JSON.parse(JSON.stringify(batch));
  state.currentView = 'batch-edit';
  render();
}

function openBatchRecipeView(batchId) {
  state.batchViewId = batchId;
  state.batchComponentIndex = 0;
  state.currentView = 'batch-view';
  render();
  setTimeout(() => { const app = document.getElementById('app'); if (app) app.scrollTop = 0; }, 0);
}

function closeBatchEditor() {
  state.batchForm = null;
  navigateTo('recipes');
}

function saveBatchForm() {
  console.log('[saveBatchForm] Starting save...');
  if (!state.batchForm) { console.warn('[saveBatchForm] No batchForm in state'); return; }
  const name = (state.batchForm.name || '').trim();
  if (!name) return showError('Please name your plate.');
  console.log('[saveBatchForm] Name:', name);
  console.log('[saveBatchForm] Components:', JSON.stringify(state.batchForm.components.map(c => ({ id: c.id, type: c.type, name: c.name }))));
  if (state.batchForm.components.length === 0) return showError('Add at least one component.');

  try {
    // Reorder
    state.batchForm.components.forEach((c, i) => c.order = i + 1);
    console.log('[saveBatchForm] Calling saveBatchRecipe...');
    saveBatchRecipe(state.batchForm);
    console.log('[saveBatchForm] saveBatchRecipe returned successfully');
    showToast('Plate saved!', 'success');
    state.batchForm = null;
    navigateTo('recipes');
  } catch (e) {
    console.error('[saveBatchForm] Error saving plate:', e, e.stack);
    showError('Failed to save plate. Please try again.');
  }
}

function addBatchComponentFromRecipe() {
  state.batchRecipePickerOpen = true;
  state.batchRecipePickerSearch = '';
  // Pre-filter to the plate's meal type
  state.batchPickerMealFilter = state.batchForm?.mealType || null;
  state.batchPickerEffortFilter = null;
  state.batchPickerSavedFilter = false;
  render();
}

function selectBatchRecipe(recipeId) {
  if (!state.batchForm) return;
  const r = getRecipeById(recipeId);
  if (!r) return;
  const comp = newBatchComponent('recipe');
  comp.recipeId = recipeId;
  comp.name = r.title;
  comp.photo = recipeThumb(r) || null;
  comp.ingredients = recipeIngList(r).map(ing => `${ing.qty || ''} ${ing.unit || ''} ${ing.name}`.trim());
  comp.instructions = r.instructions || '';
  comp.order = state.batchForm.components.length + 1;
  state.batchForm.components.push(comp);
  state.batchRecipePickerOpen = false;
  render();
}

function addBatchFreeformComponent() {
  if (!state.batchForm) return;
  const comp = newBatchComponent('freeform');
  comp.order = state.batchForm.components.length + 1;
  state.batchForm.components.push(comp);
  render();
}

function removeBatchComponent(compId) {
  if (!state.batchForm) return;
  state.batchForm.components = state.batchForm.components.filter(c => c.id !== compId);
  state.batchForm.components.forEach((c, i) => c.order = i + 1);
  render();
}

function moveBatchComponent(compId, direction) {
  if (!state.batchForm) return;
  const comps = state.batchForm.components;
  const idx = comps.findIndex(c => c.id === compId);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= comps.length) return;
  [comps[idx], comps[newIdx]] = [comps[newIdx], comps[idx]];
  comps.forEach((c, i) => c.order = i + 1);
  render();
}

function setBatchCompField(compId, field, value) {
  if (!state.batchForm) return;
  const comp = state.batchForm.components.find(c => c.id === compId);
  if (comp) comp[field] = value;
}

async function handleBatchCoverPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  showToast('Compressing photo...', 'info');
  const compressed = await compressImage(file);
  const url = await uploadPhoto(compressed);
  if (url && state.batchForm) {
    state.batchForm.coverPhoto = url;
    render();
  }
  event.target.value = '';
}

async function handleBatchCompPhotoUpload(event, compId) {
  const file = event.target.files[0];
  if (!file) return;
  showToast('Compressing photo...', 'info');
  const compressed = await compressImage(file);
  const url = await uploadPhoto(compressed);
  if (url && state.batchForm) {
    const comp = state.batchForm.components.find(c => c.id === compId);
    if (comp) { comp.photo = url; render(); }
  }
  event.target.value = '';
}

function renderBatchEditLivePreview(form) {
  const coverPhoto = getBatchCoverPhoto(form);
  const totalTime = getBatchTotalTime(form);
  const allIngs = getBatchRecipeIngredients(form);
  const compCount = form.components.length;

  return `
    <div style="position:sticky; top:16px;">
      <label class="block mb-2" style="color:${CONFIG.text_color}; font-size:13px; font-weight:600;">Preview</label>
      <div style="border-radius:16px; overflow:hidden; background:${CONFIG.surface_color}; box-shadow:${CONFIG.shadow};">
        ${coverPhoto ? `
          <div style="height:180px; overflow:hidden; position:relative;">
            <img src="${esc(coverPhoto)}" style="width:100%; height:100%; object-fit:cover;" />
            ${form.mealType ? `<span style="position:absolute; top:10px; left:10px; padding:4px 10px; border-radius:12px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); color:white; font-size:11px; font-weight:600;">${capitalize(form.mealType)}</span>` : ''}
          </div>
        ` : `
          <div style="height:120px; background:linear-gradient(135deg, ${CONFIG.surface_color}, ${CONFIG.surface_elevated}); display:flex; align-items:center; justify-content:center; position:relative;">
            <svg width="40" height="40" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/></svg>
            ${form.mealType ? `<span style="position:absolute; top:10px; left:10px; padding:4px 10px; border-radius:12px; background:rgba(0,0,0,0.4); color:white; font-size:11px; font-weight:600;">${capitalize(form.mealType)}</span>` : ''}
          </div>
        `}
        <div style="padding:14px 16px;">
          <div style="color:${CONFIG.text_color}; font-size:16px; font-weight:700; margin-bottom:8px;">${esc(form.name || 'Untitled Plate')}</div>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:4px; color:${CONFIG.text_muted}; font-size:12px;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0l4.179 2.25L12 22.5l-9.75-5.25 4.179-2.25"/></svg>
              ${compCount} component${compCount !== 1 ? 's' : ''}
            </div>
            ${totalTime ? `
              <div style="display:flex; align-items:center; gap:4px; color:${CONFIG.text_muted}; font-size:12px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ${totalTime} min
              </div>
            ` : ''}
            <div style="display:flex; align-items:center; gap:4px; color:${CONFIG.text_muted}; font-size:12px;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
              ${allIngs.length} ingredient${allIngs.length !== 1 ? 's' : ''}
            </div>
          </div>
          ${compCount > 0 ? `
            <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06);">
              ${form.components.slice(0, 4).map((comp, i) => {
                let cName = comp.name || '';
                let cImg = comp.photo || '';
                if (comp.type === 'recipe' && comp.recipeId) {
                  const r = getRecipeById(comp.recipeId);
                  if (r) { cName = r.title; cImg = recipeThumb(r) || cImg; }
                }
                return `<div style="display:flex; align-items:center; gap:8px; padding:4px 0;">
                  ${cImg ? `<img src="${esc(cImg)}" style="width:24px; height:24px; border-radius:4px; object-fit:cover; flex-shrink:0;" />` :
                  `<div style="width:24px; height:24px; border-radius:4px; background:${CONFIG.surface_elevated}; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:${CONFIG.text_tertiary}; font-size:10px; font-weight:700;">${i+1}</div>`}
                  <span style="color:${CONFIG.text_color}; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(cName || 'Unnamed')}</span>
                  ${comp.timing ? `<span style="margin-left:auto; font-size:10px; color:${CONFIG.text_muted}; flex-shrink:0;">${esc(comp.timing)}</span>` : ''}
                </div>`;
              }).join('')}
              ${compCount > 4 ? `<div style="color:${CONFIG.text_muted}; font-size:11px; padding-top:4px;">+${compCount - 4} more</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderBatchEdit() {
  if (!state.batchForm) return '';
  const form = state.batchForm;

  // Recipe picker overlay
  if (state.batchRecipePickerOpen) {
    return renderBatchRecipePicker();
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return `
    <div class="batch-edit-page" style="padding: 16px; margin: 0 auto;">
      <div class="flex items-center justify-end mb-4">
        <div class="flex gap-2">
          <button onclick="closeBatchEditor()" class="px-3 py-1.5 rounded button-hover"
            style="background:${CONFIG.secondary_action_color}; color:${CONFIG.text_color}; min-height:44px; padding: 8px 16px;">Cancel</button>
          ${form.id ? `<button onclick="if(confirm('Delete this plate?')) { deleteBatchRecipe('${form.id}'); closeBatchEditor(); }"
            class="px-3 py-1.5 rounded button-hover" style="background:${CONFIG.danger_color}; color:white; min-height:44px; padding: 8px 16px;">Delete</button>` : ''}
        </div>
      </div>

      <div class="batch-edit-columns">
        <!-- Left column: form -->
        <div class="batch-edit-left">
          <!-- Name input -->
          <div style="margin-bottom:12px;">
            <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:13px; font-weight:600;">Name your plate</label>
            <input type="text" value="${esc(form.name || '')}"
              oninput="state.batchForm.name = this.value; document.querySelector('.batch-edit-preview-col')?.remove(); const pc = document.querySelector('.batch-edit-right'); if(pc) { const tmp = document.createElement('div'); tmp.innerHTML = renderBatchEditLivePreview(state.batchForm); const newNode = tmp.firstElementChild; pc.innerHTML = ''; pc.appendChild(newNode); }"
              placeholder="e.g. My Go-To Breakfast Bowl"
              class="w-full px-3 py-2 rounded"
              style="background:rgba(0,0,0,0.2); color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1); height:44px; font-size:15px; box-sizing:border-box;" />
          </div>

          <!-- Meal type pills -->
          <div style="margin-bottom:12px;">
            <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:13px; font-weight:600;">Meal type</label>
            <div class="flex gap-2 flex-wrap">
              ${mealTypes.map(mt => `
                <button onclick="state.batchForm.mealType = '${mt}'; render();"
                  style="padding:8px 18px; border-radius:20px; border:1px solid ${form.mealType === mt ? CONFIG.primary_action_color : 'rgba(255,255,255,0.12)'};
                  background:${form.mealType === mt ? CONFIG.primary_action_color : 'transparent'};
                  color:${form.mealType === mt ? 'white' : CONFIG.text_muted}; font-size:14px; font-weight:${form.mealType === mt ? '600' : '400'}; cursor:pointer;">
                  ${capitalize(mt)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Cover photo -->
          <div style="margin-bottom:12px;">
            <label class="block mb-1" style="color:${CONFIG.text_color}; font-size:13px; font-weight:600;">Cover photo (optional)</label>
            ${form.coverPhoto ? `
              <div class="relative" style="border-radius:12px; overflow:hidden; margin-bottom:8px;">
                <img src="${esc(form.coverPhoto)}" style="width:100%; max-height:160px; object-fit:cover;" />
                <button onclick="state.batchForm.coverPhoto = null; render();"
                  class="absolute top-2 right-2 px-2 py-1 rounded" style="background:rgba(220,38,38,0.9); color:white; font-size:12px;">Remove</button>
              </div>
            ` : `
              <div class="p-4 rounded border-2 border-dashed text-center cursor-pointer"
                style="border-color:rgba(255,255,255,0.15); background:rgba(255,255,255,0.03);"
                onclick="document.getElementById('batchCoverInput').click();">
                <div style="color:${CONFIG.text_muted}; font-size:13px;">Tap to add a photo</div>
              </div>
              <input type="file" id="batchCoverInput" accept="image/*" capture="environment" onchange="handleBatchCoverPhotoUpload(event)" style="display:none;" />
            `}
          </div>

          <!-- Components -->
          <div>
            <label class="block mb-2" style="color:${CONFIG.text_color}; font-size:13px; font-weight:600;">
              Components (${form.components.length})
            </label>

            ${form.components.length === 0 ? `
              <div class="p-6 rounded text-center" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1);">
                <div style="color:${CONFIG.text_muted}; font-size:13px; margin-bottom:8px;">No components yet</div>
                <div style="color:${CONFIG.text_tertiary}; font-size:11px;">Add recipes or freeform items to build your plate</div>
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${form.components.map((comp, idx) => renderBatchComponentCard(comp, idx, form.components.length)).join('')}
              </div>
            `}

            <!-- Add component buttons -->
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
              <button onclick="addBatchComponentFromRecipe()" class="button-hover"
                style="width:100%; height:48px; background:${CONFIG.surface_elevated}; color:${CONFIG.text_color}; font-size:14px; font-weight:600; border:1px solid rgba(255,255,255,0.08); border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                From Recipes
              </button>
              <button onclick="addBatchFreeformComponent()" class="button-hover"
                style="width:100%; height:48px; background:${CONFIG.surface_elevated}; color:${CONFIG.text_color}; font-size:14px; font-weight:600; border:1px solid rgba(255,255,255,0.08); border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Freeform
              </button>
            </div>
          </div>

          <!-- Save button -->
          <button onclick="saveBatchForm()" class="button-hover"
            style="width:100%; height:48px; margin-top:16px; background:${CONFIG.primary_action_color}; color:white; font-size:15px; font-weight:700; border:none; border-radius:10px; cursor:pointer;">
            Save Plate
          </button>
        </div>

        <!-- Right column: live preview (desktop only) -->
        <div class="batch-edit-right">
          ${renderBatchEditLivePreview(form)}
        </div>
      </div>
    </div>
  `;
}

function renderBatchComponentCard(comp, idx, total) {
  const isRecipe = comp.type === 'recipe';
  let recipeName = comp.name || '';
  let recipeImg = comp.photo || '';
  if (isRecipe && comp.recipeId) {
    const r = getRecipeById(comp.recipeId);
    if (r) {
      recipeName = r.title;
      recipeImg = recipeThumb(r) || comp.photo || '';
    }
  }

  return `
    <div style="background:${CONFIG.surface_elevated}; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.2);">
      <!-- Main row: image left, details right -->
      <div style="display:flex; gap:0;">
        <!-- Image -->
        ${recipeImg ? `
          <div style="width:80px; min-height:80px; flex-shrink:0; overflow:hidden;">
            <img src="${esc(recipeImg)}" style="width:80px; height:100%; object-fit:cover; display:block;" />
          </div>
        ` : `
          <div style="width:80px; min-height:80px; flex-shrink:0; background:${CONFIG.surface_color}; display:flex; align-items:center; justify-content:center;">
            <div style="width:28px; height:28px; border-radius:50%; background:${CONFIG.primary_action_color}; color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700;">${idx + 1}</div>
          </div>
        `}

        <!-- Details -->
        <div style="flex:1; min-width:0; padding:10px 12px; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; align-items:center; gap:8px;">
            ${recipeImg ? `<div style="width:20px; height:20px; border-radius:50%; background:${CONFIG.primary_action_color}; color:white; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0;">${idx + 1}</div>` : ''}
            <div style="flex:1; min-width:0;">
              ${isRecipe ? `
                <div style="color:${CONFIG.text_color}; font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(recipeName)}</div>
              ` : `
                <input type="text" value="${esc(comp.name || '')}"
                  oninput="setBatchCompField('${comp.id}', 'name', this.value)"
                  placeholder="Component name"
                  style="width:100%; background:transparent; border:none; color:${CONFIG.text_color}; font-size:14px; font-weight:600; outline:none; padding:0;" />
              `}
            </div>
            <!-- Drag handle -->
            <div style="flex-shrink:0; color:${CONFIG.text_tertiary}; display:flex; flex-direction:column; gap:1px; cursor:grab; padding:0 4px;">
              ${idx > 0 ? `<button onclick="moveBatchComponent('${comp.id}', -1)" style="width:22px; height:18px; background:none; border:none; color:${CONFIG.text_muted}; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/></svg>
              </button>` : ''}
              ${idx < total - 1 ? `<button onclick="moveBatchComponent('${comp.id}', 1)" style="width:22px; height:18px; background:none; border:none; color:${CONFIG.text_muted}; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </button>` : ''}
            </div>
            <!-- Delete -->
            <button onclick="removeBatchComponent('${comp.id}')" style="width:28px; height:28px; background:rgba(220,38,38,0.1); border:none; border-radius:6px; color:${CONFIG.danger_color}; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </button>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="color:${CONFIG.text_muted}; font-size:11px;">${isRecipe ? 'From recipes' : 'Freeform'}</span>
            ${comp.timing ? `<span style="padding:2px 8px; border-radius:8px; background:rgba(255,255,255,0.06); color:${CONFIG.text_muted}; font-size:10px; font-weight:500;">${esc(comp.timing)}</span>` : ''}
            ${isRecipe && comp.recipeId ? renderEffortPill(getRecipeEffort(comp.recipeId), 'sm') : ''}
            ${!isRecipe && comp.effort ? renderEffortPill(comp.effort, 'sm') : ''}
          </div>
        </div>
      </div>

      <!-- Editable fields below -->
      <div style="padding:8px 12px 10px; display:flex; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.04);">
        <input type="text" value="${esc(comp.notes || '')}"
          oninput="setBatchCompField('${comp.id}', 'notes', this.value)"
          placeholder="Notes (e.g. Start this first)"
          style="width:100%; padding:8px 10px; background:rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:${CONFIG.text_color}; font-size:13px; box-sizing:border-box;" />
        <input type="text" value="${esc(comp.timing || '')}"
          oninput="setBatchCompField('${comp.id}', 'timing', this.value)"
          placeholder="Timing (e.g. 15 min)"
          style="width:100%; padding:8px 10px; background:rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:${CONFIG.text_color}; font-size:13px; box-sizing:border-box;" />

        ${!isRecipe ? `
          <!-- Effort selector for freeform -->
          <div>
            <label style="color:${CONFIG.text_muted}; font-size:11px; font-weight:500; margin-bottom:4px; display:block;">Effort level</label>
            <div style="display:flex; gap:6px;">
              ${Object.entries(EFFORT_LEVELS).map(([key, e]) => `
                <button onclick="setBatchCompField('${comp.id}', 'effort', ${comp.effort === key ? 'null' : `'${key}'`}); render();"
                  style="flex:1; padding:6px 0; border-radius:8px; border:1px solid ${comp.effort === key ? e.border : 'rgba(255,255,255,0.08)'};
                  background:${comp.effort === key ? e.bg : 'transparent'};
                  color:${comp.effort === key ? e.color : CONFIG.text_muted}; font-size:12px; font-weight:${comp.effort === key ? '600' : '400'}; cursor:pointer;">
                  ${e.label}
                </button>
              `).join('')}
            </div>
          </div>
          <div>
            ${comp.photo ? `
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <img src="${esc(comp.photo)}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;" />
                <button onclick="setBatchCompField('${comp.id}', 'photo', null); render();" style="color:${CONFIG.danger_color}; background:none; border:none; font-size:11px; cursor:pointer;">Remove</button>
              </div>
            ` : `
              <button onclick="document.getElementById('compPhoto_${comp.id}').click();"
                style="width:100%; background:rgba(255,255,255,0.05); border:1px dashed rgba(255,255,255,0.1); border-radius:8px; padding:8px 10px; color:${CONFIG.text_muted}; font-size:12px; cursor:pointer;">
                + Add photo
              </button>
              <input type="file" id="compPhoto_${comp.id}" accept="image/*" capture="environment" onchange="handleBatchCompPhotoUpload(event, '${comp.id}')" style="display:none;" />
            `}
          </div>
          <textarea placeholder="Ingredients (one per line)"
            oninput="setBatchCompField('${comp.id}', 'ingredients', this.value.split('\\n').filter(l => l.trim()))"
            style="width:100%; padding:8px 10px; background:rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:${CONFIG.text_color}; font-size:13px; min-height:50px; resize:vertical; box-sizing:border-box;">${esc((comp.ingredients || []).join('\n'))}</textarea>
          <textarea placeholder="Instructions"
            oninput="setBatchCompField('${comp.id}', 'instructions', this.value)"
            style="width:100%; padding:8px 10px; background:rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:${CONFIG.text_color}; font-size:13px; min-height:40px; resize:vertical; box-sizing:border-box;">${esc(comp.instructions || '')}</textarea>
          <!-- Save as recipe link -->
          <div style="text-align:right; padding-top:2px;">
            <button onclick="saveFreeformAsRecipe('${comp.id}')"
              style="background:none; border:none; color:${CONFIG.primary_action_color}; font-size:12px; cursor:pointer; text-decoration:underline; padding:4px 0;">
              Save as recipe
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function toggleBatchPickerFilter(type, value) {
  if (type === 'meal') {
    state.batchPickerMealFilter = state.batchPickerMealFilter === value ? null : value;
  } else if (type === 'effort') {
    state.batchPickerEffortFilter = state.batchPickerEffortFilter === value ? null : value;
  } else if (type === 'saved') {
    state.batchPickerSavedFilter = !state.batchPickerSavedFilter;
  }
  render();
}

function renderBatchRecipePicker() {
  const search = (state.batchRecipePickerSearch || '').toLowerCase();
  const mealFilter = state.batchPickerMealFilter;
  const effortFilter = state.batchPickerEffortFilter;
  const savedFilter = state.batchPickerSavedFilter;
  const savedIds = new Set(getSavedRecipes());
  const effortLevels = getRecipeEffortLevels();

  let list = state.recipes.filter(r => !r.isDraft && !r.isTip);

  // Search by name and ingredients
  if (search) {
    list = list.filter(r => {
      if ((r.title || '').toLowerCase().includes(search)) return true;
      const ings = recipeIngList(r);
      return ings.some(ing => (ing.name || '').toLowerCase().includes(search));
    });
  }

  // Meal type filter
  if (mealFilter) {
    list = list.filter(r => (r.category || '').toLowerCase() === mealFilter.toLowerCase());
  }

  // Effort filter
  if (effortFilter) {
    list = list.filter(r => {
      const id = r.__backendId || r.id;
      return effortLevels[id] === effortFilter;
    });
  }

  // Saved filter
  if (savedFilter) {
    list = list.filter(r => {
      const id = r.__backendId || r.id;
      return savedIds.has(id);
    });
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const efforts = ['lazy', 'moderate', 'timely'];

  function pill(label, active, onclick) {
    return `<button onclick="${onclick}"
      style="padding:6px 14px; border-radius:16px; border:1px solid ${active ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'};
      background:${active ? CONFIG.primary_action_color : 'transparent'};
      color:${active ? 'white' : CONFIG.text_muted}; font-size:12px; font-weight:${active ? '600' : '400'}; cursor:pointer; white-space:nowrap;">
      ${label}
    </button>`;
  }

  return `
    <div class="batch-recipe-picker-overlay">
      <div class="batch-recipe-picker-modal">
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 16px 0; flex-shrink:0;">
          <h2 style="color:${CONFIG.text_color}; font-size:17px; font-weight:600; margin:0;">Pick a Recipe</h2>
          <button onclick="state.batchRecipePickerOpen = false; render();"
            style="width:32px; height:32px; border-radius:50%; background:${CONFIG.surface_elevated}; border:none; color:${CONFIG.text_color}; cursor:pointer; display:flex; align-items:center; justify-content:center;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Search bar -->
        <div style="padding:12px 16px 0; flex-shrink:0;">
          <div style="position:relative;">
            <svg style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:${CONFIG.text_muted};" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input type="text" placeholder="Search recipes and ingredients..."
              value="${esc(state.batchRecipePickerSearch || '')}"
              oninput="state.batchRecipePickerSearch = this.value; render();"
              style="width:100%; padding:10px 12px 10px 36px; background:${CONFIG.surface_color}; color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:14px; box-sizing:border-box;" />
          </div>
        </div>

        <!-- Filter pills -->
        <div style="padding:10px 16px; display:flex; gap:6px; flex-wrap:wrap; flex-shrink:0; border-bottom:1px solid rgba(255,255,255,0.06);">
          ${pill('All', !mealFilter && !effortFilter && !savedFilter, "state.batchPickerMealFilter=null;state.batchPickerEffortFilter=null;state.batchPickerSavedFilter=false;render();")}
          ${pill('Saved', savedFilter, "toggleBatchPickerFilter('saved')")}
          ${mealTypes.map(mt => pill(capitalize(mt), mealFilter === mt, `toggleBatchPickerFilter('meal','${mt}')`)).join('')}
          ${efforts.map(ef => {
            const e = EFFORT_LEVELS[ef];
            const active = effortFilter === ef;
            return `<button onclick="toggleBatchPickerFilter('effort','${ef}')"
              style="padding:6px 14px; border-radius:16px; border:1px solid ${active ? e.border : 'rgba(255,255,255,0.1)'};
              background:${active ? e.bg : 'transparent'};
              color:${active ? e.color : CONFIG.text_muted}; font-size:12px; font-weight:${active ? '600' : '400'}; cursor:pointer; white-space:nowrap;">
              ${e.label}
            </button>`;
          }).join('')}
        </div>

        <!-- Recipe grid -->
        <div style="flex:1; overflow-y:auto; padding:12px 16px 16px;">
          ${list.length === 0 ? `<div style="text-align:center; padding:40px 16px; color:${CONFIG.text_muted}; font-size:13px;">No recipes match your filters</div>` : `
            <div class="batch-picker-grid">
              ${list.map(r => {
                const id = r.__backendId || r.id;
                const img = recipeThumb(r);
                const effort = effortLevels[id];
                const saved = savedIds.has(id);
                return `
                  <div onclick="selectBatchRecipe('${id}')" style="cursor:pointer; border-radius:10px; overflow:hidden; background:${CONFIG.surface_color}; transition:transform 150ms;">
                    ${img ? `<div style="aspect-ratio:1; overflow:hidden; position:relative;">
                      <img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;" />
                      ${saved ? `<div style="position:absolute; top:6px; right:6px;">
                        <svg width="16" height="16" fill="${CONFIG.primary_action_color}" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
                      </div>` : ''}
                    </div>` :
                    `<div style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; padding:8px; background:${CONFIG.surface_color}; position:relative;">
                      <span style="color:${CONFIG.text_color}; font-size:11px; font-weight:600; text-align:center; -webkit-line-clamp:3; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden;">${esc(r.title)}</span>
                      ${saved ? `<div style="position:absolute; top:6px; right:6px;">
                        <svg width="16" height="16" fill="${CONFIG.primary_action_color}" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
                      </div>` : ''}
                    </div>`}
                    <div style="padding:6px 8px;">
                      <div style="color:${CONFIG.text_color}; font-size:11px; font-weight:600; -webkit-line-clamp:2; -webkit-box-orient:vertical; display:-webkit-box; overflow:hidden; line-height:1.3;">${esc(r.title)}</div>
                      ${effort ? `<div style="margin-top:3px;">${renderEffortPill(effort, 'sm')}</div>` : ''}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// ===== BATCH RECIPE DETAIL VIEW =====

function renderBatchView() {
  const batch = getBatchRecipeById(state.batchViewId);
  if (!batch) return `<div class="p-4" style="color:${CONFIG.text_color};">Plate not found</div>`;

  const comps = batch.components || [];
  const idx = state.batchComponentIndex || 0;
  const comp = comps[idx];
  const coverPhoto = getBatchCoverPhoto(batch);
  const totalTime = getBatchTotalTime(batch);
  const allIngs = getBatchRecipeIngredients(batch);

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

  // Parse instructions into steps
  const steps = compInstructions ? compInstructions.split('\n').filter(s => s.trim()) : [];

  return `
    <div class="batch-view-page" style="padding: 16px; max-width: 1200px; margin: 0 auto;">
      <!-- Header -->
      <div style="margin-bottom:16px;">
        <div class="flex items-center justify-between">
          <div style="flex:1; min-width:0;">
            <h2 style="color:${CONFIG.text_color}; font-size:${CONFIG.type_title}; font-weight:${CONFIG.type_title_weight}; margin:0;">${esc(batch.name)}</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span style="padding:3px 10px; border-radius:12px; background:${CONFIG.primary_subtle}; color:${CONFIG.primary_action_color}; font-size:11px; font-weight:600;">${capitalize(batch.mealType)}</span>
              <span style="color:${CONFIG.text_muted}; font-size:12px;">${comps.length} component${comps.length !== 1 ? 's' : ''}</span>
              ${totalTime ? `<span style="color:${CONFIG.text_muted}; font-size:12px;">${totalTime} min total</span>` : ''}
              <span style="color:${CONFIG.text_muted}; font-size:12px;">${allIngs.length} ingredients</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="openEditBatchRecipe('${batch.id}')" style="width:36px; height:36px; border-radius:8px; border:none; background:${CONFIG.surface_elevated}; color:${CONFIG.text_color}; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
            </button>
          </div>
        </div>
      </div>

      ${comps.length === 0 ? `<div style="text-align:center; padding:32px; color:${CONFIG.text_muted};">No components</div>` : `
        <!-- Notes bar -->
        ${compNotes ? `
          <div style="background:rgba(255,214,10,0.08); border:1px solid rgba(255,214,10,0.2); border-radius:10px; padding:10px 12px; margin-bottom:12px;">
            <div style="font-size:11px; font-weight:600; color:${CONFIG.warning_color}; margin-bottom:2px;">Notes</div>
            <div style="color:${CONFIG.text_color}; font-size:13px; line-height:1.4;">${esc(compNotes)}</div>
          </div>
        ` : ''}

        <div class="batch-view-content">
          <!-- Component card -->
          <div class="batch-view-card-col">
            <div id="batchCardContainer" style="position:relative; border-radius:16px; overflow:hidden; background:${CONFIG.surface_color}; box-shadow:${CONFIG.shadow}; margin-bottom:12px; touch-action:pan-y;">
              ${compImg ? `
                <div class="batch-card-img-area" style="height:240px; overflow:hidden; position:relative;">
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
                <div class="batch-card-img-area" style="height:160px; background:linear-gradient(135deg, ${CONFIG.surface_color}, ${CONFIG.surface_elevated}); display:flex; align-items:center; justify-content:center; position:relative;">
                  <span style="color:${CONFIG.text_color}; font-size:18px; font-weight:700; text-align:center; padding:16px;">${esc(compName)}</span>
                  <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.4); padding:4px 10px; border-radius:12px; color:white; font-size:12px; font-weight:600;">
                    ${idx + 1} of ${comps.length}
                  </div>
                  ${comp.timing ? `
                    <div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.4); padding:4px 10px; border-radius:12px; color:white; font-size:11px; font-weight:500;">
                      ${esc(comp.timing)}
                    </div>
                  ` : ''}
                </div>
              `}
              <div style="padding:12px 14px;">
                <div style="color:${CONFIG.text_color}; font-size:16px; font-weight:700;">${esc(compName)}</div>
              </div>
            </div>

            <!-- Dot indicators -->
            <div style="display:flex; justify-content:center; gap:6px; margin-bottom:16px;">
              ${comps.map((_, i) => `
                <button onclick="state.batchComponentIndex = ${i}; render();"
                  style="width:${i === idx ? '20px' : '8px'}; height:8px; border-radius:4px; border:none;
                  background:${i === idx ? CONFIG.primary_action_color : 'rgba(255,255,255,0.2)'}; cursor:pointer; transition:all 0.2s; padding:0;">
                </button>
              `).join('')}
            </div>

            <!-- Prev / Next buttons -->
            <div class="flex gap-2 mb-4">
              <button onclick="if(state.batchComponentIndex > 0) { state.batchComponentIndex--; render(); }"
                style="flex:1; padding:10px; background:${CONFIG.surface_elevated}; color:${idx > 0 ? CONFIG.text_color : CONFIG.text_tertiary}; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; min-height:44px;"
                ${idx === 0 ? 'disabled' : ''}>
                &larr; Previous
              </button>
              <button onclick="if(state.batchComponentIndex < ${comps.length - 1}) { state.batchComponentIndex++; render(); }"
                style="flex:1; padding:10px; background:${CONFIG.surface_elevated}; color:${idx < comps.length - 1 ? CONFIG.text_color : CONFIG.text_tertiary}; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; min-height:44px;"
                ${idx === comps.length - 1 ? 'disabled' : ''}>
                Next &rarr;
              </button>
            </div>
          </div>

          <!-- Ingredients & instructions column -->
          <div class="batch-view-detail-col">
            ${compIngs.length > 0 ? `
              <div class="rounded-lg p-3 mb-3" style="background:${CONFIG.surface_color};">
                <div style="font-size:15px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:8px;">Ingredients</div>
                ${compIngs.map(ing => `
                  <div style="color:${CONFIG.text_color}; font-size:14px; padding:4px 0; opacity:0.9;">
                    ${ing.qty ? esc(ing.qty) : ''} ${ing.unit ? esc(ing.unit) : ''} ${esc(capitalize(ing.name))}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${steps.length > 0 ? `
              <div class="rounded-lg p-3 mb-3" style="background:${CONFIG.surface_color};">
                <div style="font-size:15px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:8px;">Instructions</div>
                <ol style="color:${CONFIG.text_color}; font-size:14px; padding-left:18px; margin:0;">
                  ${steps.map(s => `<li style="padding:4px 0; opacity:0.9;">${esc(s.replace(/^\d+\.\s*/, ''))}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
          </div>
        </div>
      `}

      <!-- View all ingredients button -->
      ${comps.length > 0 ? `
        <button onclick="showBatchAllIngredients('${batch.id}')" style="width:100%; padding:12px; background:${CONFIG.surface_elevated}; color:${CONFIG.primary_action_color}; border:1px solid rgba(232,93,93,0.2); border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; margin-bottom:8px; min-height:44px;">
          View all ingredients (${allIngs.length})
        </button>
        <button onclick="showBatchIngredientPicker('${batch.id}')" style="width:100%; padding:12px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; min-height:44px;">
          Add to grocery list
        </button>
      ` : ''}
    </div>
  `;
}

function showBatchAllIngredients(batchId) {
  const batch = getBatchRecipeById(batchId);
  if (!batch) return;
  const combined = getBatchCombinedIngredients(batch);

  const html = `<div style="color:${CONFIG.text_color}; max-height:80vh; display:flex; flex-direction:column;">
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
  </div>`;

  openModal(html);
}

function initBatchCardSwipe() {
  const container = document.getElementById('batchCardContainer');
  if (!container) return;
  const batch = getBatchRecipeById(state.batchViewId);
  if (!batch || batch.components.length <= 1) return;

  let startX = 0, currentX = 0, swiping = false;

  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    currentX = startX;
    swiping = true;
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (!swiping) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    container.style.transform = `translateX(${diff * 0.3}px)`;
    container.style.transition = 'none';
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (!swiping) return;
    swiping = false;
    const diff = currentX - startX;
    container.style.transform = '';
    container.style.transition = 'transform 0.2s';

    if (Math.abs(diff) > 60) {
      if (diff < 0 && state.batchComponentIndex < batch.components.length - 1) {
        state.batchComponentIndex++;
        render();
      } else if (diff > 0 && state.batchComponentIndex > 0) {
        state.batchComponentIndex--;
        render();
      }
    }
  });
}

// ===== PAGE INIT & RENDER =====

const VIEW_RENDERERS = {
  'recipes': renderRecipes,
  'recipe-view': renderRecipeView,
  'recipe-edit': renderRecipeEdit,
  'freestyle-edit': renderFreestyleEdit,
  'batch-edit': renderBatchEdit,
  'batch-view': renderBatchView
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  if (renderer) {
    content = renderer();
  } else {
    content = renderRecipes();
    state.currentView = 'recipes';
  }

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${typeof renderClaudeReceiptModal === 'function' ? renderClaudeReceiptModal() : ''}
      ${typeof renderReceiptScannerModal === 'function' ? renderReceiptScannerModal() : ''}
      ${typeof renderChefChatButton === 'function' ? renderChefChatButton() : ''}
      ${renderBottomNav()}
    </div>
  `;

  if (typeof renderChefChat === 'function') renderChefChat();
  if (state.currentView === 'batch-view') setTimeout(initBatchCardSwipe, 0);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Escape: Close modal or go back
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      if (modal && modal.style.display === 'flex') {
        closeModal();
      } else if (state.currentView !== 'recipes') {
        navigateTo('recipes');
      }
    }

    // N: New recipe (when on recipes page)
    if (e.key === 'n' && state.currentView === 'recipes') {
      openNewRecipe();
    }
  });
}

function init() {
  loadAllState();
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView && VIEW_RENDERERS[targetView]) {
    sessionStorage.removeItem('yummy_target_view');
    state.currentView = targetView;
  } else {
    state.currentView = 'recipes';
  }
  setupKeyboardShortcuts();
  render();
}

let recipesPageSearchTimeout = null;

function handleRecipesPageSearch(value) {
  state.searchTerm = value;

  if (recipesPageSearchTimeout) clearTimeout(recipesPageSearchTimeout);

  recipesPageSearchTimeout = setTimeout(() => {
    // Real-time search as user types
    const input = document.getElementById('recipesPageSearchInput');
    const cursorPos = input ? input.selectionStart : 0;

    render();

    setTimeout(() => {
      const newInput = document.getElementById('recipesPageSearchInput');
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  }, 300);
}

init();
